import Avatar from './Avatar';

interface CommentProps {
  user: string;
  text: string;
  time: string;
}

const Comment = ({ user, text, time }: CommentProps) => {
  return (
    <div className="flex space-x-2">
      <Avatar size="sm" />
      <div className="bg-slate-100 p-3 rounded-2xl text-sm max-w-[85%]">
        <p className="font-bold">{user}</p>
        <p className="text-slate-700">{text}</p>
        <span className="text-[10px] text-slate-400">{time}</span>
      </div>
    </div>
  );
};

export default Comment;