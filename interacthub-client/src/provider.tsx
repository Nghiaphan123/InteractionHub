import { AuthProvider } from "./context/AuthContext";

export default function Provider({ children }: any) {
  return <AuthProvider>{children}</AuthProvider>;
}