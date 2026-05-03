import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { resetPasswordAPI } from "../services/authService";
import "./Login.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleReset = async () => {
    setError("");

    if (!password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    const email = localStorage.getItem("selectedRecovery") || "";
    const code = localStorage.getItem("verifyCode") || "";

    if (!email || !code) {
      setError("Thiếu mã xác thực, vui lòng quay lại bước trước");
      return;
    }

    try {
      setLoading(true);

      await resetPasswordAPI({
        email,
        code,
        newPassword: password,
      });

      localStorage.removeItem("selectedRecovery");
      localStorage.removeItem("verifyCode");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      console.log("RESET ERROR:", err);

      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.Password?.[0];

      if (apiMessage) {
        if (apiMessage.includes("non alphanumeric")) {
          setError("Mật khẩu phải có ký tự đặc biệt (vd: @, #, !)");
        } else if (apiMessage.includes("FAIL")) {
          setError("Không thể đổi mật khẩu, vui lòng thử lại");
        } else {
          setError(apiMessage);
        }
      } else {
        setError("Đổi mật khẩu thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const Eye = ({ open }: { open: boolean }) =>
    open ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" />
        <path d="M10.58 10.58A2 2 0 0013.42 13.42" stroke="currentColor" strokeWidth="2"/>
        <path d="M9.88 5.08A10.94 10.94 0 0121 12" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 12a10.94 10.94 0 005.12 6.92" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M1 12C1 12 5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    );

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

        {/* PASSWORD */}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />

          {password && (
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Eye open={showPassword} />
            </span>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
          />

          {confirmPassword && (
            <span
              className="eye-icon"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              <Eye open={showConfirmPassword} />
            </span>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          onClick={handleReset}
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </div>
    </div>
  );
}