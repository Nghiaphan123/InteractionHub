import { useForm } from "react-hook-form";
import { registerAPI } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register({ onBack }: any) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const password = watch("password");

  const getPasswordStrength = (pw: string) => {
    if (!pw) return "";
    if (pw.length < 6) return "Yếu";
    if (pw.match(/[A-Z]/) && pw.match(/[0-9]/)) return "Mạnh";
    return "Trung bình";
  };

  const onSubmit = async (data: FormData) => {
    console.log("REGISTER SUBMIT OK");
    console.log("FORM DATA:", data);
    
    setLoading(true);
    setApiError("");

    try {
      const payload = {
        username: data.email,
        email: data.email,
        password: data.password,
        fullName: `${data.lastName} ${data.firstName}`,
      };

      await registerAPI(payload);

      await login({
        email: data.email,
        password: data.password,
      });

      navigate("/");
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || "Đăng ký thất bại");
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
      <div className="login-box">
        <h2>Tạo tài khoản</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <input
                placeholder="Họ"
                {...register("lastName", { required: "Nhập họ" })}
                className={errors.lastName ? "input error" : "input"}
              />
              {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
            </div>

            <div style={{ flex: 1 }}>
              <input
                placeholder="Tên"
                {...register("firstName", { required: "Nhập tên" })}
                className={errors.firstName ? "input error" : "input"}
              />
              {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
            </div>
          </div>

          <input
            placeholder="Email"
            {...register("email", {
              required: "Nhập email",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Email không hợp lệ",
              },
            })}
            className={errors.email ? "input error" : "input"}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}

          {/* PASSWORD */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              {...register("password", {
                required: "Nhập mật khẩu",
                minLength: {
                  value: 6,
                  message: "Ít nhất 6 ký tự",
                },
              })}
              className={errors.password ? "input error" : "input"}
            />

            {password && (
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                <Eye open={showPassword} />
              </span>
            )}
          </div>

          {password && (
            <p className="text-sm">
              Độ mạnh: <b>{getPasswordStrength(password)}</b>
            </p>
          )}

          {errors.password && <p className="error-text">{errors.password.message}</p>}

          {/* CONFIRM PASSWORD */}
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              {...register("confirmPassword", {
                required: "Nhập lại mật khẩu",
                validate: (value) =>
                  value === password || "Mật khẩu không khớp",
              })}
              className={errors.confirmPassword ? "input error" : "input"}
            />

            {watch("confirmPassword") && (
              <span
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Eye open={showConfirmPassword} />
              </span>
            )}
          </div>

          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword.message}</p>
          )}

          {apiError && <p className="error-text">{apiError}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="forgot" onClick={onBack}>
          Đã có tài khoản?
        </p>
      </div>
    </div>
  );
}