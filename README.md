# Modern Employee Management System

Full React + Flask + MongoDB Atlas project.

## Included

### Admin
- Admin login
- Create employee
- Read/search employees
- Update employee
- Delete employee
- Set employee Active/Inactive
- View all daily attendance
- Search attendance by employee
- Filter attendance by date

### Employee
- First-time "Create Password"
- Employee creates own password using Employee ID + registered email
- Secure password hashing
- Employee login
- Employee dashboard
- View profile
- Update email and phone
- Daily Check In
- Daily Check Out
- Login/check-in time
- Logout/check-out time
- Working-duration calculation
- Latest 31 attendance records

## Important security note

Do not put your MongoDB password inside app.py.
Use PowerShell environment variables.

If a MongoDB password has been shared publicly or pasted into a chat/code repository,
reset it in MongoDB Atlas before using this project.

## 1. MongoDB Atlas

In Atlas:
1. Create/confirm a Database Access user.
2. Copy the exact database username.
3. Set a new database password.
4. In Network Access, allow your current IP address.
5. The included app is configured for cluster0.wavwom7.mongodb.net.

## 2. Run backend

Open PowerShell in the project folder:

```powershell
cd .\backend

python -m pip install -r requirements.txt

$env:MONGO_USERNAME="YOUR_EXACT_ATLAS_DATABASE_USERNAME"
$env:MONGO_PASSWORD="YOUR_NEW_ATLAS_DATABASE_PASSWORD"
$env:JWT_SECRET="use-a-long-random-secret-here"
$env:ADMIN_PASSWORD="Admin@123"

python app.py
```

Successful output:

```text
MongoDB Atlas connected successfully!
Initial admin created: ADMIN001
Running on http://127.0.0.1:5000
```

Keep this terminal open.

## 3. Run frontend

Open a second PowerShell:

```powershell
cd .\frontend
npm install
npm run dev
```

Open the address shown by Vite, normally:

```text
http://localhost:5173
```

## 4. Admin login

Employee ID:

```text
ADMIN001
```

Password is whatever you set in ADMIN_PASSWORD before the admin is first created.

Example:

```text
Admin@123
```

## 5. Create employee

Admin -> Employees -> Add Employee.

Example:

```text
Employee ID: EMP001
Name: Abdul
Email: employee@example.com
Department: IT
Designation: Software Developer
Salary: 30000
Status: Active
```

The admin DOES NOT create or see the employee password.

## 6. Employee creates own password

Logout from Admin.

On Login page click:

```text
Create Password
```

Enter:

```text
Employee ID: EMP001
Registered Email: employee@example.com
New Password: employee's chosen password
Confirm Password: same password
```

Then return to login and sign in.

## 7. Attendance

Employee:

```text
Login
  -> Dashboard
  -> Check In
  -> login time stored
  -> Check Out
  -> logout time stored
  -> working duration calculated
```

Admin can see these records from the Attendance page.

## Database collections

The app automatically uses:

```text
employee_management
  employees
  users
  attendance
```
