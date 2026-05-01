import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { resetPasswordAPI } from "../services/authService";
import "./Login.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleReset = async () => {
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) return;

    const value = localStorage.getItem("selectedRecovery") || "";
    const code = localStorage.getItem("verifyCode") || "";

    if (!value || !code) return;

    try {
      await resetPasswordAPI({
        value,
        code,
        newPassword: password,
      });

      localStorage.removeItem("recoveryAccount");
      localStorage.removeItem("selectedRecovery");
      localStorage.removeItem("verifyCode");

      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ position: "relative" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "40px",
            height: "40px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={22} />
        </button>

        <h2 style={{ marginTop: "60px", fontWeight: "700" }}>
          Đặt lại mật khẩu
        </h2>

        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input"
        />

        <button onClick={handleReset} className="login-btn">
          Đổi mật khẩu
        </button>
      </div>
    </div>
  );
}