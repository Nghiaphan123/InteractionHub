import Avatar from './Avatar';
import TimeAgo from './TimeAgo'; // Tận dụng cái TimeAgo ông đã viết
import type { ChatMessage } from '../types/types';

interface ChatItemProps {
  data: ChatMessage;
  onClick: () => void;
}

const ChatItem = ({ data, onClick }: ChatItemProps) => {
  return (
    <div 
      onClick={onClick}
      className="p-3 flex items-center space-x-3 hover:bg-slate-50 cursor-pointer transition group"
    >
      <div className="relative">
        <Avatar src={data.user.avatarUrl} size="md" />
        {data.user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${data.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
          {data.user.name}
        </p>
        <p className={`text-xs truncate ${data.unreadCount > 0 ? 'font-semibold text-blue-600' : 'text-slate-500'}`}>
          {data.lastMessage} · <TimeAgo date={data.timestamp} />
        </p>
      </div>
      {data.unreadCount > 0 && (
        <div className="flex flex-col items-end space-y-1">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
          <span className="text-[10px] text-blue-600 font-bold">{data.unreadCount}</span>
        </div>
      )}
    </div>
  );
};

export default ChatItem;