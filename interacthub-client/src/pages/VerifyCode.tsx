import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { verifyRecoveryCodeAPI } from "../services/authService";
import "./Login.css";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleContinue = async () => {
    const target = localStorage.getItem("selectedRecovery");

    if (!target || !code) return;

    try {
      await verifyRecoveryCodeAPI({
        value: target,
        code,
      });

      navigate("/reset-password");
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
          Nhập mã xác nhận
        </h2>

        <p style={{ marginBottom: "20px" }}>
          Nhập mã đã được gửi đến phương thức bạn chọn.
        </p>

        <input
          type="text"
          placeholder="Nhập mã"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input"
        />

        <button onClick={handleContinue} className="login-btn">
          Tiếp tục
        </button>
      </div>
    </div>
  );
}