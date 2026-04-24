import React, { useState, useEffect } from 'react';
import type { User } from '../../types/user';

const IntroSidebar = ({ user }: { user: User }) => {
  // Gán giá trị khởi tạo từ user.bio do Backend đổ vào
  const [bio, setBio] = useState(user.bio);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(user.bio);

  // Cập nhật lại bio nếu dữ liệu user thay đổi (ví dụ khi load trang)
  useEffect(() => {
    setBio(user.bio);
    setTempBio(user.bio);
  }, [user.bio]);

  const handleSave = () => {
    setBio(tempBio);
    setIsEditing(false);
    // Backend sẽ viết hàm API updateBio(tempBio) ở đây
  };

  return (
    <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow space-y-4 transition-colors">
      <h3 className="font-bold text-xl dark:text-white text-gray-900">Giới thiệu</h3>
      
      {isEditing ? (
        <div className="space-y-3 text-center">
          <textarea
            value={tempBio}
            onChange={(e) => setTempBio(e.target.value)}
            className="w-full p-2 bg-gray-100 dark:bg-zinc-800 dark:text-white border border-blue-500 rounded-md focus:outline-none text-center italic"
            rows={3}
            maxLength={101}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 dark:text-white rounded-md font-semibold">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold">Lưu</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center italic dark:text-gray-300 text-gray-700">
            {bio || "Chưa có tiểu sử"}
          </div>
          {/* Chỉ hiện nút chỉnh sửa nếu là trang của mình */}
          {user.isOwnProfile && (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-gray-100 dark:bg-zinc-700 dark:text-white py-2 rounded-md font-semibold hover:bg-gray-200 transition"
            >
              Chỉnh sửa tiểu sử
            </button>
          )}
        </div>
      )}

      <ul className="space-y-3 dark:text-gray-300 text-gray-700 text-sm border-t dark:border-zinc-700 pt-4">
        <li className="flex items-center gap-2">🎓 Học tại <b>{user.education}</b></li>
        <li className="flex items-center gap-2">🏠 Sống tại <b>{user.location}</b></li>
      </ul>
      
      {user.isOwnProfile && (
        <button className="w-full bg-gray-100 dark:bg-zinc-700 dark:text-white py-2 rounded-md font-semibold hover:bg-gray-200 transition">
          Chỉnh sửa chi tiết
        </button>
      )}
    </div>
  );
};

export default IntroSidebar;