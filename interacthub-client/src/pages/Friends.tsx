import FriendRequest from '../components/FriendRequest';

const Friends = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold mb-6">Lời mời kết bạn</h1>
        <div className="grid grid-cols-1 gap-4">
          <FriendRequest name="Nguyễn Văn A" />
          <FriendRequest name="Trần Thị B" />
        </div>
      </div>
    </div>
  );
};

export default Friends;