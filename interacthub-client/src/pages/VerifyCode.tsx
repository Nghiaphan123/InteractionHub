import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { verifyResetCodeAPI } from "../services/authService";
import "./Login.css";

export default function VerifyCode() {
  const [code, setCode] = useState("");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setCode(value);
  };

  const handleContinue = async () => {
    setError("");

    const target = localStorage.getItem("selectedRecovery");

    const cleanCode = code.trim();

    if (!target) {
      setError("Thiếu thông tin tài khoản");
      return;
    }

    if (cleanCode.length !== 6) {
      setError("Mã phải gồm đúng 6 chữ số");
      return;
    }

    try {
      setLoading(true);

      await verifyResetCodeAPI({
        email: target,
        code: cleanCode,
      });

      localStorage.setItem("verifyCode", cleanCode);

      navigate("/reset-password");
    } catch (err: any) {
      console.error(err);

      const message = err.response?.data?.message;

      if (message === "INVALID") {
        setError("Mã xác nhận không đúng");
        return;
      }

      if (message) {
        setError(message);
        return;
      }

    setError("Mã không đúng hoặc đã hết hạn");
    } finally {
      setLoading(false);
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
          placeholder="Nhập mã 6 số"
          value={code}
          onChange={handleChange}
          className="input"
          inputMode="numeric"
          maxLength={6}
        />

        {error && <p className="error-text">{error}</p>}

        <button
          onClick={handleContinue}
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Đang xác thực..." : "Tiếp tục"}
        </button>
      </div>
    </div>
  );
}