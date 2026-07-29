import { useState } from "react";
import api from "../api";

export default function ChangePassword({ onChanged, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();

    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      onChanged();
    } catch (err) {
      setMessage(err.response?.data?.message || "Password update failed");
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <h1>Change Password</h1>
        <p>Set your password before opening the employee portal.</p>

        {message && <div className="error-box">{message}</div>}

        <input
          type="password"
          placeholder="Temporary / current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New password - minimum 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button className="primary">Update Password</button>
        <button type="button" onClick={onLogout}>Logout</button>
      </form>
    </div>
  );
}
