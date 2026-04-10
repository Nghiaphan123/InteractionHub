import { useAuth } from "../context/AuthContext";
import App from "../App";
import { useState } from "react";

export default function AuthGate() {
  const { user, login, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!user) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <div style={{
          background: "#000",
          padding: "40px",
          borderRadius: "15px",
          width: "320px",
          textAlign: "center",
        }}>
          <h2>Login</h2>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <button onClick={() => login(email, password)}>
            Login
          </button>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return <App />;
}