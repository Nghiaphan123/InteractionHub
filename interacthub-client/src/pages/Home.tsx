import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Trang chủ</h2>
      <p>Xin chào {user?.name || "User"}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}