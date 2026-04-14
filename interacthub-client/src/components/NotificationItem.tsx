import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import TimeAgo from './TimeAgo';
import type { NotificationData } from '../types/types';

const NotificationItem = ({ data }: { data: NotificationData }) => {
  return (
    <Link 
      to={`/profile/${data.sender.id}`}
      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${data.isUnread ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
    >
      <Avatar src={data.sender.avatarUrl} size="sm" />
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-bold text-slate-900">{data.sender.name}</span> 
          <span className="text-slate-600"> {data.action}</span>
        </p>
        <TimeAgo date={data.timestamp} />
      </div>
      {data.isUnread && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
    </Link>
  );
};

export default NotificationItem;