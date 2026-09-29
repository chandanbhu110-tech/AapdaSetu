import { useAuth } from "../contexts/AuthContext";

export default function UserDashboard() {
  const { officialProfile, signOut } = useAuth();

  return (
    <div>
      <h1>Welcome to AapdaSetu</h1>

      <p>
        Hello, {officialProfile?.full_name || "User"}
      </p>

      <p>
        You are logged in as a public user.
      </p>

      <button>
        View Live Alerts
      </button>

      <button>
        View Route Status
      </button>

      <button>
        Report an Incident
      </button>

      <button onClick={signOut}>
        Logout
      </button>
    </div>
  );
}