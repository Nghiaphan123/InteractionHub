import React, { useState } from 'react';
import FriendRequest from '../FriendRequest';

type FriendsTab = 'requests' | 'suggestions' | 'all';

const FriendsSection = () => {
  const [activeTab, setActiveTab] = useState<FriendsTab>('requests');

  // Dữ liệu giả lập
  const data = {
    received: [{ id: '1', name: 'Nguyễn Văn A', mutualFriends: 12 }],
    sent: [{ id: '2', name: 'Trần Thị B' }],
    suggestions: [{ id: '3', name: 'Lê Văn C', mutualFriends: 5 }],
    all: [{ id: '4', name: 'Phạm Văn D', mutualFriends: 40 }]
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return (
          <div className="space-y-8">
            {/* Khung 1: Lời mời người khác gửi tới */}
            <div>
              <h3 className="text-xl font-bold dark:text-white mb-4">Lời mời kết bạn</h3>
              <div className="grid grid-cols-1 gap-3">
                {data.received.map(u => <FriendRequest key={u.id} user={u} type="received" />)}
              </div>
            </div>
            {/* Khung 2: Lời mời đã gửi đi */}
            <div className="border-t dark:border-zinc-700 pt-6">
              <h3 className="text-xl font-bold dark:text-white mb-4">Lời mời đã gửi</h3>
              <div className="grid grid-cols-1 gap-3">
                {data.sent.map(u => <FriendRequest key={u.id} user={u} type="sent" />)}
              </div>
            </div>
          </div>
        );
      case 'suggestions':
        return (
          <div>
            <h3 className="text-xl font-bold dark:text-white mb-4">Người bạn có thể biết</h3>
            <div className="grid grid-cols-1 gap-3">
              {data.suggestions.map(u => <FriendRequest key={u.id} user={u} type="suggestion" />)}
            </div>
          </div>
        );
      case 'all':
        return (
          <div>
            <h3 className="text-xl font-bold dark:text-white mb-4">Tất cả bạn bè</h3>
            <div className="grid grid-cols-1 gap-3">
              {data.all.map(u => <FriendRequest key={u.id} user={u} type="all" />)}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-[#242526] rounded-xl shadow min-h-[500px] overflow-hidden">
      {/* MENU BÊN TRÁI */}
      <div className="w-full md:w-80 border-r dark:border-zinc-700 p-4">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Bạn bè</h2>
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-semibold ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
          >
            <span className="bg-gray-200 dark:bg-zinc-700 p-2 rounded-full">👥</span> Lời mời kết bạn
          </button>
          <button 
            onClick={() => setActiveTab('suggestions')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-semibold ${activeTab === 'suggestions' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
          >
            <span className="bg-gray-200 dark:bg-zinc-700 p-2 rounded-full">✨</span> Gợi ý
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-semibold ${activeTab === 'all' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
          >
            <span className="bg-gray-200 dark:bg-zinc-700 p-2 rounded-full">👤</span> Tất cả bạn bè
          </button>
        </div>
      </div>

      {/* NỘI DUNG BÊN PHẢI */}
      <div className="flex-1 p-6 bg-gray-50 dark:bg-[#18191a]">
        {renderContent()}
      </div>
    </div>
  );
};

export default FriendsSection;