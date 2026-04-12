import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  const { user } = useAuth();
  return user ? <Home /> : <Login />;
}

export default App;