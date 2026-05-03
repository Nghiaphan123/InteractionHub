import { useState, useEffect } from 'react';
import axiosClient from '../../api/axios';
import { useAuth } from '../../context/AuthContext';


type FriendsTab = 'requests' | 'suggestions' | 'all';

const FriendsSection = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<FriendsTab>('requests');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pendingRes, friendsRes] = await Promise.all([
          axiosClient.get('/friends/pending'),
          axiosClient.get('/friends'),
        ]);
        const sentRes = await axiosClient.get('/friends/sent');
        setPendingRequests(pendingRes.data);
        setFriends(friendsRes.data);
        setSentRequests(sentRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAccept = async (friendshipId: number) => {
    try {
      await axiosClient.put(`/friends/accept/${friendshipId}`);
      setPendingRequests(prev => prev.filter(r => r.id !== friendshipId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (friendshipId: number) => {
    try {
      await axiosClient.put(`/friends/decline/${friendshipId}`);
      setPendingRequests(prev => prev.filter(r => r.id !== friendshipId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    try {
      await axiosClient.delete(`/friends/${friendId}`);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center py-8 text-slate-500">Đang tải...</div>;

    switch (activeTab) {
      case 'requests':
        return (
          <div className="space-y-8">
            {/* Lời mời nhận được */}
            <div>
              <h3 className="text-xl font-bold dark:text-white mb-4">
                Lời mời kết bạn {pendingRequests.length > 0 && `(${pendingRequests.length})`}
              </h3>
              {pendingRequests.length === 0 ? (
                <p className="text-slate-500 italic">Không có lời mời nào</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {pendingRequests.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden">
                          {r.senderAvatarUrl ? (
                            <img src={r.senderAvatarUrl.startsWith("http") ? r.senderAvatarUrl : `http://localhost:5162${r.senderAvatarUrl}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold">{r.senderFullName?.[0]}</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm dark:text-white">{r.senderFullName}</p>
                          <p className="text-xs text-slate-500">@{r.senderUsername}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(r.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition">
                          Chấp nhận
                        </button>
                        <button onClick={() => handleDecline(r.id)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition">
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lời mời đã gửi */}
            <div className="border-t dark:border-zinc-700 pt-6">
              <h3 className="text-xl font-bold dark:text-white mb-4">
                Lời mời đã gửi {sentRequests.length > 0 && `(${sentRequests.length})`}
              </h3>
              {sentRequests.length === 0 ? (
                <p className="text-slate-500 italic">Chưa gửi lời mời nào</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {sentRequests.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden">
                          {r.avatarUrl ? ( // ← đổi thành avatarUrl
                            <img src={r.avatarUrl.startsWith("http") ? r.avatarUrl : `http://localhost:5162${r.avatarUrl}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold">{r.fullName?.[0]}</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm dark:text-white">{r.fullName}</p> {/* ← đổi */}
                          <p className="text-xs text-slate-500">@{r.username}</p> {/* ← đổi */}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 italic">⏳ Chờ xác nhận</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'all':
        return (
          <div>
            <h3 className="text-xl font-bold dark:text-white mb-4">
              Tất cả bạn bè {friends.length > 0 && `(${friends.length})`}
            </h3>
            {friends.length === 0 ? (
              <p className="text-slate-500 italic">Chưa có bạn bè nào</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {friends.map(f => {
                  // Lấy thông tin người kia (không phải mình)
                  const isCurrentUserSender = f.senderId === currentUser?.id;
                  const friendName = isCurrentUserSender ? f.receiverFullName : f.senderFullName;
                  const friendUsername = isCurrentUserSender ? f.receiverUsername : f.senderUsername;
                  const friendAvatar = isCurrentUserSender ? f.receiverAvatarUrl : f.senderAvatarUrl;
                  const friendId = isCurrentUserSender ? f.receiverId : f.senderId;
                  return (
                    <div key={f.id} className="flex items-center justify-between bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden">
                          {friendAvatar ? (
                            <img src={friendAvatar.startsWith("http") ? friendAvatar : `http://localhost:5162${friendAvatar}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold">{friendName?.[0]}</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm dark:text-white">{friendName}</p>
                          <p className="text-xs text-slate-500">@{friendUsername}</p>
                        </div>
                      </div>
                      <button onClick={() => handleUnfriend(friendId)}
                        className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition">
                        Hủy kết bạn
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'suggestions':
        return (
          <div>
            <h3 className="text-xl font-bold dark:text-white mb-4">Gợi ý kết bạn</h3>
            <p className="text-slate-500 italic">Tính năng đang cập nhật...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-[#242526] rounded-xl shadow min-h-[500px] overflow-hidden">
      <div className="w-full md:w-80 border-r dark:border-zinc-700 p-4">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Bạn bè</h2>
        <div className="space-y-2">
          <button onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-semibold ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
            <span className="bg-gray-200 dark:bg-zinc-700 p-2 rounded-full">👥</span>
            Lời mời kết bạn
            {pendingRequests.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('suggestions')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-semibold ${activeTab === 'suggestions' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
            <span className="bg-gray-200 dark:bg-zinc-700 p-2 rounded-full">✨</span> Gợi ý
          </button>
          <button onClick={() => setActiveTab('all')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-semibold ${activeTab === 'all' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
            <span className="bg-gray-200 dark:bg-zinc-700 p-2 rounded-full">👤</span> Tất cả bạn bè
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gray-50 dark:bg-[#18191a]">
        {renderContent()}
      </div>
    </div>
  );
};

export default FriendsSection;