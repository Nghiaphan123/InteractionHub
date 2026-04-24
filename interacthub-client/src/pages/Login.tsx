import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Register from "./Register";
import "./Login.css";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmailOrPhone = (value: string) => {
    if (!value) return "Vui lòng nhập email hoặc số điện thoại";

    const isEmail = value.includes("@");

    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Thông tin không hợp lệ";
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) return "Thông tin không hợp lệ";
    }

    return "";
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    const emailErr = validateEmailOrPhone(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      await login({ email, password });
      navigate("/"); // redirect sau login
    } catch {
      setPasswordError("Mật khẩu không chính xác");
    }
  };

  if (showRegister) {
    return <Register onBack={() => setShowRegister(false)} />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>

        <input
          type="text"
          placeholder="Email hoặc số di động"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
          className={emailError ? "input error" : "input"}
        />
        {emailError && <p className="error-text">{emailError}</p>}

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            className={passwordError ? "input error" : "input"}
          />

          {password.length > 0 && (
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M10.58 10.58A2 2 0 0013.42 13.42"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M9.88 5.08A10.94 10.94 0 0121 12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M3 12a10.94 10.94 0 005.12 6.92"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M1 12C1 12 5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </span>
          )}
        </div>

        {passwordError && <p className="error-text">{passwordError}</p>}

        {/* error từ backend */}
        {error && <p className="error-text">{error}</p>}

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="forgot">Quên mật khẩu?</p>

        <button
          className="register-btn"
          onClick={() => setShowRegister(true)}
        >
          Tạo tài khoản mới
        </button>

        {loading && <p className="loading-text">Đang xử lý...</p>}
      </div>
    </div>
  );
}