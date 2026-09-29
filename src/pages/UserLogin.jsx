import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function UserLogin({ onSuccess }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOGIN / REGISTER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      // =========================
      // REGISTER
      // =========================

      if (mode === "register") {
        if (!name.trim()) {
          throw new Error("Please enter your full name.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              role: "public_user",
            },
          },
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setMessage(
            "Account created successfully. Please verify your email before logging in."
          );

          setMode("login");
          setPassword("");
          return;
        }

        if (onSuccess) {
          onSuccess();
        }

        return;
      }

      // =========================
      // LOGIN
      // =========================

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Login failed. Please try again.");
      }

      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================
  // FORGOT PASSWORD
  // =========================

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl =
        `${window.location.origin}${import.meta.env.BASE_URL}reset-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: redirectUrl,
          }
        );

      if (error) {
        throw error;
      }

      setMessage(
        "Password reset link has been sent to your email. Please check your inbox."
      );

    } catch (err) {
      setError(
        err.message ||
        "Unable to send password reset email."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================
  // SWITCH LOGIN / REGISTER
  // =========================

  const switchMode = () => {
    setMode(
      mode === "login"
        ? "register"
        : "login"
    );

    setError("");
    setMessage("");
    setPassword("");
  };


  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "40px auto",
        padding: "30px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >

      {/* TITLE */}

      <h1
        style={{
          marginBottom: "8px",
          color: "#0f172a",
        }}
      >
        {mode === "login"
          ? "Public User Login"
          : "Create Public Account"}
      </h1>

      <p
        style={{
          color: "#64748b",
          marginBottom: "25px",
        }}
      >
        {mode === "login"
          ? "Login to access AapdaSetu public services."
          : "Create an account to use AapdaSetu public services."}
      </p>


      {/* FORM */}

      <form onSubmit={handleSubmit}>

        {/* NAME */}

        {mode === "register" && (
          <div style={{ marginBottom: "16px" }}>

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your full name"
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
        )}


        {/* EMAIL */}

        <div style={{ marginBottom: "16px" }}>

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
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


        {/* PASSWORD */}

        <div style={{ marginBottom: "16px" }}>

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            required
            minLength={6}
            style={{
              width: "100%",
              padding: "11px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              boxSizing: "border-box",
            }}
          />

        </div>


        {/* ERROR */}

        {error && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "7px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}


        {/* SUCCESS MESSAGE */}

        {message && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "7px",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}


        {/* LOGIN / REGISTER BUTTON */}

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
            ? "Please wait..."
            : mode === "login"
            ? "Login"
            : "Create Account"}
        </button>

      </form>


      {/* FORGOT PASSWORD */}

      {mode === "login" && (
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loading}
          style={{
            display: "block",
            width: "100%",
            marginTop: "12px",
            padding: "8px",
            border: "none",
            background: "transparent",
            color: "#0284c7",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Forgot Password?
        </button>
      )}


      {/* SWITCH LOGIN / REGISTER */}

      <button
        type="button"
        onClick={switchMode}
        style={{
          width: "100%",
          marginTop: "8px",
          padding: "11px",
          border: "1px solid #cbd5e1",
          borderRadius: "7px",
          background: "#ffffff",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        {mode === "login"
          ? "Create New Account"
          : "Already have an account? Login"}
      </button>

    </div>
  );
}