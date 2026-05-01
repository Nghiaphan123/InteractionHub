import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { sendRecoveryCodeAPI } from "../services/authService";
import "./Login.css";

export default function ChooseRecoveryMethod() {
  const navigate = useNavigate();

  const account = JSON.parse(
    localStorage.getItem("recoveryAccount") || "{}"
  );

  const methods = [
    ...(account.emails || []).map((email: string) => ({
      id: email,
      title: "Nhận mã qua email",
      value: email,
    })),
    ...(account.phones || []).map((phone: string) => ({
      id: phone,
      title: "Nhận mã qua SMS",
      value: phone,
    })),
  ];

  const [selected, setSelected] = useState(methods[0]?.id || "");

  const handleContinue = async () => {
    try {
      await sendRecoveryCodeAPI({
        value: selected,
      });

      localStorage.setItem("selectedRecovery", selected);

      navigate("/verify-code");
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
          Chọn cách nhận mã
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <img
            src={account.avatarUrl || account.avatar}
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
          <strong>{account.fullName}</strong>
        </div>

        {methods.map((method: any) => (
          <div
            key={method.id}
            onClick={() => setSelected(method.id)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "10px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div>{method.title}</div>
              <small>{method.value}</small>
            </div>

            <input type="radio" checked={selected === method.id} readOnly />
          </div>
        ))}

        <button onClick={handleContinue} className="login-btn">
          Tiếp tục
        </button>

        <button className="register-btn" onClick={() => navigate("/login")}>
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}