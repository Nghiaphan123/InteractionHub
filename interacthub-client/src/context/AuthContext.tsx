import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI } from "../services/authService";

type User = {
  id?: string;
  email?: string;
  name?: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // restore session
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      setUser({ email: "unknown" }); // tạm thời
    }
  }, []);

  // LOGIN
  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await loginAPI(data);

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token) throw new Error("No token returned");

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user ?? { email: data.email });

    } catch (err: unknown) {
      console.error("LOGIN ERROR:", err);
      setError("Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
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
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};