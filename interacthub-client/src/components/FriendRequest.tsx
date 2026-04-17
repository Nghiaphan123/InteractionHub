import Avatar from './Avatar';
import Button from './Button';

interface FriendCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    mutualFriends?: number;
  };
  type: 'received' | 'sent' | 'suggestion' | 'all';
}

const FriendRequest = ({ user, type }: FriendCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#242526] rounded-xl shadow-sm border dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
      <div className="flex items-center space-x-4">
        <Avatar size="lg" /> {/* Hoặc dùng img src={user.avatar} nếu Avatar của ông nhận src */}
        <div>
          <h4 className="font-bold dark:text-white hover:underline cursor-pointer">{user.name}</h4>
          {user.mutualFriends !== undefined && (
            <p className="text-sm text-gray-500 dark:text-zinc-400">{user.mutualFriends} bạn chung</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {type === 'received' && (
          <>
            <Button variant="primary" className="px-6 py-2">Xác nhận</Button>
            <Button variant="secondary" className="px-6 py-2">Xóa</Button>
          </>
        )}
        {type === 'sent' && (
          <Button variant="secondary" className="px-6 py-2">Hủy lời mời</Button>
        )}
        {type === 'suggestion' && (
          <>
            <Button variant="primary" className="px-6 py-2">Thêm bạn bè</Button>
            <Button variant="secondary" className="px-6 py-2">Gỡ</Button>
          </>
        )}
        {type === 'all' && (
          <Button variant="secondary" className="px-6 py-2">Hủy kết bạn</Button>
        )}
      </div>
    </div>
  );
};

export default FriendRequest;