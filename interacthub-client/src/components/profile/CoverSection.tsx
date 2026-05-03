import { useState, useRef, useEffect } from 'react';
import { uploadImageAPI } from '../../services/uploadService';
import type { User } from '../../types/user';
import axiosClient from '../../api/axios';

const CoverSection = ({ user, onUpdateImage, onFriendStatusChange }: {
  user: User,
  onUpdateImage?: (field: 'avatarUrl' | 'coverUrl', url: string) => void,
  onFriendStatusChange?: (status: string) => void
}) => {
  const { isOwnProfile, friendStatus } = user;
  const [currentFriendStatus, setCurrentFriendStatus] = useState(friendStatus);
  const [showFollowMenu, setShowFollowMenu] = useState(false);
  useEffect(() => {
    setCurrentFriendStatus(friendStatus);
  }, [friendStatus]);

  const handleSendRequest = async () => {
    try {
      await axiosClient.post('/friends/send-request', { receiverId: user.id });
      setCurrentFriendStatus('pending');
      onFriendStatusChange?.('pending');
    } catch (err) { console.error(err); }
  };

  const handleUnfriend = async () => {
    try {
      await axiosClient.delete(`/friends/${user.id}`);
      setCurrentFriendStatus('none');
      onFriendStatusChange?.('none');
    } catch (err) { console.error(err); }
  };

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
  const followMenuRef = useRef<HTMLDivElement>(null);
  // Hàm xử lý khi chọn file ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateImage) return;

    try {
      console.log(`📤 [CoverSection] Uploading ${field} file:`, file.name);

      // Upload file to server
      const response = await uploadImageAPI(file);
      console.log(`📨 [CoverSection] Upload response:`, response.data);

      let imageUrl = response.data?.imageUrl || response.data?.url;

      // If it's a relative path, convert to full URL
      if (imageUrl && imageUrl.startsWith('/')) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5162/api';
        // Remove /api from base URL to get server root
        const serverRoot = baseUrl.replace('/api', '');
        imageUrl = `${serverRoot}${imageUrl}`;
        console.log(`🔗 [CoverSection] Full image URL:`, imageUrl);
      }

      if (!imageUrl) {
        console.error("❌ [CoverSection] No image URL returned from server");
        console.error("Response data:", response.data);
        alert("Lỗi: Không nhận được URL từ server");
        return;
      }

      console.log(`✅ [CoverSection] ${field} uploaded successfully:`, imageUrl);
      console.log(`🔄 [CoverSection] Calling onUpdateImage with:`, { field, imageUrl });
      onUpdateImage(field, imageUrl);
    } catch (error) {
      console.error(`❌ [CoverSection] Failed to upload ${field}:`, error);
      alert(`Lỗi: Không thể upload ảnh. Vui lòng thử lại.`);
    }
  };

  const renderActionButtons = () => {
    if (isOwnProfile) return (
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition">+ Thêm vào tin</button>
    );
  
    const MessageBtn = () => (
      <button className="bg-gray-200 dark:bg-zinc-700 dark:text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-zinc-600 transition">💬 Nhắn tin</button>
    );
  
    let PrimaryButton;
    switch (currentFriendStatus) { // đổi friendStatus → currentFriendStatus
      case 'friend':
        PrimaryButton = (
          <button onClick={handleUnfriend}
            className="bg-gray-200 dark:bg-zinc-700 dark:text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition">
            👤 Bạn bè
          </button>
        );
        break;
      case 'pending':
        PrimaryButton = (
          <button className="bg-gray-200 px-4 py-2 rounded-md font-semibold text-slate-500 cursor-default">
            ⏳ Đã gửi lời mời
          </button>
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
      default:
        PrimaryButton = (
          <button onClick={handleSendRequest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition">
            ➕ Thêm bạn bè
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
      {/* PHẦN ẢNH BÌA */}
      <div className="relative h-[250px] md:h-[350px] w-full bg-gray-300 dark:bg-zinc-800 rounded-b-xl overflow-hidden group">
        <img src={user.coverUrl} className="w-full h-full object-cover" alt="cover" />
        {isOwnProfile && (
          <label className="absolute bottom-4 right-4 bg-white dark:bg-zinc-800 p-2 rounded-lg cursor-pointer shadow-md hover:bg-gray-100 transition flex items-center gap-2 z-20">
            <span className="text-xl">📷</span>
            <span className="hidden md:inline font-semibold text-sm dark:text-white">Chỉnh sửa ảnh bìa</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'coverUrl')} />
          </label>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-end px-4 pb-4 -mt-16 md:-mt-12 gap-4 relative">
        {/* PHẦN ẢNH ĐẠI DIỆN */}
        <div className="relative z-10 group">
          <img src={user.avatarUrl} className="w-40 h-40 rounded-full border-4 border-white dark:border-[#242526] object-cover shadow-md" alt="avatar" />
          {isOwnProfile && (
            <label className="absolute bottom-2 right-2 bg-gray-200 dark:bg-zinc-700 p-2 rounded-full cursor-pointer hover:bg-gray-300 transition shadow-sm border border-gray-300 dark:border-zinc-600">
              <span>📷</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatarUrl')} />
            </label>
          )}
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