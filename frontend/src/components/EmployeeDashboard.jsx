import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Mail,
  Phone,
  BriefcaseBusiness,
  BadgeIndianRupee,
  Menu,
  ChevronRight,
  UserRound,
  Clock3,
  LogIn,
  LogOut,
  CalendarCheck2,
} from "lucide-react";
import Sidebar from "./Sidebar";
import api from "../api";

export default function EmployeeDashboard({ user, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [profile, setProfile] = useState(user);
  const [mobile, setMobile] = useState(false);
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [profileEdit, setProfileEdit] = useState(false);

  useEffect(() => {
    loadProfile();
    loadAttendance();
  }, [user.employeeId]);

  async function loadProfile() {
    try {
      const response = await api.get("/employee/profile");
      setProfile({ ...user, ...response.data });
    } catch {
      // Keep login user data if profile load fails.
    }
  }

  async function loadAttendance() {
    try {
      const [todayResponse, historyResponse] = await Promise.all([
        api.get("/attendance/today"),
        api.get("/attendance/history"),
      ]);

      setToday(todayResponse.data);
      setHistory(historyResponse.data);
    } catch (err) {
      setAttendanceMessage(
        err.response?.data?.message || "Unable to load attendance"
      );
    }
  }

  async function checkIn() {
    setAttendanceMessage("");

    try {
      const response = await api.post("/attendance/check-in");
      setAttendanceMessage(response.data.message);
      await loadAttendance();
    } catch (err) {
      setAttendanceMessage(
        err.response?.data?.message || "Check-in failed"
      );
    }
  }

  async function checkOut() {
    setAttendanceMessage("");

    try {
      const response = await api.post("/attendance/check-out");
      setAttendanceMessage(response.data.message);
      await loadAttendance();
    } catch (err) {
      setAttendanceMessage(
        err.response?.data?.message || "Check-out failed"
      );
    }
  }

  async function updateProfile() {
    try {
      await api.put("/employee/profile", {
        email: profile.email,
        phone: profile.phone,
      });

      setProfileEdit(false);
      await loadProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Profile update failed");
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
          }}
          user={user}
          onLogout={onLogout}
        />
      </div>

      <Sidebar
        active={active}
        setActive={setActive}
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
            <p className="crumb">
              Employee Portal <ChevronRight size={14} /> {active}
            </p>

            <h1>
              {active === "dashboard"
                ? `Welcome, ${profile.name?.split(" ")[0] || "Employee"}`
                : active === "attendance"
                ? "Daily Attendance"
                : "My Profile"}
            </h1>
          </div>

          <div className="top-actions">
            <button className="round-btn">
              <Bell size={19} />
            </button>

            <div className="top-profile">
              <div className="avatar">
                {profile.name?.[0] || "E"}
              </div>

              <span>
                <b>{profile.name}</b>
                <small>{profile.employeeId}</small>
              </span>
            </div>
          </div>
        </header>

        {active === "dashboard" && (
          <>
            <section className="employee-welcome">
              <div>
                <span>EMPLOYEE PORTAL</span>
                <h2>Have a productive day.</h2>
                <p>
                  Your personal workspace keeps your employment and
                  daily attendance details organised.
                </p>
              </div>
              <CalendarDays size={72} />
            </section>

            <section className="stats-grid employee-stats">
              <Info
                icon={<BriefcaseBusiness />}
                label="Department"
                value={profile.department || "—"}
              />

              <Info
                icon={<UserRound />}
                label="Designation"
                value={profile.designation || "—"}
              />

              <Info
                icon={<BadgeIndianRupee />}
                label="Monthly Salary"
                value={
                  profile.salary
                    ? `₹${Number(profile.salary).toLocaleString("en-IN")}`
                    : "—"
                }
              />

              <Info
                icon={<Clock3 />}
                label="Today's Work"
                value={formatMinutes(today?.workingMinutes || 0)}
              />
            </section>

            <AttendanceToday
              today={today}
              message={attendanceMessage}
              checkIn={checkIn}
              checkOut={checkOut}
            />

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>My Information</h2>
                  <p>Your current employee details.</p>
                </div>
              </div>

              <div className="details-grid">
                <Detail icon={<Mail />} label="Email" value={profile.email} />
                <Detail
                  icon={<Phone />}
                  label="Phone"
                  value={profile.phone || "Not provided"}
                />
                <Detail
                  icon={<BriefcaseBusiness />}
                  label="Department"
                  value={profile.department}
                />
                <Detail
                  icon={<UserRound />}
                  label="Employee ID"
                  value={profile.employeeId}
                />
              </div>
            </section>
          </>
        )}

        {active === "profile" && (
          <section className="panel profile-page">
            <div className="profile-hero">
              <div className="big-avatar">{profile.name?.[0]}</div>

              <div>
                <span className="status active">
                  <i />
                  {profile.status || "Active"}
                </span>

                <h2>{profile.name}</h2>
                <p>
                  {profile.designation} · {profile.department}
                </p>
              </div>
            </div>

            <div className="profile-form">
              <label>
                Email
                <input
                  disabled={!profileEdit}
                  value={profile.email || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Phone
                <input
                  disabled={!profileEdit}
                  value={profile.phone || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Department
                <input disabled value={profile.department || ""} />
              </label>

              <label>
                Employee ID
                <input disabled value={profile.employeeId || ""} />
              </label>
            </div>

            <div className="button-row">
              {profileEdit ? (
                <>
                  <button
                    onClick={() => {
                      setProfileEdit(false);
                      loadProfile();
                    }}
                  >
                    Cancel
                  </button>

                  <button className="primary" onClick={updateProfile}>
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  className="primary"
                  onClick={() => setProfileEdit(true)}
                >
                  Update Email / Phone
                </button>
              )}
            </div>
          </section>
        )}

        {active === "attendance" && (
          <>
            <AttendanceToday
              today={today}
              message={attendanceMessage}
              checkIn={checkIn}
              checkOut={checkOut}
            />

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Attendance History</h2>
                  <p>Your latest 31 daily attendance records.</p>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Login</th>
                      <th>Logout</th>
                      <th>Working Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty">
                          No attendance records yet.
                        </td>
                      </tr>
                    ) : (
                      history.map((row) => (
                        <tr key={row._id}>
                          <td>{formatDate(row.date)}</td>
                          <td>{formatTime(row.loginTime)}</td>
                          <td>{formatTime(row.logoutTime)}</td>
                          <td>{formatMinutes(row.workingMinutes)}</td>
                          <td>
                            <span className="attendance-status">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function AttendanceToday({
  today,
  message,
  checkIn,
  checkOut,
}) {
  const checkedIn = Boolean(today?.loginTime);
  const checkedOut = Boolean(today?.logoutTime);

  return (
    <section className="panel attendance-panel">
      <div className="panel-head">
        <div>
          <h2>Today's Attendance</h2>
          <p>
            Check in when you start work and check out when you finish.
          </p>
        </div>

        <CalendarCheck2 />
      </div>

      {message && <div className="info-message">{message}</div>}

      <div className="attendance-cards">
        <AttendanceValue
          icon={<CalendarDays />}
          label="Date"
          value={formatDate(today?.date)}
        />

        <AttendanceValue
          icon={<LogIn />}
          label="Login Time"
          value={formatTime(today?.loginTime)}
        />

        <AttendanceValue
          icon={<LogOut />}
          label="Logout Time"
          value={formatTime(today?.logoutTime)}
        />

        <AttendanceValue
          icon={<Clock3 />}
          label="Working Time"
          value={formatMinutes(today?.workingMinutes || 0)}
        />
      </div>

      <div className="attendance-actions">
        {!checkedIn && (
          <button className="primary" onClick={checkIn}>
            <LogIn size={18} />
            Check In
          </button>
        )}

        {checkedIn && !checkedOut && (
          <button className="checkout-btn" onClick={checkOut}>
            <LogOut size={18} />
            Check Out
          </button>
        )}

        {checkedOut && (
          <span className="completed">
            ✓ Today's attendance completed
          </span>
        )}
      </div>
    </section>
  );
}

function AttendanceValue({ icon, label, value }) {
  return (
    <div className="attendance-value">
      <div>{icon}</div>
      <span>
        <small>{label}</small>
        <b>{value || "—"}</b>
      </span>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h3 className="small-value">{value}</h3>
        <small>Employee information</small>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="detail-card">
      <div>{icon}</div>
      <span>
        <small>{label}</small>
        <b>{value || "—"}</b>
      </span>
    </div>
  );
}

function formatMinutes(minutes = 0) {
  const value = Number(minutes) || 0;
  const hours = Math.floor(value / 60);
  const mins = value % 60;

  if (!hours) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function formatTime(value) {
  if (!value) return "—";

  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
