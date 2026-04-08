import Button from './Button';
import Avatar from './Avatar';
import { useState } from 'react';

interface PostProps {
  author: string;
  content: string;
  time: React.ReactNode; 
}

const PostCard = ({ author, content, time }: PostProps) => {
  // 1. Logic Like
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 10)); // Giả lập số like ban đầu

  // 2. Logic Hiện/Ẩn ô bình luận
  const [showCommentInput, setShowCommentInput] = useState(false);

  // 3. Logic Lưu bài viết
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar size="md" /> 
          <div className="flex flex-col">
            <p className="font-bold text-sm text-slate-900 leading-none mb-1">{author}</p>
            <div className="leading-none">{time}</div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">•••</button>
      </div>

      {/* NỘI DUNG */}
      <p className="text-slate-800 text-sm leading-relaxed">{content}</p>

      {/* HÌNH ẢNH */}
      <div className="h-64 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 italic text-xs">
        [Hình ảnh bài viết]
      </div>

      {/* THỐNG KÊ NHANH (Số like) */}
      <div className="flex items-center text-xs text-slate-500 px-1">
        <span className="flex items-center">
          ❤️ <span className="ml-1 font-medium">{likeCount} lượt thích</span>
        </span>
      </div>

      {/* HÀNH ĐỘNG */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
        <Button 
          variant={liked ? "primary" : "secondary"} 
          onClick={handleLike}
          className="flex-1 py-2 text-xs font-bold uppercase"
        >
          {liked ? "❤️ Đã Thích" : "👍 Thích"}
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex-1 py-2 text-xs font-bold uppercase"
        >
          💬 Bình luận
        </Button>

        <Button 
          variant={saved ? "primary" : "secondary"} 
          onClick={() => setSaved(!saved)}
          className="px-4 py-2 text-xs font-bold uppercase"
        >
          {saved ? "🔖" : "📑"}
        </Button>
      </div>

      {/* Ô NHẬP BÌNH LUẬN (Hiện ra khi nhấn nút Bình luận) */}
      {showCommentInput && (
        <div className="flex items-center space-x-2 pt-2 animate-in fade-in slide-in-from-top-1">
          <Avatar size="sm" />
          <input 
            type="text" 
            placeholder="Viết bình luận..." 
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}
    </div>
  )
}

export default PostCard;