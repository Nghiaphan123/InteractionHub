import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home.tsx';
import Friends from './pages/Friends.tsx';
import Profile from './pages/Profile.tsx'; 
import ChatBox from './components/ChatBox.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from "./pages/ForgotPassword";
import ChooseRecoveryMethod from "./pages/ChooseRecoveryMethod";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [activeChatUser, setActiveChatUser] = useState<{fullName: string, avatarUrl: string} | null>(null);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white transition-colors duration-300">     
      {!isLoginPage && (
        <Navbar onSelectChat={(user) => setActiveChatUser(user)} />
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/choose-recovery" element={<ChooseRecoveryMethod />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>

      {activeChatUser && !isLoginPage && (
        <ChatBox
          contact={activeChatUser}
          onClose={() => setActiveChatUser(null)}
        />
      )}
    </div>
  );
}

export default App;