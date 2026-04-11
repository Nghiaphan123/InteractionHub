import Avatar from './Avatar';

const StoryItem = ({ name, avatarUrl, isMe = false }: { name: string, avatarUrl?: string, isMe?: boolean }) => {
  return (
    <div className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0">
      <div className={`p-1 rounded-full border-2 ${isMe ? 'border-slate-300' : 'border-blue-500'}`}>
        <Avatar src={avatarUrl} size="lg" className={isMe ? 'grayscale' : ''} />
      </div>
      <span className="text-[10px] font-medium text-slate-600 w-16 text-center truncate">
        {isMe ? "Bạn" : name}
      </span>
    </div>
  );
};

export default StoryItem;