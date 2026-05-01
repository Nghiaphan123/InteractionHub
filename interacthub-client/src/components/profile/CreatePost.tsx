import React from 'react';
import type { User } from '../../types/user';

interface Props {
  user: User;
}

const CreatePost = ({ user }: Props) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow p-3 mb-4">
      {/* Phần trên: Avatar + Input */}
      <div className="flex items-center gap-2 mb-3 px-1 pt-1">
        <img 
          src={user.avatarUrl} 
          alt="avatar" 
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90"
        />
        <div 
          className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] rounded-full py-2 px-4 cursor-pointer transition"
        >
          <span className="text-gray-500 dark:text-[#b0b3b8] text-[17px]">
            {user.fullName} ơi, bạn đang nghĩ gì thế?
          </span>
        </div>
      </div>

      {/* Đường kẻ ngang mờ */}
      <div className="border-t dark:border-[#3e4042] mx-1 mb-1"></div>

      {/* Phần dưới: Các nút chức năng */}
      <div className="flex justify-between">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg transition">
          <span className="text-xl">📹</span>
          <span className="text-gray-600 dark:text-[#b0b3b8] font-semibold text-sm">Video trực tiếp</span>
        </button>
        
        <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg transition">
          <span className="text-xl">🖼️</span>
          <span className="text-gray-600 dark:text-[#b0b3b8] font-semibold text-sm">Ảnh/video</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg transition">
          <span className="text-xl">🚩</span>
          <span className="text-gray-600 dark:text-[#b0b3b8] font-semibold text-sm">Sự kiện trong đời</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePost;