import Avatar from './Avatar';
import Button from './Button';

const FriendRequest = ({ name }: { name: string }) => {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="flex items-center space-x-2">
        <Avatar size="sm" />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex space-x-1">
        <Button variant="primary" className="px-3 py-1 text-[10px]">Thêm</Button>
        <Button variant="secondary" className="px-3 py-1 text-[10px]">Xóa</Button>
      </div>
    </div>
  );
};

export default FriendRequest;