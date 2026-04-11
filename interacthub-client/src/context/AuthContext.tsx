import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI } from "../services/authService";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  // login
  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginAPI(data);
      const token = res.data.token;

      localStorage.setItem("token", token);
      setToken(token);

      setUser(res.data.user || null);
    } catch (err: any) {;
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};