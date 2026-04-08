import { Link, NavLink } from 'react-router-dom';
import { useWindowSize } from '../hooks/useWindowSize'; // Gọi cái "Móc câu" mình vừa làm
import UserMenu from './UserMenu';

const Navbar = () => {
  const isMobile = useWindowSize(); // Hook này trả về true nếu là điện thoại, false nếu là máy tính

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-slate-100">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* LOGO - Dùng Link của Router để chuyển trang cực nhanh */}
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          INTERACTHUB
        </Link>

        {/* PHẦN ĐIỀU HƯỚNG THÍCH ỨNG */}
        {isMobile ? (
          /* Giao diện Mobile: Hiện icon Menu */
          <button className="p-2 bg-slate-100 rounded-lg text-xl">☰</button>
        ) : (
          /* Giao diện Desktop: Hiện đầy đủ các mục menu */
          <div className="flex items-center space-x-8">
            <div className="flex space-x-6 font-semibold text-slate-500">
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-500"}
              >
                Trang chủ
              </NavLink>
              <NavLink 
                to="/friends" 
                className={({ isActive }) => isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-500"}
              >
                Bạn bè
              </NavLink>
            </div>
            
            <Link to="/profile" className="flex items-center hover:opacity-80 transition">
            <UserMenu name="Hoài An" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;