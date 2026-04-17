import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CURRENT_USER } from '../services/auth';
import CoverSection from '../components/profile/CoverSection.tsx';
import ProfileTabs from '../components/profile/ProfileTabs.tsx';
import EditDetailsModal from '../components/profile/EditDetailsModal.tsx'; 
import AboutSection from '../components/profile/AboutSection.tsx';

// Import đúng component bài viết
import CreatePost from '../components/CreatePost.tsx';
import PostCard from '../components/PostCard.tsx';

import type { User, UserDetail } from '../types/user';
import type { Post } from '../types/post';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState<'posts' | 'about' | 'friends' | 'photos'>('posts');
  
  const [posts, setPosts] = useState<Post[]>([]);

  const [details, setDetails] = useState<UserDetail[]>(() => {
    const saved = localStorage.getItem('user_details_data');
    return saved ? JSON.parse(saved) : [
      { id: '1', content: 'Đại học Sài Gòn (SGU)', type: 'education', subStatus: 'current', isVisible: true },
      { id: '2', content: 'TP. Hồ Chí Minh', type: 'location', isVisible: true }
    ];
  });

  const handleCreatePost = (content: string, imageFile: File | null) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        id: CURRENT_USER.id,
        fullName: CURRENT_USER.fullName,
        avatarUrl: CURRENT_USER.avatarUrl,
      },
      content: content,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      createdAt: new Date().toISOString(),
      likesCount: 0,  
      commentsCount: 0,
      isLiked: false
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

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

  if (!userData) return <div className="p-10 text-center dark:text-white italic">Đang tải...</div>;

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
            
            {/* CỘT TRÁI: GIỚI THIỆU */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow">
                <h3 className="text-xl font-bold dark:text-white mb-3">Giới thiệu</h3>
                
                {/* Phần Tiểu sử (Bio) */}
                <div className="text-center mb-4 border-b dark:border-zinc-700 pb-4">
                  <p className="dark:text-white text-[15px] py-2 italic">{userData.bio || "Thêm tiểu sử"}</p>
                  {userData.isOwnProfile && (
                    <button className="w-full py-2 bg-gray-100 dark:bg-zinc-800 font-bold rounded-lg hover:bg-gray-200 transition dark:text-white text-sm">
                      Chỉnh sửa tiểu sử
                    </button>
                  )}
                </div>

                {/* Phần danh sách thông tin chi tiết với BIỂU TƯỢNG RIÊNG */}
                <div className="space-y-4">
                  {details.filter(d => d.isVisible).map(item => {
                    let icon = '🏠'; // Biểu tượng mặc định
                    let prefix = '';

                    // Logic gán icon riêng cho từng loại thông tin
                    switch (item.type) {
                      case 'education':
                        icon = '🎓';
                        prefix = 'Học tại ';
                        break;
                      case 'work':
                        icon = '💼';
                        prefix = 'Làm việc tại ';
                        break;
                      case 'location':
                        icon = '📍';
                        prefix = 'Sống tại ';
                        break;
                      case 'hometown':
                        icon = '🏡';
                        prefix = 'Đến từ ';
                        break;
                      case 'status':
                        icon = '❤️';
                        prefix = 'Tình trạng: ';
                        break;
                    }

                    return (
                      <div key={item.id} className="flex items-center gap-3 text-[15px] dark:text-zinc-300">
                        <span className="text-xl w-8 text-center">{icon}</span>
                        <span>
                          {prefix}
                          <b className="dark:text-white font-semibold">{item.content}</b>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {userData.isOwnProfile && (
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-lg mt-4 dark:text-white hover:bg-zinc-200 transition"
                  >
                    Chỉnh sửa chi tiết
                  </button>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: BÀI VIẾT */}
            <div className="md:col-span-3 space-y-4">
              {userData.isOwnProfile && (
                <CreatePost onPost={handleCreatePost} />
              )}

              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onDelete={handleDeletePost}
                      currentUser={{ fullName: CURRENT_USER.fullName }} 
                    />
                  ))
                ) : (
                  <div className="bg-white dark:bg-[#242526] p-8 rounded-xl shadow text-center text-gray-500 italic">
                    Chưa có bài viết nào để hiển thị.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <AboutSection details={details} onUpdate={setDetails} isOwnProfile={userData.isOwnProfile} />
        )}
      </div>

      <EditDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} details={details} onSave={setDetails} />
    </div>
  );
};

export default ProfilePage;