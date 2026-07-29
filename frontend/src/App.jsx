import { useState } from "react";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";

export default function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  function onLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  }

  function onLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={onLogin} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard user={user} onLogout={onLogout} />;
  }

  return <EmployeeDashboard user={user} onLogout={onLogout} />;
}
