import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function ResetPassword({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setMessage(
        "Password updated successfully. You can now login with your new password."
      );

      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      setError(
        err.message || "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "60px auto",
        padding: "30px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <h1 style={{ color: "#0f172a" }}>
        Create New Password
      </h1>

      <p style={{ color: "#64748b" }}>
        Enter a new password for your AapdaSetu account.
      </p>

      <form onSubmit={handleResetPassword}>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            New Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter new password"
            minLength={6}
            required
            style={{
              width: "100%",
              padding: "11px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm new password"
            minLength={6}
            required
            style={{
              width: "100%",
              padding: "11px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "7px",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "7px",
            }}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "7px",
            background: "#0284c7",
            color: "#ffffff",
            fontWeight: "600",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Updating..."
            : "Create New Password"}
        </button>

      </form>

      {message && (
        <button
          onClick={onSuccess}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "11px",
            border: "1px solid #cbd5e1",
            borderRadius: "7px",
            background: "#ffffff",
            cursor: "pointer",
          }}
        >
          Go to Login
        </button>
      )}

    </div>
  );
}