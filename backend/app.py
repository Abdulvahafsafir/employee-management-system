import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from urllib.parse import quote_plus

import jwt
from bson import ObjectId
from bson.errors import InvalidId
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError, PyMongoError
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# =========================================================
# CONFIG
# =========================================================
MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")

if not MONGO_USERNAME or not MONGO_PASSWORD:
    raise RuntimeError(
        "MONGO_USERNAME and MONGO_PASSWORD environment variables are required"
    )

MONGO_URI = (
    f"mongodb+srv://{quote_plus(MONGO_USERNAME)}:{quote_plus(MONGO_PASSWORD)}"
    "@cluster0.wavwom7.mongodb.net/"
    "?retryWrites=true&w=majority&appName=Cluster0"
)

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    client.admin.command("ping")
    print("MongoDB Atlas connected successfully!")
except PyMongoError as error:
    print("MongoDB Atlas connection failed:", error)
    raise

db = client["employee_management"]
employees = db["employees"]
users = db["users"]
attendance = db["attendance"]

employees.create_index([("employeeId", ASCENDING)], unique=True)
employees.create_index([("email", ASCENDING)], unique=True)
users.create_index([("employeeId", ASCENDING)], unique=True)
attendance.create_index(
    [("employeeId", ASCENDING), ("date", ASCENDING)],
    unique=True
)


# =========================================================
# HELPERS
# =========================================================
def now_local():
    return datetime.now()


def serialize_employee(employee):
    return {
        "_id": str(employee["_id"]),
        "employeeId": employee.get("employeeId", ""),
        "name": employee.get("name", ""),
        "email": employee.get("email", ""),
        "phone": employee.get("phone", ""),
        "department": employee.get("department", ""),
        "designation": employee.get("designation", ""),
        "salary": employee.get("salary", 0),
        "status": employee.get("status", "Active"),
    }


def serialize_attendance(record):
    return {
        "_id": str(record["_id"]),
        "employeeId": record.get("employeeId", ""),
        "employeeName": record.get("employeeName", ""),
        "date": record.get("date", ""),
        "loginTime": record.get("loginTime"),
        "logoutTime": record.get("logoutTime"),
        "workingMinutes": record.get("workingMinutes", 0),
        "status": record.get("status", "Present"),
    }


def create_token(user):
    payload = {
        "sub": str(user["_id"]),
        "employeeId": user["employeeId"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def auth(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            header = request.headers.get("Authorization", "")

            if not header.startswith("Bearer "):
                return jsonify({"message": "Authentication required"}), 401

            try:
                payload = jwt.decode(
                    header[7:],
                    JWT_SECRET,
                    algorithms=["HS256"],
                )
            except jwt.PyJWTError:
                return jsonify({"message": "Invalid or expired login"}), 401

            if roles and payload.get("role") not in roles:
                return jsonify({"message": "Permission denied"}), 403

            request.user = payload
            return fn(*args, **kwargs)

        return wrapper
    return decorator


def ensure_admin():
    admin = users.find_one({"employeeId": "ADMIN001"})

    if admin:
        return

    users.insert_one({
        "employeeId": "ADMIN001",
        "passwordHash": generate_password_hash(ADMIN_PASSWORD),
        "passwordCreated": True,
        "role": "admin",
    })

    print("Initial admin created: ADMIN001")


ensure_admin()


# =========================================================
# HOME / AUTH
# =========================================================
@app.get("/")
def home():
    return jsonify({"message": "Employee Management API is running"})


@app.post("/auth/create-password")
def create_employee_password():
    data = request.get_json(silent=True) or {}

    employee_id = str(data.get("employeeId", "")).strip().upper()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    confirm_password = str(data.get("confirmPassword", ""))

    if not employee_id or not email:
        return jsonify({
            "message": "Employee ID and registered email are required"
        }), 400

    if len(password) < 8:
        return jsonify({
            "message": "Password must be at least 8 characters"
        }), 400

    if password != confirm_password:
        return jsonify({"message": "Passwords do not match"}), 400

    employee = employees.find_one({
        "employeeId": employee_id,
        "email": email,
    })

    if not employee:
        return jsonify({
            "message": "Employee ID and registered email do not match"
        }), 404

    if employee.get("status") != "Active":
        return jsonify({"message": "Employee account is inactive"}), 403

    user = users.find_one({
        "employeeId": employee_id,
        "role": "employee",
    })

    if not user:
        return jsonify({"message": "Employee login account not found"}), 404

    if user.get("passwordCreated"):
        return jsonify({
            "message": "Password already created. Please login."
        }), 409

    users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "passwordHash": generate_password_hash(password),
            "passwordCreated": True,
        }},
    )

    return jsonify({
        "message": "Password created successfully. You can now login."
    })


