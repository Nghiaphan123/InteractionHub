import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CURRENT_USER } from '../services/auth';
import CoverSection from '../components/profile/CoverSection.tsx';
import ProfileTabs from '../components/profile/ProfileTabs.tsx';
import IntroSidebar from '../components/profile/IntroSidebar.tsx';
import EditDetailsModal from '../components/profile/EditDetailsModal.tsx'; 
import type { User, UserDetail } from '../types/user';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Quản lý danh sách chi tiết (Mock data)
  const [details, setDetails] = useState<UserDetail[]>([
    { id: '1', content: 'Đại học CNTT', type: 'education', subStatus: 'current', isVisible: true },
    { id: '2', content: 'TP. Hồ Chí Minh', type: 'location', isVisible: true }
  ]);

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
          location: "TP. Hồ Chí Minh",
          education: "Đại học CNTT",
          isOwnProfile: true,
          friendStatus: 'none',
          details: details // Truyền mảng details vào đây
        };
      } else {
        data = {
          id: id!,
          fullName: id === "u1" ? "Lê Hoài Vũ" : "Người dùng khác",
          username: `user.${id}`,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
          coverUrl: "https://picsum.photos/1000/400",
          bio: "Chào mừng đến với hồ sơ của tôi!",
          friendsCount: 500,
          location: "Việt Nam",
          education: "SGU IT",
          isOwnProfile: false,
          friendStatus: 'friend',
          details: [] 
        };
      }
      setUserData(data);
    };

    fetchUserData();
  }, [id, details]);

  if (!userData) return <div className="p-10 text-center dark:text-white font-bold">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#18191a]">
      {/* Cover & Tabs Section */}
      <div className="bg-white dark:bg-[#242526] shadow-sm">
        <CoverSection user={userData} />
        <div className="max-w-5xl mx-auto px-4">
          <ProfileTabs isOwnProfile={userData.isOwnProfile} friendStatus={userData.friendStatus} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        
        {/* Cột Trái: Thông tin cá nhân */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow">
            {/* Đổi Giới thiệu -> Tiểu sử */}
            <h3 className="text-xl font-bold dark:text-white mb-3">Tiểu sử</h3>
            
            {/* Đưa Bio lên trên cùng (Khoanh vàng) */}
            <div className="text-center mb-4">
              <p className="dark:text-white text-sm py-2">{userData.bio}</p>
              {userData.isOwnProfile && (
                <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 font-bold rounded-lg hover:bg-gray-200 transition dark:text-white mt-1 text-sm">
                  Chỉnh sửa tiểu sử
                </button>
              )}
            </div>

            <div className="space-y-3 mb-4 border-t dark:border-gray-700 pt-4">
              {details.filter(d => d.isVisible).map(item => {
                let prefix = "";
                let icon = "❤️";
                
                // Logic xác định icon linh hoạt theo nội dung
                if (item.type === 'status') {
                  if (item.content === 'Ly hôn') icon = '💔';
                  else if (item.content === 'Đã kết hôn') icon = '💞';
                  else if (item.content === 'Độc thân') icon = '🤍';
                  else if (item.content === 'Hẹn hò') icon = '💖';
                  else if (item.content === 'Đang ly thân') icon = '🖤';
                } else {
                  const icons = { education: '🎓', work: '💼', location: '🏠', hometown: '📍', social: '🔗' };
                  icon = icons[item.type as keyof typeof icons] || '📍';
                }

                // Logic prefix
                switch (item.type) {
                  case 'education': prefix = item.subStatus === 'current' ? 'Đang học tại ' : 'Từng học tại '; break;
                  case 'work': prefix = item.subStatus === 'current' ? 'Đang làm việc tại ' : 'Từng làm việc tại '; break;
                  case 'location': prefix = item.subStatus === 'current' ? 'Sống tại ' : 'Từng sống tại '; break;
                  case 'hometown': prefix = 'Đến từ '; break;
                }

                if (item.type === 'social') {
                  return (
                    <a key={item.id} href={item.content.startsWith('http') ? item.content : `https://${item.content}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium">
                      <span className="text-base">{icon}</span>
                      <span>{item.content}</span>
                    </a>
                  );
                }

                return (
                  <div key={item.id} className="flex items-center gap-2 text-sm dark:text-slate-300">
                    <span className="text-base">{icon}</span>
                    <span>{prefix}<b className="dark:text-white">{item.content}</b></span>
                  </div>
                );
              })}
            </div>
            
            {userData.isOwnProfile && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200 transition dark:text-white"
              >
                Chỉnh sửa chi tiết
              </button>
            )}
          </div>
          
          {/* ĐÃ XOÁ IntroSidebar ở đây theo yêu cầu */}
        </div>

        {/* Cột Phải: Bài viết */}
        <div className="md:col-span-3">
           <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow dark:text-white font-bold">
              Bài viết của {userData.fullName}
           </div>
        </div>
      </div>

      <EditDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        details={details}
        onSave={(updatedDetails) => setDetails(updatedDetails)}
      />
    </div>
  );
};

export default ProfilePage;