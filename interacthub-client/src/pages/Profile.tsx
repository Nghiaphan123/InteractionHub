import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfileAPI } from '../services/userService';
import CoverSection from '../components/profile/CoverSection.tsx';
import ProfileTabs from '../components/profile/ProfileTabs.tsx';
import EditDetailsModal from '../components/profile/EditDetailsModal.tsx';
import AboutSection from '../components/profile/AboutSection.tsx';
import FriendsSection from '../components/profile/FriendsSection.tsx';
import axiosClient from '../api/axios';
import { getPostsByUserAPI, createPostAPI, deletePostAPI } from '../services/postService';
import { uploadImageAPI } from '../services/uploadService';

// Import đúng component bài viết
import CreatePost from '../components/CreatePost.tsx';
import PostCard from '../components/PostCard.tsx';

import type { User, UserDetail } from '../types/user';
import type { Post } from '../types/post';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState<'posts' | 'about' | 'friends' | 'photos'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);

  const [details, setDetails] = useState<UserDetail[]>(() => {
    const saved = localStorage.getItem('user_details_data');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveBio = () => {
    if (userData) {
      setUserData({ ...userData, bio: bioDraft });
      localStorage.setItem('user_bio', bioDraft);
      setIsEditingBio(false);
    }
  };

  const handleCreatePost = async (content: string, imageFile: File | null) => {
    try {
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        const uploadRes = await uploadImageAPI(imageFile);
        imageUrl = uploadRes.data.imageUrl;
      }
      const createdPost = await createPostAPI({ content, imageUrl });
      setPosts(prev => [createdPost, ...prev]);
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  // Thêm fetch posts trong useEffect
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const targetId = id || currentUser?.id;
        if (!targetId) return;
        const data = await getPostsByUserAPI(targetId);
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, [id, currentUser?.id]);

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostAPI(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  useEffect(() => {
    const isMe = !id || id === currentUser?.id;

    const fetchUserData = async () => {
      const savedAvatar = localStorage.getItem('user_avatarUrl');
      const savedCover = localStorage.getItem('user_coverUrl');

      let data: User | null = null;

      if (isMe && currentUser) {
        data = {
          id: currentUser.id,
          fullName: currentUser.fullName || "Người dùng",
          username: currentUser.username || "user",
          avatarUrl: savedAvatar || currentUser.avatarUrl || '',  
           coverUrl: savedCover || "https://picsum.photos/1000/400",
          bio: localStorage.getItem('user_bio') || "",
          friendsCount: 0,
          isOwnProfile: true,
          friendStatus: 'none',
          location: "",
          education: "",
          details: details
        };
      } else {
        try {
          const res = await axiosClient.get(`/users/${id}`);
          const u = res.data;
          console.log("friendStatus từ API:", u.friendStatus); 
          data = {
            id: u.id,
            fullName: u.fullName,
            username: u.username,
            avatarUrl: u.avatarUrl,
            coverUrl: u.coverUrl || "https://picsum.photos/1000/400",
            bio: u.bio || "",
            friendsCount: u.friendsCount || 0,
            isOwnProfile: false,
            friendStatus: u.friendStatus || 'none',
            location: u.location || "",
            education: u.education || "",
            details: []
          };
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }

      if (data) {
        setUserData(data);
      }
    };

    fetchUserData();
  }, [id, details, currentUser]);

  if (!userData) return <div className="p-10 text-center dark:text-white italic">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#18191a]">
      <div className="bg-white dark:bg-[#242526] shadow-sm">
        <CoverSection
          user={userData}
          onUpdateImage={async (field, url) => {
            console.log(`🖼️ [Profile] onUpdateImage called:`, { field, url });

            // 1. Cập nhật giao diện ngay lập tức
            console.log(`🔄 [Profile] Updating userData state with ${field}:`, url);
            setUserData(prev => {
              if (!prev) return null;
              const updated = { ...prev, [field]: url };
              console.log(`✅ [Profile] userData updated:`, updated);
              return updated;
            });

            // 2. Lưu vào localStorage
            localStorage.setItem(`user_${field}`, url);
            console.log(`💾 [Profile] Saved to localStorage[user_${field}]`);

            // 3. Nếu là tài khoản của mình, cập nhật lên backend
            if (userData?.isOwnProfile && field === 'avatarUrl') {
              try {
                console.log("📤 [Profile] Updating avatar on backend:", url);
                await updateProfileAPI({ avatarUrl: url });
                console.log("✅ [Profile] Avatar updated on backend");
              } catch (error) {
                console.error("❌ [Profile] Failed to update avatar on backend:", error);
              }
            }
          }}
        />
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
                  {isEditingBio ? (
                    <div className="space-y-2">
                      <textarea
                        value={bioDraft}
                        onChange={(e) => setBioDraft(e.target.value)}
                        className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:text-white dark:border-zinc-600 outline-none focus:ring-1 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditingBio(false)} className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 dark:text-white rounded-lg text-sm font-bold">Hủy</button>
                        <button onClick={handleSaveBio} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold">Lưu</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="dark:text-white text-[15px] py-2 italic whitespace-pre-wrap">{userData.bio || "Thêm tiểu sử"}</p>
                      {userData.isOwnProfile && (
                        <button onClick={() => setIsEditingBio(true)} className="w-full py-2 bg-gray-100 dark:bg-zinc-800 font-bold rounded-lg hover:bg-gray-200 transition dark:text-white text-sm">
                          Chỉnh sửa tiểu sử
                        </button>
                      )}
                    </>
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
                      currentUser={currentUser ? { id: currentUser.id, fullName: currentUser.fullName || "" } : { id: "", fullName: "" }}
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
        ) : mainTab === 'about' ? (
          <AboutSection details={details} onUpdate={setDetails} isOwnProfile={userData.isOwnProfile} />
        ) : mainTab === 'friends' ? (
          <div className="bg-white dark:bg-[#242526] rounded-xl shadow min-h-[400px]">
            <FriendsSection />
          </div>
        ) : mainTab === 'photos' ? (
          <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow">
            <h3 className="text-xl font-bold dark:text-white mb-4">Ảnh</h3>
            <div className="grid grid-cols-3 gap-2">
              {/* Render ảnh mẫu ở đây */}
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#242526] p-16 rounded-xl shadow text-center dark:text-white italic">
            Tính năng Video đang được cập nhật...
          </div>
        )}
      </div>

      <EditDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} details={details} onSave={setDetails} />
    </div>
  );
};

export default ProfilePage;