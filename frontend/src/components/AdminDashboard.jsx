import { useEffect, useState } from "react";
import {
  CalendarCheck2,
  Menu,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Sidebar from "./Sidebar";
import api from "../api";

const blank = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  salary: "",
  status: "Active",
};

export default function AdminDashboard({ user, onLogout }) {
  const [active, setActive] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [form, setForm] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (active === "employees") loadEmployees();
    if (active === "attendance") loadAttendance();
  }, [active, search, date]);

  async function loadEmployees() {
    try {
      const response = await api.get("/employees", {
        params: { search },
      });
      setEmployees(response.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load employees");
    }
  }

  async function loadAttendance() {
    try {
      const response = await api.get("/admin/attendance", {
        params: { search, date },
      });
      setAttendance(response.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load attendance");
    }
  }

  async function saveEmployee(e) {
    e.preventDefault();

    try {
      if (form._id) {
        await api.put(`/employees/${form._id}`, form);
        setMessage("Employee updated successfully");
      } else {
        const response = await api.post("/employees", form);
        setMessage(response.data.message);
      }

      setForm(null);
      loadEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save employee");
    }
  }

  async function removeEmployee(id) {
    if (!window.confirm("Delete this employee and login account?")) return;

    try {
      await api.delete(`/employees/${id}`);
      loadEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div className="app-shell">
      <div className={mobile ? "sidebar-mobile open" : "sidebar-mobile"}>
        <Sidebar
          active={active}
          setActive={(value) => {
            setActive(value);
            setMobile(false);
            setSearch("");
          }}
          user={user}
          onLogout={onLogout}
        />
      </div>

      <Sidebar
        active={active}
        setActive={(value) => {
          setActive(value);
          setSearch("");
        }}
        user={user}
        onLogout={onLogout}
      />

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>

          <div>
            <p className="crumb">Admin Portal</p>
            <h1>
              {active === "employees"
                ? "Employee Management"
                : "Attendance Report"}
            </h1>
          </div>
        </header>

        {message && <div className="info-message">{message}</div>}

        {active === "employees" ? (
          <>
            <section className="admin-summary">
              <div>
                <Users />
                <span>
                  <small>Total Employees</small>
                  <b>{employees.length}</b>
                </span>
              </div>

              <button
                className="primary"
                onClick={() => setForm({ ...blank })}
              >
                <Plus size={18} />
                Add Employee
              </button>
            </section>

            <section className="panel">
              <div className="toolbar">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    placeholder="Search employee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee._id}>
                        <td>{employee.employeeId}</td>
                        <td>{employee.name}</td>
                        <td>{employee.department}</td>
                        <td>{employee.designation}</td>
                        <td>{employee.email}</td>
                        <td>{employee.status}</td>
                        <td>
                          <button onClick={() => setForm({ ...employee })}>
                            Edit
                          </button>

                          <button
                            className="danger"
                            onClick={() => removeEmployee(employee._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Daily Employee Attendance</h2>
                <p>Login, logout and total working time.</p>
              </div>
              <CalendarCheck2 />
            </div>

            <div className="attendance-filters">
              <div className="search-box">
                <Search size={18} />
                <input
                  placeholder="Employee ID or name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              {(date || search) && (
                <button
                  onClick={() => {
                    setDate("");
                    setSearch("");
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Login</th>
                    <th>Logout</th>
                    <th>Working Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((row) => (
                      <tr key={row._id}>
                        <td>{row.date}</td>
                        <td>{row.employeeId}</td>
                        <td>{row.employeeName}</td>
                        <td>{row.loginTime || "—"}</td>
                        <td>{row.logoutTime || "—"}</td>
                        <td>{formatMinutes(row.workingMinutes)}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {form && (
          <div className="modal-backdrop">
            <form className="modal-card" onSubmit={saveEmployee}>
              <h2>{form._id ? "Update Employee" : "Create Employee"}</h2>

              <div className="form-grid">
                {[
                  ["employeeId", "Employee ID"],
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["department", "Department"],
                  ["designation", "Designation"],
                  ["salary", "Salary"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      disabled={form._id && key === "employeeId"}
                      type={
                        key === "email"
                          ? "email"
                          : key === "salary"
                          ? "number"
                          : "text"
                      }
                      value={form[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]: e.target.value,
                        })
                      }
                      required={!["phone", "salary"].includes(key)}
                    />
                  </label>
                ))}

                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
              </div>

              <div className="button-row">
                <button type="button" onClick={() => setForm(null)}>
                  Cancel
                </button>
                <button className="primary">Save Employee</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function formatMinutes(minutes = 0) {
  const value = Number(minutes) || 0;
  return `${Math.floor(value / 60)}h ${value % 60}m`;
}
