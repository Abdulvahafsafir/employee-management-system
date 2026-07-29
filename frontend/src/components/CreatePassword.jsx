import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import api from "../api";

export default function CreatePassword({ onBack }) {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/create-password", {
        employeeId,
        email,
        password,
        confirmPassword,
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        onBack();
      }, 1400);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create your password"
      );
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
            <span className="eyebrow">FIRST-TIME ACCESS</span>
            <h2>Create your own secure password.</h2>
            <p>
              Use the Employee ID and email registered by your administrator.
              Your password is stored securely as a hash.
            </p>
          </div>
        </section>

        <form className="login-card" onSubmit={submit}>
          <button type="button" className="back-button" onClick={onBack}>
            <ArrowLeft size={17} />
            Back to login
          </button>

          <div className="login-logo">
            <LockKeyhole />
          </div>

          <h1>Create Password</h1>
          <p>Verify your employee record and choose your password.</p>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <label>
            Employee ID
            <div className="input-icon">
              <UserRound size={18} />
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP001"
                required
              />
            </div>
          </label>

          <label>
            Registered Email
            <div className="input-icon">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@example.com"
                required
              />
            </div>
          </label>

          <label>
            New Password
            <div className="input-icon">
              <LockKeyhole size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                minLength="8"
                required
              />
            </div>
          </label>

          <label>
            Confirm Password
            <div className="input-icon">
              <LockKeyhole size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter the password again"
                minLength="8"
                required
              />
            </div>
          </label>

          <button className="primary wide" disabled={loading}>
            {loading ? "Creating..." : "Create My Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
