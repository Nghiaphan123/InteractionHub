import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { findAccountAPI, sendResetCodeAPI } from "../services/authService";
import "./Login.css";

export default function ForgotPassword() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as any;

    if (nav?.type === "reload") {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  const handleContinue = async () => {
    setError("");

    if (!input) {
      setError("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);

      const res = await findAccountAPI({ email: input });

      localStorage.setItem("recoveryInput", input);

      await sendResetCodeAPI({ email: input });
      
      localStorage.setItem("recoveryAccount", JSON.stringify(res));

      navigate("/choose-recovery");

    } catch (err: any) {
      setError(err.response?.data?.message || "Không tìm thấy tài khoản");
    } finally {
      setLoading(false);
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
          }}
        >
          <ArrowLeft size={22} />
        </button>

        <h2 style={{ marginTop: "60px", fontWeight: "700" }}>
          Tìm tài khoản của bạn
        </h2>

        <p style={{ marginBottom: "20px" }}>
          Nhập email của bạn
        </p>

        <input
          type="text"
          placeholder="Email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
        />

        {error && <p className="error-text">{error}</p>}

        <button
          onClick={handleContinue}
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Tiếp tục"}
        </button>

      </div>
    </div>
  );
}