import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home.tsx';
import Friends from './pages/Friends.tsx';
import Profile from './pages/Profile.tsx'; 
import ChatBox from './components/ChatBox.tsx';

function App() {
  const [activeChatUser, setActiveChatUser] = useState<{fullName: string, avatarUrl: string} | null>(null);
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white transition-colors duration-300">     
    <Navbar onSelectChat={(user) => setActiveChatUser(user)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
      {activeChatUser && (
        <ChatBox 
          contact={activeChatUser} 
          onClose={() => setActiveChatUser(null)} 
        />
      )}
    </div>
  );
}

export default App;