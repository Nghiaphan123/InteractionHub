import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { findAccountAPI } from "../services/authService";
import "./Login.css";

export default function ChooseRecoveryMethod() {
  const navigate = useNavigate();

  const [account, setAccount] = useState<any>({});
  const [methods, setMethods] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as any;

    if (nav?.type === "reload") {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const input = localStorage.getItem("recoveryInput");

    if (!input) {
      navigate("/forgot-password");
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);

        const res = await findAccountAPI({ email: input });

        setAccount(res);

        const emails = res.emails || [];

        const m = emails.map((email: string) => ({
          id: email,
          title: "Nhận mã qua email",
          value: email,
        }));

        setMethods(m);

        if (m.length > 0) {
          setSelected(m[0].id);
        } else {
          setSelected("");
        }
      } catch (err) {
        console.error(err);
        setMethods([]);
        setSelected("");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [navigate]);

  const handleContinue = async () => {
    if (!selected || methods.length === 0) return;

    localStorage.setItem("selectedRecovery", selected);

    navigate("/verify-code");
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box" style={{ position: "relative" }}>
        {/* BACK BUTTON */}
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

        {/* USER INFO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <img
            src={
              account?.avatarUrl ||
              account?.avatar ||
              "/default-avatar.png"
            }
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
            }}
          />
          <strong>{account?.fullName || "Người dùng"}</strong>
        </div>

        {/* METHODS */}
        {methods.length === 0 ? (
          <p>Không có email để xác thực</p>
        ) : (
          methods.map((method: any) => (
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
                alignItems: "center",
              }}
            >
              {/* LEFT SIDE */}
              <div style={{ flex: 3 }}>
                <div style={{ fontWeight: 500 }}>
                  Nhận qua mã email
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  {method.value}
                </div>
              </div>

              {/* RIGHT SIDE RADIO */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <input
                  type="radio"
                  checked={selected === method.id}
                  readOnly
                  style={{
                    width: "18px",
                    height: "18px",
                  }}
                />
              </div>
            </div>
          ))
        )}

        {/* BUTTON */}
        <button
          onClick={handleContinue}
          className="login-btn"
          disabled={!selected || methods.length === 0}
        >
          Tiếp tục
        </button>

        <button
          className="register-btn"
          onClick={() => navigate("/login")}
        >
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}