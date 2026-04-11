import Avatar from './Avatar';

const NotificationItem = ({ user, avatarUrl, action, time, isUnread = false }: any) => {
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${isUnread ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
      <Avatar src={avatarUrl} size="sm" />
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-bold">{user}</span> {action}
        </p>
        <p className="text-[10px] text-blue-500 font-medium">{time}</p>
      </div>
      {isUnread && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
    </div>
  );
};

export default NotificationItem;