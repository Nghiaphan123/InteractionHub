import Avatar from './Avatar';
import type { StoryData } from '../types/types'; // Đảm bảo đã định nghĩa StoryData trong types.ts

interface StoryItemProps {
  data: StoryData;
}
const StoryItem = ({ data }: StoryItemProps) => {
  return (
    <div className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0">
      {/* Dùng data.isMe để quyết định màu viền */}
      <div className={`p-1 rounded-full border-2 ${data.isMe ? 'border-slate-300' : 'border-blue-500'}`}>
        <Avatar 
          src={data.user.avatarUrl} 
          size="lg" 
          className={data.isMe ? 'grayscale' : ''} 
        />
      </div>
      <span className="text-[10px] font-medium text-slate-600 w-16 text-center truncate">
        {data.isMe ? "Bạn" : data.user.name}
      </span>
    </div>
  );
};

export default StoryItem;