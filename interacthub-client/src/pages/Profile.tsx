import React, { useState, useEffect } from 'react';
import CoverSection from '../components/profile/CoverSection.tsx';
import ProfileTabs from '../components/profile/ProfileTabs.tsx';
import IntroSidebar from '../components/profile/IntroSidebar.tsx';
import type { User } from '../types/user';

const ProfilePage = () => {
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    // GIẢ LẬP DỮ LIỆU TỪ BACKEND
    const fakeData: User = {
      id: "1",
      fullName: "Hoài An",
      username: "hoaian.123",
      avatarUrl: "https://picsum.photos/200",
      coverUrl: "https://picsum.photos/1000/400",
      bio: "Việc gì cũng có thể thành công nếu cố gắng",
      friendsCount: 1250,
      location: "TP. Hồ Chí Minh",
      education: "Đại học CNTT",
      isOwnProfile: true,       // Đổi true/false để test
      friendStatus: 'follower'     // 'none' | 'friend' | 'pending'| 'follower'
    };
    setUserData(fakeData);
  }, []);

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#18191a] transition-colors">
      <div className="bg-white dark:bg-[#242526] shadow-sm">
        <CoverSection user={userData} />
        <div className="max-w-5xl mx-auto px-4">
          {/* Truyền cả 2 props quan trọng xuống Tabs */}
          <ProfileTabs 
            isOwnProfile={userData.isOwnProfile} 
            friendStatus={userData.friendStatus} 
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 space-y-4">
          <IntroSidebar user={userData} />
        </div>
        <div className="md:col-span-3 space-y-4">
           <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow dark:text-white font-bold">
              Bài viết
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;