import React from 'react';
import CoverSection from '../components/profile/CoverSection.tsx';
import ProfileTabs from '../components/profile/ProfileTabs.tsx';
import IntroSidebar from '../components/profile/IntroSidebar.tsx';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#18191a] transition-colors">
      {/* Phần trên: Trắng ở mode sáng, Xám đậm ở mode tối */}
      <div className="bg-white dark:bg-[#242526] shadow-sm">
        <CoverSection />
        <div className="max-w-5xl mx-auto px-4">
          <ProfileTabs />
        </div>
      </div>

      {/* Phần dưới: Bố cục 2 cột */}
      <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Cột trái: Intro */}
        <div className="md:col-span-2 space-y-4">
          <IntroSidebar />
        </div>

        {/* Cột phải: Timeline bài viết */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow">
            <h3 className="font-bold text-lg dark:text-white">Bài viết</h3>
            {/* Chèn Component đăng bài của ông ở đây */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;