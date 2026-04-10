import React, { useState, useRef, useEffect } from 'react';

const ProfileTabs = ({ isOwnProfile, friendStatus }: { isOwnProfile: boolean, friendStatus?: string }) => {
  const [activeTab, setActiveTab] = useState('Bài viết');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tabs = ['Bài viết', 'Giới thiệu', 'Bạn bè', 'Ảnh', 'Video', 'Check-in', 'Xem thêm'];

  // Đóng menu khi click ngoài
  useEffect(() => {
    const handleClose = () => setShowMenu(false);
    if (showMenu) {
      const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) handleClose();
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showMenu]);

  return (
    <div className="flex items-center border-t dark:border-zinc-700 mt-1 relative">
      <div className="flex flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-4 text-sm font-semibold whitespace-nowrap transition-all relative ${
              activeTab === tab ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      <div className="relative" ref={menuRef}>
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-md bg-gray-100 dark:bg-zinc-700 mb-1">
          <span className="dark:text-white font-bold px-1">•••</span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-60 bg-white dark:bg-[#242526] border dark:border-zinc-700 rounded-lg shadow-2xl z-[100] py-2">
            {isOwnProfile ? (
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-white font-medium">✏️ Chỉnh sửa trang cá nhân</button>
            ) : (
              <>
                {/* SỬA LOGIC Ở ĐÂY */}
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-white font-medium">
                  {(friendStatus === 'follower' || friendStatus === 'friend') ? '🔕 Bỏ theo dõi' : '🔔 Theo dõi'}
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-white font-medium text-red-500 border-t dark:border-zinc-700 mt-1">🚫 Chặn</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;