@app.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    employee_id = str(data.get("employeeId", "")).strip().upper()
    password = str(data.get("password", ""))

    user = users.find_one({"employeeId": employee_id})

    if not user:
        return jsonify({"message": "Invalid Employee ID or password"}), 401

    if user.get("role") == "employee" and not user.get("passwordCreated"):
        return jsonify({
            "message": "First-time employee: create your password first",
            "passwordNotCreated": True,
        }), 403

    password_hash = user.get("passwordHash")

    if not password_hash or not check_password_hash(password_hash, password):
        return jsonify({"message": "Invalid Employee ID or password"}), 401

    if user["role"] == "employee":
        employee = employees.find_one({"employeeId": employee_id})

        if not employee or employee.get("status") != "Active":
            return jsonify({"message": "Employee account is inactive"}), 403

    return jsonify({
        "token": create_token(user),
        "role": user["role"],
        "employeeId": user["employeeId"],
    })


# =========================================================
# ADMIN - EMPLOYEE CRUD
# =========================================================
@app.get("/employees")
@auth("admin")
def get_employees():
    search = request.args.get("search", "").strip()
    query = {}

    if search:
        query = {
            "$or": [
                {field: {"$regex": search, "$options": "i"}}
                for field in [
                    "employeeId",
                    "name",
                    "email",
                    "department",
                    "designation",
                    "status",
                ]
            ]
        }

    data = [
        serialize_employee(item)
        for item in employees.find(query).sort("_id", DESCENDING)
    ]
    return jsonify(data)


@app.post("/employees")
@auth("admin")
def add_employee():
    data = request.get_json(silent=True) or {}

    required = [
        "employeeId",
        "name",
        "email",
        "department",
        "designation",
    ]

    for field in required:
        if not str(data.get(field, "")).strip():
            return jsonify({"message": f"{field} is required"}), 400

    employee_id = str(data["employeeId"]).strip().upper()

    try:
        salary = float(data.get("salary") or 0)
    except (TypeError, ValueError):
        return jsonify({"message": "Salary must be a valid number"}), 400

    employee = {
        "employeeId": employee_id,
        "name": str(data["name"]).strip(),
        "email": str(data["email"]).strip().lower(),
        "phone": str(data.get("phone", "")).strip(),
        "department": str(data["department"]).strip(),
        "designation": str(data["designation"]).strip(),
        "salary": salary,
        "status": str(data.get("status", "Active")).strip() or "Active",
    }

    try:
        result = employees.insert_one(employee)

        try:
            users.insert_one({
                "employeeId": employee_id,
                "passwordHash": None,
                "passwordCreated": False,
                "role": "employee",
            })
        except Exception:
            employees.delete_one({"_id": result.inserted_id})
            raise

    except DuplicateKeyError:
        return jsonify({
            "message": "Employee ID or email already exists"
        }), 409

    created = employees.find_one({"_id": result.inserted_id})

    return jsonify({
        "message": (
            "Employee created. The employee can now create their own "
            "password using Employee ID and registered email."
        ),
        "employee": serialize_employee(created),
    }), 201


@app.put("/employees/<record_id>")
@auth("admin")
def update_employee(record_id):
    try:
        oid = ObjectId(record_id)
    except InvalidId:
        return jsonify({"message": "Invalid employee record ID"}), 400

    current = employees.find_one({"_id": oid})

    if not current:
        return jsonify({"message": "Employee not found"}), 404

    data = request.get_json(silent=True) or {}

    try:
        salary = float(
            data.get("salary", current.get("salary", 0)) or 0
        )
    except (TypeError, ValueError):
        return jsonify({"message": "Salary must be a valid number"}), 400

    updated = {
        "name": str(data.get("name", current.get("name", ""))).strip(),
        "email": str(
            data.get("email", current.get("email", ""))
        ).strip().lower(),
        "phone": str(data.get("phone", current.get("phone", ""))).strip(),
        "department": str(
            data.get("department", current.get("department", ""))
        ).strip(),
        "designation": str(
            data.get("designation", current.get("designation", ""))
        ).strip(),
        "salary": salary,
        "status": str(
            data.get("status", current.get("status", "Active"))
        ).strip(),
    }

    try:
        employees.update_one({"_id": oid}, {"$set": updated})
    except DuplicateKeyError:
        return jsonify({"message": "Email already exists"}), 409

    return jsonify({"message": "Employee updated successfully"})


@app.delete("/employees/<record_id>")
@auth("admin")
def delete_employee(record_id):
    try:
        oid = ObjectId(record_id)
    except InvalidId:
        return jsonify({"message": "Invalid employee record ID"}), 400

    employee = employees.find_one({"_id": oid})

    if not employee:
        return jsonify({"message": "Employee not found"}), 404

    employees.delete_one({"_id": oid})
    users.delete_one({
        "employeeId": employee["employeeId"],
        "role": "employee",
    })

    return jsonify({
        "message": "Employee and employee login deleted successfully"
    })


