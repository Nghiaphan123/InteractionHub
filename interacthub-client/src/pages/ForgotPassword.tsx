import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { findAccountAPI } from "../services/authService";
import "./Login.css";

export default function ForgotPassword() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!input) return;

    try {
      const account = await findAccountAPI({
        email: input,
      });

      localStorage.setItem(
        "recoveryAccount",
        JSON.stringify(account)
      );

      localStorage.setItem("recoveryInput", input);

      navigate("/choose-recovery");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ position: "relative" }}>
        <button
          onClick={() => navigate("/login")}
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
          Tìm tài khoản của bạn
        </h2>

        <p style={{ marginBottom: "20px" }}>
          Nhập số điện thoại hoặc email liên kết.
        </p>

        <input
          type="text"
          placeholder="Số điện thoại hoặc email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
        />

        <button onClick={handleContinue} className="login-btn">
          Tiếp tục
        </button>
      </div>
    </div>
  );
}