import { createContext, useContext, useState } from "react";
import { loginApi, logoutApi } from "../services/authService";

type AuthContextType = {
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await loginApi({ email, password });
      const data = res.data;

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      setError("Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
  try {
    await logoutApi();
  } catch (e) {}

  localStorage.removeItem("token");
  setUser(null);
};

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext)!;