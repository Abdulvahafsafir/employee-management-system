import { useState } from "react";
import {
  Building2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import api from "../api";
import CreatePassword from "./CreatePassword";

export default function Login({ onLogin }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [createPassword, setCreatePassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (createPassword) {
    return (
      <CreatePassword
        onBack={() => {
          setCreatePassword(false);
          setError("");
        }}
      />
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        employeeId,
        password,
      });

      onLogin(response.data);
    } catch (err) {
      const data = err.response?.data;

      setError(data?.message || "Login failed");

      if (data?.passwordNotCreated) {
        setTimeout(() => setCreatePassword(true), 700);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="auth-layout">
        <section className="auth-brand-panel">
          <div className="auth-brand">
            <Building2 />
            <b>EMP</b>
          </div>

          <div>
            <span className="eyebrow">EMPLOYEE MANAGEMENT</span>
            <h2>One workspace for your people and attendance.</h2>
            <p>
              Manage employee records, secure employee access and daily
              check-in/check-out from a modern dashboard.
            </p>
          </div>

          <div className="auth-feature">
            <ShieldCheck />
            <span>
              <b>Secure employee access</b>
              <small>Employees create their own passwords.</small>
            </span>
          </div>
        </section>

        <form className="login-card" onSubmit={submit}>
          <div className="login-logo">
            <Building2 />
          </div>

          <div>
            <h1>Welcome back</h1>
            <p>Login to your Admin or Employee Portal.</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <label>
            Employee ID
            <div className="input-icon">
              <UserRound size={18} />
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP001 / ADMIN001"
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-icon">
              <LockKeyhole size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </label>

          <button className="primary wide" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="first-time-box">
            <span>
              <b>First time employee?</b>
              <small>Create your password using your Employee ID and email.</small>
            </span>

            <button
              type="button"
              className="create-password-btn"
              onClick={() => setCreatePassword(true)}
            >
              Create Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
