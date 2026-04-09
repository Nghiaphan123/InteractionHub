import Button from './Button';
import Avatar from './Avatar';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';

interface PostProps {
  id: string | number;
  author: string;
  content: string;
  time: React.ReactNode;
}

// 1. Component Menu dùng Portal
const CommentMenuPortal = ({ 
  anchorRect, 
  onClose, 
  isMyComment, 
  onDelete 
}: { 
  anchorRect: DOMRect; 
  onClose: () => void; 
  isMyComment: boolean;
  onDelete: () => void;
}) => {
  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchorRect.bottom + 4,
    left: anchorRect.left,
    zIndex: 9999,
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998] bg-transparent" onClick={onClose} />
      <div 
        style={style}
        className="w-44 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-[9999] animate-in fade-in slide-in-from-top-1 duration-150"
      >
        {isMyComment ? (
          <>
            <button className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition">
              ✏️ <span>Sửa bình luận</span>
            </button>
            <button 
              onClick={onDelete} 
              className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 font-medium transition"
            >
              🗑️ <span>Xoá bình luận</span>
            </button>
          </>
        ) : (
          <button className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 font-medium transition">
            🚩 <span>Báo cáo</span>
          </button>
        )}
        <button className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer flex items-center gap-2 border-t border-slate-50 transition">
          🙈 <span>Ẩn bình luận</span>
        </button>
      </div>
    </>,
    document.body
  );
};

const PostCard = ({ id, author, content, time }: PostProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 10));
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [saved, setSaved] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCommentMenuIndex, setOpenCommentMenuIndex] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const [comments, setComments] = useState<string[]>(() => {
    const savedComments = localStorage.getItem(`comments-${id}`);
    return savedComments ? JSON.parse(savedComments) : [];
  });

  // Lưu bình luận vào LocalStorage
  useEffect(() => {
    localStorage.setItem(`comments-${id}`, JSON.stringify(comments));
  }, [comments, id]);

  // --- LOGIC MỚI: ĐÓNG MENU KHI LĂN CHUỘT ---
  useEffect(() => {
    const handleScroll = () => {
      if (openCommentMenuIndex !== null) {
        setOpenCommentMenuIndex(null);
      }
    };

    // 'true' ở đây để bắt sự kiện ở capture phase, 
    // giúp nhận diện được cả việc cuộn bên trong các div (như list bình luận)
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openCommentMenuIndex]);
  // ------------------------------------------

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleToggleComment = () => {
    setShowCommentInput(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendComment = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && commentText.trim() !== "") {
      setComments([...comments, commentText.trim()]);
      setCommentText("");
    }
  };

  const handleOpenCommentMenu = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
    setOpenCommentMenuIndex(index);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      {/* HEADER & CONTENT */}
      <div className="flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          <Avatar size="md" /> 
          <div className="flex flex-col">
            <Link to="/profile" className="font-bold text-sm text-slate-900 leading-none mb-1 hover:underline hover:text-blue-600 transition">{author}</Link>
            <div className="leading-none text-xs text-slate-500">{time}</div>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full transition cursor-pointer text-slate-400 hover:bg-slate-100">•••</button>
          {isMenuOpen && (
             <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-20 animate-in fade-in zoom-in duration-150">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition">✨ Quan tâm</button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 transition">🚩 Báo cáo bài viết</button>
             </div>
          )}
        </div>
      </div>

      <p className="text-slate-800 text-sm">{content}</p>

      {/* THỐNG KÊ & NÚT LIKE/CMT */}
      <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-50 pb-2">
        <span className="cursor-pointer hover:text-red-500 transition" onClick={handleLike}>❤️ {likeCount} lượt thích</span>
        <button onClick={() => setShowCommentInput(!showCommentInput)} className="hover:underline cursor-pointer transition">{comments.length} bình luận</button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={liked ? "primary" : "secondary"} onClick={handleLike} className="flex-1 py-2 text-xs font-bold uppercase cursor-pointer transition">{liked ? "❤️ Đã Thích" : "👍 Thích"}</Button>
        <Button variant="secondary" onClick={handleToggleComment} className="flex-1 py-2 text-xs font-bold uppercase cursor-pointer transition">💬 Bình luận</Button>
      </div>

      {/* PHẦN DANH SÁCH BÌNH LUẬN */}
      {showCommentInput && (
        <div className="space-y-4 pt-2">
          <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {comments.map((text, index) => {
              const isMyComment = index % 2 !== 0; 
              return (
                <div key={index} className="flex items-start space-x-2 group relative">
                  <Avatar size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 px-3 py-2 rounded-2xl shadow-sm">
                        <p className="text-[11px] font-bold text-slate-900">{isMyComment ? "Bạn" : "Người dùng khác"}</p>
                        <p className="text-sm text-slate-700">{text}</p>
                      </div>

                      <div className="relative">
                        <button 
                          onClick={(e) => handleOpenCommentMenu(e, index)}
                          className={`p-1 rounded-full transition cursor-pointer 
                            ${openCommentMenuIndex === index 
                              ? 'bg-slate-200 text-slate-900 opacity-100' 
                              : 'opacity-0 group-hover:opacity-100 hover:bg-slate-200 text-slate-400'
                            }`}
                        >
                          •••
                        </button>

                        {openCommentMenuIndex === index && anchorRect && (
                          <CommentMenuPortal 
                            anchorRect={anchorRect}
                            onClose={() => setOpenCommentMenuIndex(null)}
                            isMyComment={isMyComment}
                            onDelete={() => {
                              setComments(comments.filter((_, i) => i !== index));
                              setOpenCommentMenuIndex(null);
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 ml-2 mt-1 text-[10px] font-bold text-slate-500">
                      <button className="hover:underline cursor-pointer transition">Thích</button>
                      <button className="hover:underline cursor-pointer transition">Phản hồi</button>
                      <span>1 phút trước</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-slate-50">
            <Avatar size="sm" />
            <input ref={inputRef} type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={handleSendComment} placeholder="Viết bình luận..." className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm outline-none transition focus:bg-slate-200" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;