import { useState } from 'react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600 italic">InteractHub</div>
          
          {/* Menu cho Máy tính */}
          <div className="hidden md:flex space-x-6 font-medium text-gray-600">
            <a href="#" className="hover:text-blue-600">Trang chủ</a>
            <a href="#" className="hover:text-blue-600">Bạn bè</a>
            <a href="#" className="hover:text-blue-600">Thông báo</a>
          </div>

          {/* Nút bấm cho Điện thoại */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Menu xổ xuống khi ở Điện thoại */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-3 shadow-inner">
            <a href="#" className="block text-blue-600 font-semibold">Trang chủ</a>
            <a href="#" className="block text-gray-600">Bạn bè</a>
            <a href="#" className="block text-gray-600">Thông báo</a>
          </div>
        )}
      </nav>

      {/* NỘI DUNG CHÍNH (Sẽ thay đổi tùy trang) */}
      <main className="max-w-5xl mx-auto p-4 mt-4">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;