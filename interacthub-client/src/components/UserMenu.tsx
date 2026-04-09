import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Moon, Sun, Globe, LogOut, Check, ChevronRight } from 'lucide-react';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('vi');
  const [showLangSub, setShowLangSub] = useState<boolean>(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // --- LOGIC DARK MODE (Chỉ khai báo 1 lần) ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- LOGIC ĐÓNG MENU KHI CLICK RA NGOÀI ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLangSub(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoToProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
    { code: 'jp', name: '日本語' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Nút Hoài An */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-4 py-2 rounded-full transition-all focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden">
           <User size={20} className="text-blue-600" />
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-200">Hoài An</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 py-2 z-50">
          
          <button 
            onClick={handleGoToProfile}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-200"
          >
            <User size={18} />
            <span className="flex-1 text-left">Xem trang cá nhân</span>
          </button>

          <hr className="my-1 border-gray-100 dark:border-slate-800" />

          {/* Toggle Chế độ tối */}
          <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-200">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              <span>Chế độ tối</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Ngôn ngữ */}
          <div 
            className="relative"
            onMouseEnter={() => setShowLangSub(true)}
            onMouseLeave={() => setShowLangSub(false)}
          >
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-3">
                <Globe size={18} />
                <span>Ngôn ngữ</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            {showLangSub && (
              <div className="absolute right-full top-0 mr-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 py-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <span>{lang.name}</span>
                    {language === lang.code && <Check size={16} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <hr className="my-1 border-gray-100 dark:border-slate-800" />

          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
            <LogOut size={18} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;