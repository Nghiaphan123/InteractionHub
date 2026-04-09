import { useState } from 'react'; // 1. Thêm useState
import { Link, NavLink } from 'react-router-dom';
import { useWindowSize } from '../hooks/useWindowSize';
import UserMenu from './UserMenu';
import Badge from './Badge';
import Avatar from './Avatar'; // Import thêm Avatar để hiện trong danh sách chat
import { Search } from 'lucide-react';

const Navbar = () => {
  const isMobile = useWindowSize();
  
  // 2. Tạo state để kiểm soát việc ẩn/hiện danh sách tin nhắn
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-slate-100">
      <div className="max-w-6xl mx-auto flex justify-between items-center relative">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          INTERACTHUB
        </Link>
        {/* Tìm kiếm */}
                {!isMobile && (
          <div className="flex-1 max-w-md mx-10">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-gray-200"
              />
            </div>
          </div>
        )}
        {/* ĐIỀU HƯỚNG */}
        {isMobile ? (
          <button className="p-2 bg-slate-100 rounded-lg text-xl">☰</button>
        ) : (
          <div className="flex items-center space-x-6">
            <div className="flex space-x-6 font-semibold text-slate-500">
              <NavLink to="/" className={({ isActive }) => isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-500 transition"}>
                Trang chủ
              </NavLink>
              <NavLink to="/friends" className={({ isActive }) => isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-500 transition"}>
                Bạn bè
              </NavLink>
            </div>

            {/* NÚT TIN NHẮN VÀ DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)} // 3. Click để đảo ngược trạng thái ẩn/hiện
                className={`p-2 rounded-full transition group ${isChatOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <span className="text-xl">💬</span>
                <div className="absolute -top-1 -right-1">
                  <Badge content={3} variant="danger" size="sm" className="border-2 border-white" />
                </div>
              </button>

              {/* 4. KHUNG CHAT SỔ RA (DROPDOWN) */}
              {isChatOpen && (
                <>
                  {/* Lớp phủ trong suốt để click ra ngoài là đóng menu */}
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsChatOpen(false)}></div>
                  
                  <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl border border-slate-200 rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-900">Chat</h3>
                      <button className="text-blue-600 text-xs font-semibold hover:underline">Xem tất cả</button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                      {/* Danh sách tin nhắn mẫu */}
                      {[
                        { id: 1, name: "Văn A", msg: "Chào bạn, đồ án C# sao rồi?", time: "5p", unread: true },
                        { id: 2, name: "Thị B", msg: "Tối nay đi cafe không?", time: "1h", unread: false },
                        { id: 3, name: "Huy Lý", msg: "Đã gửi một ảnh", time: "2h", unread: true },
                      ].map((chat) => (
                        <div key={chat.id} className="p-3 flex items-center space-x-3 hover:bg-slate-50 cursor-pointer transition">
                          <div className="relative">
                            <Avatar size="md" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${chat.unread ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{chat.name}</p>
                            <p className={`text-xs truncate ${chat.unread ? 'font-semibold text-blue-600' : 'text-slate-500'}`}>
                              {chat.msg} · {chat.time}
                            </p>
                          </div>
                          {chat.unread && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                        </div>
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
            
              <UserMenu />
            
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;