# =========================================================
# EMPLOYEE PROFILE
# =========================================================
@app.get("/employee/profile")
@auth("employee")
def employee_profile():
    employee = employees.find_one({
        "employeeId": request.user["employeeId"]
    })

    if not employee:
        return jsonify({"message": "Employee not found"}), 404

    return jsonify(serialize_employee(employee))


@app.put("/employee/profile")
@auth("employee")
def update_employee_profile():
    data = request.get_json(silent=True) or {}
    updated = {}

    if "email" in data:
        updated["email"] = str(data["email"]).strip().lower()

    if "phone" in data:
        updated["phone"] = str(data["phone"]).strip()

    if not updated:
        return jsonify({
            "message": "You can update only email and phone"
        }), 400

    try:
        employees.update_one(
            {"employeeId": request.user["employeeId"]},
            {"$set": updated},
        )
    except DuplicateKeyError:
        return jsonify({"message": "Email already exists"}), 409

    return jsonify({"message": "Profile updated successfully"})


# =========================================================
# ATTENDANCE
# =========================================================
@app.post("/attendance/check-in")
@auth("employee")
def check_in():
    employee_id = request.user["employeeId"]
    employee = employees.find_one({"employeeId": employee_id})

    if not employee:
        return jsonify({"message": "Employee not found"}), 404

    now = now_local()
    today = now.strftime("%Y-%m-%d")

    existing = attendance.find_one({
        "employeeId": employee_id,
        "date": today,
    })

    if existing:
        return jsonify({
            "message": "You have already checked in today",
            "attendance": serialize_attendance(existing),
        })

    record = {
        "employeeId": employee_id,
        "employeeName": employee["name"],
        "date": today,
        "loginTime": now.strftime("%H:%M:%S"),
        "logoutTime": None,
        "workingMinutes": 0,
        "status": "Present",
    }

    result = attendance.insert_one(record)
    record["_id"] = result.inserted_id

    return jsonify({
        "message": "Check-in recorded successfully",
        "attendance": serialize_attendance(record),
    }), 201


@app.post("/attendance/check-out")
@auth("employee")
def check_out():
    employee_id = request.user["employeeId"]
    now = now_local()
    today = now.strftime("%Y-%m-%d")

    record = attendance.find_one({
        "employeeId": employee_id,
        "date": today,
    })

    if not record:
        return jsonify({
            "message": "Please check in before checking out"
        }), 400

    if record.get("logoutTime"):
        return jsonify({
            "message": "You have already checked out today",
            "attendance": serialize_attendance(record),
        })

    login_dt = datetime.strptime(
        f"{today} {record['loginTime']}",
        "%Y-%m-%d %H:%M:%S",
    )

    working_minutes = max(
        0,
        int((now - login_dt).total_seconds() // 60),
    )

    attendance.update_one(
        {"_id": record["_id"]},
        {"$set": {
            "logoutTime": now.strftime("%H:%M:%S"),
            "workingMinutes": working_minutes,
        }},
    )

    updated = attendance.find_one({"_id": record["_id"]})

    return jsonify({
        "message": "Check-out recorded successfully",
        "attendance": serialize_attendance(updated),
    })


@app.get("/attendance/today")
@auth("employee")
def today_attendance():
    today = now_local().strftime("%Y-%m-%d")

    record = attendance.find_one({
        "employeeId": request.user["employeeId"],
        "date": today,
    })

    if not record:
        return jsonify({
            "date": today,
            "loginTime": None,
            "logoutTime": None,
            "workingMinutes": 0,
            "status": "Not Checked In",
        })

    result = serialize_attendance(record)

    if record.get("loginTime") and not record.get("logoutTime"):
        login_dt = datetime.strptime(
            f"{today} {record['loginTime']}",
            "%Y-%m-%d %H:%M:%S",
        )

        result["workingMinutes"] = max(
            0,
            int((now_local() - login_dt).total_seconds() // 60),
        )

    return jsonify(result)


@app.get("/attendance/history")
@auth("employee")
def attendance_history():
    records = attendance.find({
        "employeeId": request.user["employeeId"]
    }).sort("date", DESCENDING).limit(31)

    return jsonify([
        serialize_attendance(record)
        for record in records
    ])


@app.get("/admin/attendance")
@auth("admin")
def admin_attendance():
    date = request.args.get("date", "").strip()
    search = request.args.get("search", "").strip()

    query = {}

    if date:
        query["date"] = date

    if search:
        query["$or"] = [
            {"employeeId": {"$regex": search, "$options": "i"}},
            {"employeeName": {"$regex": search, "$options": "i"}},
        ]

    records = attendance.find(query).sort([
        ("date", DESCENDING),
        ("loginTime", DESCENDING),
    ])

    return jsonify([
        serialize_attendance(record)
        for record in records
    ])


if __name__ == "__main__":
    app.run(debug=True, port=5000)
