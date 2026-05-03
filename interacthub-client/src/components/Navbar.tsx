import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useWindowSize } from '../hooks/useWindowSize';
import UserMenu from './UserMenu';
import Badge from './Badge';
import ChatItem from './ChatItem';
import { Search } from 'lucide-react';
import type { ChatMessage } from '../types/types';
import axiosClient from '../api/axios';

// 1. Định nghĩa Props để nhận hàm từ App.tsx hoặc Layout.tsx
interface NavbarProps {
  onSelectChat?: (user: { fullName: string; avatarUrl: string }) => void;
}

const Navbar = ({ onSelectChat }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useWindowSize();

  const [isChatOpen, setIsChatOpen] = useState(false);

  const mockChats: ChatMessage[] = [
    {
      id: "1",
      user: { id: "u1", name: "Văn A", avatarUrl: "" },
      lastMessage: "Chào bạn, đồ án C# sao rồi?",
      timestamp: "2026-04-14T13:00:00",
      unreadCount: 1
    },
    {
      id: "2",
      user: { id: "u2", name: "Thị B", avatarUrl: "" },
      lastMessage: "Tối nay đi cafe không?",
      timestamp: "2026-04-14T10:00:00",
      unreadCount: 0
    },
    {
      id: "3",
      user: { id: "u3", name: "Huy Lý", avatarUrl: "" },
      lastMessage: "Đã gửi một ảnh",
      timestamp: "2026-04-14T08:00:00",
      unreadCount: 1
    },
  ];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await axiosClient.get(`/users/search?keyword=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsChatOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeAllMenus = () => {
    setIsChatOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-slate-100">
      <div className="max-w-6xl mx-auto flex justify-between items-center relative">

        <Link to="/" onClick={closeAllMenus} className="text-2xl font-black text-blue-600 tracking-tighter">
          INTERACTHUB
        </Link>

        {!isMobile && (
          <div className="flex-1 max-w-md mx-10">
            <div className="relative group" ref={searchRef}>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />

              {/* Dropdown kết quả */}
              {searchQuery && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  {searching ? (
                    <div className="px-4 py-3 text-sm text-slate-500">Đang tìm...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500">Không tìm thấy kết quả</div>
                  ) : (
                    searchResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          navigate(`/profile/${u.id}`);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl.startsWith("http") ? u.avatarUrl : `http://interacthub-staging.eba-wgfffkes.ap-southeast-1.elasticbeanstalk.com${u.avatarUrl}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-sm">
                              {u.fullName?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{u.fullName}</p>
                          <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {isMobile ? (
          <button className="p-2 bg-slate-100 rounded-lg text-xl">☰</button>
        ) : (
          <div className="flex items-center space-x-6">
            <div className="flex space-x-6 font-semibold text-slate-500">
              <NavLink to="/" onClick={closeAllMenus} className={({ isActive }) => isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-500 transition"}>
                Trang chủ
              </NavLink>
              <NavLink to="/friends" onClick={closeAllMenus} className={({ isActive }) => isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-500 transition"}>
                Bạn bè
              </NavLink>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  const nextState = !isChatOpen;
                  closeAllMenus();
                  setIsChatOpen(nextState);
                }}
                className={`p-2 rounded-full transition group ${isChatOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <span className="text-xl">💬</span>
                <div className="absolute -top-1 -right-1">
                  <Badge content={3} variant="danger" size="sm" className="border-2 border-white" />
                </div>
              </button>

              {isChatOpen && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={closeAllMenus}></div>

                  <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl border border-slate-200 rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-900">Chat</h3>
                      <button className="text-blue-600 text-xs font-semibold hover:underline">Xem tất cả</button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                      {mockChats.map((chat) => (
                        <ChatItem
                          key={chat.id}
                          data={chat}
                          onClick={() => {
                            // 2. Gọi hàm onSelectChat khi click vào một người
                            if (onSelectChat) {
                              onSelectChat({
                                fullName: chat.user.name,
                                avatarUrl: chat.user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
                              });
                            }
                            setIsChatOpen(false); // Đóng menu dropdown
                          }}
                        />
                      ))}
                    </div>

                    <div className="p-2 border-t border-slate-100 text-center">
                      <button className="text-blue-600 text-sm font-bold hover:underline py-1 w-full">
                        Mở trong Messenger
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div onClick={closeAllMenus}>
              <UserMenu />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
