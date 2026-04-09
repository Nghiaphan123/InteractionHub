import React, { useState } from 'react';

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState('Bài viết');

  const tabs = ['Bài viết', 'Giới thiệu', 'Bạn bè', 'Ảnh', 'Video', 'Check-in', 'Xem thêm'];

  return (
    <div className="flex items-center border-t dark:border-zinc-700 mt-1">
      <div className="flex flex-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-4 text-sm font-semibold transition-all relative ${
              activeTab === tab 
                ? 'text-blue-500' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg'
            }`}
          >
            {tab}
            {/* Đường gạch chân màu xanh khi active */}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Nút ba chấm ở góc phải thanh menu */}
      <button className="p-2 bg-gray-100 dark:bg-zinc-700 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600 mb-1">
        <span className="dark:text-white">•••</span>
      </button>
    </div>
  );
};

export default ProfileTabs;