import {
  LayoutDashboard,
  UserRound,
  CalendarCheck2,
  LogOut,
  Building2,
} from "lucide-react";

export default function Sidebar({
  active,
  setActive,
  user,
  onLogout,
}) {
  const employeeItems = [
    ["dashboard", "Dashboard", <LayoutDashboard size={19} />],
    ["profile", "My Profile", <UserRound size={19} />],
    ["attendance", "Attendance", <CalendarCheck2 size={19} />],
  ];

  const adminItems = [
    ["employees", "Employees", <LayoutDashboard size={19} />],
    ["attendance", "Attendance", <CalendarCheck2 size={19} />],
  ];

  const items = user.role === "admin" ? adminItems : employeeItems;

  return (
    <aside className="sidebar">
      <div className="brand">
        <Building2 />
        <span>
          <b>EMP</b>
          <small>Management</small>
        </span>
      </div>

      <nav>
        {items.map(([key, label, icon]) => (
          <button
            key={key}
            className={active === key ? "nav-active" : ""}
            onClick={() => setActive(key)}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={onLogout}>
        <LogOut size={19} />
        Logout
      </button>
    </aside>
  );
}
