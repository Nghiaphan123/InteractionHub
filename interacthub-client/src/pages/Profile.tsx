import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CURRENT_USER } from '../services/auth';
import CoverSection from '../components/profile/CoverSection.tsx';
import ProfileTabs from '../components/profile/ProfileTabs.tsx';
import EditDetailsModal from '../components/profile/EditDetailsModal.tsx'; 
import AboutSection from '../components/profile/AboutSection.tsx';
import type { User, UserDetail } from '../types/user';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState<'posts' | 'about' | 'friends' | 'photos'>('posts');
  
  const [details, setDetails] = useState<UserDetail[]>(() => {
    const saved = localStorage.getItem('user_details_data');
    return saved ? JSON.parse(saved) : [
      { id: '1', content: 'Đại học Sài Gòn (SGU)', type: 'education', subStatus: 'current', isVisible: true },
      { id: '2', content: 'TP. Hồ Chí Minh', type: 'location', isVisible: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('user_details_data', JSON.stringify(details));
  }, [details]);

  useEffect(() => {
    const isMe = !id || id === CURRENT_USER.id;
    const fetchUserData = () => {
      let data: User;
      if (isMe) {
        data = {
          ...CURRENT_USER,
          coverUrl: "https://picsum.photos/1000/400",
          bio: "Việc gì cũng có thể thành công nếu cố gắng",
          friendsCount: 1250,
          isOwnProfile: true,
          friendStatus: 'none',
          location: "TP. Hồ Chí Minh",
          education: "Đại học Sài Gòn (SGU)",
          details: details
        };
      } else {
        data = {
          id: id!,
          fullName: "Người dùng khác",
          username: `user.${id}`,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
          coverUrl: "https://picsum.photos/1000/400",
          bio: "Chào mừng đến với hồ sơ của tôi!",
          friendsCount: 500,
          isOwnProfile: false,
          friendStatus: 'friend',
          location: "Chưa cập nhật",
          education: "Chưa cập nhật",
          details: []
        };
      }
      setUserData(data);
    };
    fetchUserData();
  }, [id, details]);

  if (!userData) return <div className="p-10 text-center dark:text-white italic">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#18191a]">
      <div className="bg-white dark:bg-[#242526] shadow-sm">
        <CoverSection user={userData} />
        <div className="max-w-5xl mx-auto px-4">
          <ProfileTabs 
            activeTab={mainTab} 
            setActiveTab={setMainTab} 
            isOwnProfile={userData.isOwnProfile} 
            friendStatus={userData.friendStatus} 
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {mainTab === 'posts' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow">
                <h3 className="text-xl font-bold dark:text-white mb-3">Tiểu sử</h3>
                <div className="text-center mb-4">
                  <p className="dark:text-white text-sm py-2 italic font-medium">"{userData.bio}"</p>
                  {userData.isOwnProfile && <button className="w-full py-2 bg-gray-100 dark:bg-zinc-800 font-bold rounded-lg hover:bg-gray-200 transition dark:text-white text-sm mt-1">Chỉnh sửa tiểu sử</button>}
                </div>
                <div className="space-y-4 border-t dark:border-zinc-700 pt-4">
                  {details.filter(d => d.isVisible).map(item => (
                    <div key={item.id} className="flex items-center gap-3 text-[15px] dark:text-zinc-300">
                      <span className="text-xl">{item.type === 'education' ? '🎓' : item.type === 'work' ? '💼' : item.type === 'status' ? '❤️' : '🏠'}</span>
                      <span>{item.type === 'education' ? 'Học tại ' : item.type === 'work' ? 'Làm việc tại ' : ''}<b className="dark:text-white font-semibold">{item.content}</b></span>
                    </div>
                  ))}
                </div>
                {userData.isOwnProfile && <button onClick={() => setIsModalOpen(true)} className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-lg hover:bg-zinc-200 transition dark:text-white mt-4">Chỉnh sửa chi tiết</button>}
              </div>
            </div>
            <div className="md:col-span-3"><div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow dark:text-white font-bold italic text-gray-400">Chưa có bài viết nào được đăng...</div></div>
          </div>
        ) : mainTab === 'about' ? (
          <AboutSection details={details} onUpdate={setDetails} isOwnProfile={userData.isOwnProfile} />
        ) : (
          <div className="bg-white dark:bg-[#242526] p-16 rounded-xl shadow text-center dark:text-white italic text-gray-500">Nội dung này đang được cập nhật...</div>
        )}
      </div>

      <EditDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} details={details} onSave={setDetails} />
    </div>
  );
};
export default ProfilePage;