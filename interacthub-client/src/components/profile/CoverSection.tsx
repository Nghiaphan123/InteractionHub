import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../../types/user';

const CoverSection = ({ user }: { user: User }) => {
  const { isOwnProfile, friendStatus } = user;
  const [showFollowMenu, setShowFollowMenu] = useState(false);
  const followMenuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (followMenuRef.current && !followMenuRef.current.contains(e.target as Node)) {
        setShowFollowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderActionButtons = () => {
    if (isOwnProfile) return (
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition">+ Thêm vào tin</button>
    );

    const MessageBtn = () => (
      <button className="bg-gray-200 dark:bg-zinc-700 dark:text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-zinc-600 transition">💬 Nhắn tin</button>
    );

    // LOGIC NÚT CHÍNH
    let PrimaryButton;
    switch (friendStatus) {
      case 'friend':
        PrimaryButton = (
          <button className="bg-gray-200 dark:bg-zinc-700 dark:text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2">👤 Bạn bè</button>
        );
        break;

      case 'follower':
        PrimaryButton = (
          <div className="relative" ref={followMenuRef}>
            <button 
              onClick={() => setShowFollowMenu(!showFollowMenu)}
              className="bg-gray-200 dark:bg-zinc-700 dark:text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300 transition"
            >
              🔔 Đang theo dõi
            </button>
            
            {/* MENU CON KHI BẤM VÀO ĐANG THEO DÕI */}
            {showFollowMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#242526] border dark:border-zinc-700 rounded-lg shadow-xl z-[110] py-2">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-white flex items-center gap-2">
                  🔕 Bỏ theo dõi
                </button>
              </div>
            )}
          </div>
        );
        break;

      default: // 'none' hoặc chưa theo dõi
        PrimaryButton = (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition">
            🔔 Theo dõi
          </button>
        );
    }

    return (
      <div className="flex gap-2 mb-2 relative">
        {PrimaryButton}
        <MessageBtn />
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative h-[250px] md:h-[350px] w-full bg-gray-300 dark:bg-zinc-800 rounded-b-xl overflow-hidden">
        <img src={user.coverUrl} className="w-full h-full object-cover" alt="cover" />
      </div>
      <div className="flex flex-col md:flex-row items-center md:items-end px-4 pb-4 -mt-16 md:-mt-12 gap-4 relative">
        <div className="relative z-10">
          <img src={user.avatarUrl} className="w-40 h-40 rounded-full border-4 border-white dark:border-[#242526] object-cover shadow-md" alt="avatar" />
        </div>
        <div className="flex-1 text-center md:text-left mb-2">
          <h1 className="text-3xl font-bold dark:text-white">{user.fullName}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-semibold">{user.friendsCount.toLocaleString()} bạn bè</p>
        </div>
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default CoverSection;