import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Register from "./Register";
import "./Login.css";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [localError, setLocalError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const password = watch("password");

  const validateEmail = (value: string) => {
    if (!value) return "Vui lòng nhập email";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email không hợp lệ";

    return true;
  };

  const onSubmit = async (data: FormData) => {
    setLocalError("");

    try {
      await login({
        email: data.email,
        password: data.password,
      });

      navigate("/");
    } catch {
      setLocalError("Thông tin đăng nhập không chính xác");
    }
  };

  if (showRegister) {
    return <Register onBack={() => setShowRegister(false)} />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Email"
            {...register("email", {
              validate: validateEmail,
            })}
            className={errors.email ? "input error" : "input"}
          />
          {errors.email && (
            <p className="error-text">{errors.email.message as string}</p>
          )}

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
              })}
              className={errors.password ? "input error" : "input"}
            />

            {password && (
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
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
                )}
              </span>
            )}
          </div>

          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}

          {localError && <p className="error-text">{localError}</p>}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p
          onClick={() => navigate("/forgot-password")}
          style={{ color: "#1877f2", cursor: "pointer" }}
        >
          Quên mật khẩu?
        </p>

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