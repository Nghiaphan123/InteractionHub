import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, getMeAPI } from "../services/authService";
import axios from "../api/axios";

type User = {
  id: string;
  username?: string;
  email?: string;
  fullName?: string;
  // Some UI parts still read `user.name`, so we keep it as an alias.
  name?: string;
  avatarUrl?: string | null;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session
  useEffect(() => {
    const initAuth = async () => {
      console.log("🔄 RESTORING SESSION...");
      const savedToken = localStorage.getItem("token");
      const savedEmail = localStorage.getItem("userEmail");

      if (!savedToken) {
        console.log("⚠️ No token found in localStorage");
        setLoading(false);
        return;
      }

      console.log("✅ Token found:", savedToken.substring(0, 20) + "...");
      setToken(savedToken);

      // Set token in axios header for the restore request
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

      try {
        console.log("👤 Fetching user data...");
        const res = await getMeAPI();
        console.log("✅ User restored:", res.data);
        setUser({
          id: res.data.id,
          username: res.data.username,
          email: savedEmail || "",
          fullName: res.data.fullName,
          name: res.data.fullName,
          avatarUrl: res.data.avatarUrl ?? null,
        });
      } catch (err) {
        console.error("❌ RESTORE FAILED:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // LOGIN
  const login = async (data: { email: string; password: string }) => {
    console.log("🔐 LOGIN STARTED:", data.email);
    setLoading(true);
    setError(null);

    try {
      console.log("📤 Calling loginAPI...");
      const res = await loginAPI(data);
      console.log("✅ Login response received:", res.data);

      const token = res.data?.token;

      if (!token) throw new Error("No token returned");

      console.log("💾 Storing token to localStorage...");
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", data.email);

      // Set token in axios header immediately
      console.log("🔗 Setting axios Authorization header...");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Load the full profile (including `id`) from the authorized endpoint.
      console.log("👤 Fetching user profile...");
      const meRes = await getMeAPI();
      console.log("✅ User profile received:", meRes.data);
      
      // Update all state together to ensure consistency
      console.log("🔄 Updating AuthContext state...");
      setToken(token);
      setUser({
        id: meRes.data.id,
        username: meRes.data.username,
        email: data.email,
        fullName: meRes.data.fullName,
        name: meRes.data.fullName,
        avatarUrl: meRes.data.avatarUrl ?? null,
      });
      
      // Ensure loading is set to false after state is updated
      setLoading(false);
      console.log("✅ LOGIN SUCCESS! User:", meRes.data.username);

    } catch (err: any) {
      console.error("❌ LOGIN ERROR:", err);
      const errorMsg = err.response?.data?.message || "Login failed";
      console.error("Error message:", errorMsg);
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
      }}
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