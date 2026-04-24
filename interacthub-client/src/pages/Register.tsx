import { useState } from "react";
import { registerAPI } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register({ onBack }: any) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!firstName.trim()) e.firstName = "Nhập tên";
    if (!lastName.trim()) e.lastName = "Nhập họ";

    if (!day || !month || !year) e.dob = "Chọn ngày sinh";
    else {
      const age = new Date().getFullYear() - Number(year);
      if (age < 13) e.dob = "Chưa đủ 13 tuổi";
    }

    if (!gender) e.gender = "Chọn giới tính";
    if (!email.trim()) e.email = "Nhập email hoặc SĐT";

    if (!password) e.password = "Nhập mật khẩu";
    else if (password.length < 6) e.password = "Ít nhất 6 ký tự";

    if (!confirmPassword) e.confirmPassword = "Nhập lại mật khẩu";
    else if (confirmPassword !== password)
      e.confirmPassword = "Mật khẩu không khớp";

    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);

    try {
      await registerAPI({
        firstName,
        lastName,
        day,
        month,
        year,
        gender,
        email,
        password,
      });

      // auto login
      await login({ email, password });

      // redirect sau đăng ký
      navigate("/");
    } catch (err: any) {
      console.error(err);

      setErrors({
        ...e,
        email: err.response?.data?.message || "Đăng ký thất bại",
      });
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

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <input
              placeholder="Họ"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={errors.lastName ? "input error" : "input"}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
            {errors.lastName && <p className="error-text">{errors.lastName}</p>}
          </div>

          <div style={{ flex: 1 }}>
            <input
              placeholder="Tên"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={errors.firstName ? "input error" : "input"}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
            {errors.firstName && <p className="error-text">{errors.firstName}</p>}
          </div>
        </div>

        <div className="dob-row">
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">Ngày</option>
            {[...Array(31)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>

          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">Tháng</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Năm</option>
            {[...Array(100)].map((_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>

        {errors.dob && <p className="error-text">{errors.dob}</p>}

        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>

        {errors.gender && <p className="error-text">{errors.gender}</p>}

        <input
          placeholder="Email hoặc SĐT"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? "input error" : "input"}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "input error" : "input"}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          />

          {password.length > 0 && (
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              <Eye open={showPassword} />
            </span>
          )}
        </div>

        {errors.password && <p className="error-text">{errors.password}</p>}

        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirmPassword ? "input error" : "input"}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          />

          {confirmPassword.length > 0 && (
            <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Eye open={showConfirmPassword} />
            </span>
          )}
        </div>

        {errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword}</p>
        )}

        <button
          className="login-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <p className="forgot" onClick={onBack}>
          Đã có tài khoản?
        </p>
      </div>
    </div>
  );
}