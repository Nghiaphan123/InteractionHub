import Button from './Button';
import Avatar from './Avatar';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import type { Post } from '../types/post';
import TimeAgo from './TimeAgo';
import {
  addCommentAPI,
  deleteCommentAPI,
  getCommentsAPI,
  likePostAPI,
  unlikePostAPI,
  updatePostAPI,
  updatePostAPI,
} from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
interface PostProps {
  post: Post;
  onDelete?: (id: string) => void;
  currentUser: { id: string; fullName: string };
}

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
  avatarUrl?: string | null;
};

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

const PostCard = ({ post, onDelete, currentUser }: PostProps) => {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCommentMenuIndex, setOpenCommentMenuIndex] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null); // Ref cho menu bài viết
  const { user } = useAuth();
  const isMyPost = post.author.id === currentUser.id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (!showCommentInput) return;

    let cancelled = false;
    setLoadingComments(true);
    getCommentsAPI(post.id)
      .then((data) => {
        if (cancelled) return;
        setComments(data as Comment[]);
      })
      .catch((err) => {
        console.error("Failed to load comments:", err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingComments(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showCommentInput, post.id]);

  // Logic đóng mọi menu khi scroll hoặc click ra ngoài
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) setIsMenuOpen(false);
      if (openCommentMenuIndex !== null) setOpenCommentMenuIndex(null);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, openCommentMenuIndex]);

  const handleLike = async () => {
    const currentLiked = liked;
    const nextLiked = !currentLiked;

    setLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    try {
      if (nextLiked) await likePostAPI(post.id);
      else await unlikePostAPI(post.id);
    } catch (err) {
      // Revert optimistic UI if the request fails.
      setLiked(currentLiked);
      setLikeCount((prev) => prev + (currentLiked ? 1 : -1));
      console.error("Failed to toggle like:", err);
    }
  };

  const handleToggleComment = () => {
    setShowCommentInput(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendComment = async (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;

    const trimmed = commentText.trim();
    if (!trimmed) return;

    e.preventDefault();
    setCommentText("");

    try {
      const res = await addCommentAPI(post.id, { content: trimmed });
      // Backend returns the created comment DTO.
      setComments((prev) => [res.data as Comment, ...prev]);
    } catch (err) {
      console.error("Failed to add comment:", err);
      // Put the text back so the user can retry.
      setCommentText(trimmed);
    }
  };

  const handleOpenCommentMenu = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
    setOpenCommentMenuIndex(index);
  };

  const handleEditPost = async () => {
    try {
      await updatePostAPI(post.id, { content: editContent });
      post.content = editContent; // cập nhật local
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to edit post:", err);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          {/* Click vào Avatar để tới profile */}
          <Link to={`/profile/${post.author.id}`}>
            <Avatar size="md" src={post.author.avatarUrl} />
          </Link>
          <div className="flex flex-col">
            {/* Click vào Tên để tới profile */}
            <Link to={`/profile/${post.author.id}`} className="font-bold text-sm text-slate-900 leading-none mb-1 hover:underline hover:text-blue-600 transition">
              {post.author.fullName}
            </Link>
            <div className="leading-none text-xs text-slate-500">
              <TimeAgo date={new Date(post.createdAt)} />
            </div>
          </div>
        </div>

        {/* Menu dấu 3 chấm bài viết */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full transition cursor-pointer text-slate-400 hover:bg-slate-100"
          >
            •••
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-20 animate-in fade-in zoom-in duration-150">
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition">✨ Quan tâm</button>
              {isMyPost && (
                <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition">
                  ✏️ Chỉnh sửa bài viết
                </button>
              )}
              {isMyPost ? (
                <button
                  onClick={() => onDelete && onDelete(post.id)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 transition"
                >
                  🗑️ Xoá bài viết
                </button>
              ) : (
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 transition">🚩 Báo cáo bài viết</button>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-xl outline-none resize-none text-sm focus:ring-2 focus:ring-blue-500/30"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 transition">
              Hủy
            </button>
            <button onClick={handleEditPost}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition">
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-800 text-sm">{post.content}</p>
      )}
      
      {post.imageUrl && (
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
          <img
            src={post.imageUrl.startsWith("http") ? post.imageUrl : `http://interacthub-staging.eba-wgfffkes.ap-southeast-1.elasticbeanstalk.com${post.imageUrl}`}
            alt="Post content"
            className="w-full h-auto max-h-[450px] object-cover"
          />
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-50 pb-2">
        <span className="cursor-pointer hover:text-red-500 transition" onClick={handleLike}>
          ❤️ {likeCount} lượt thích
        </span>
        <button onClick={() => setShowCommentInput(!showCommentInput)} className="hover:underline cursor-pointer transition">
          {post.commentsCount} bình luận
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={liked ? "primary" : "secondary"} onClick={handleLike} className="flex-1 py-2 text-xs font-bold uppercase cursor-pointer transition">
          {liked ? "❤️ Đã Thích" : "👍 Thích"}
        </Button>
        <Button variant="secondary" onClick={handleToggleComment} className="flex-1 py-2 text-xs font-bold uppercase cursor-pointer transition">
          💬 Bình luận
        </Button>
      </div>

      {showCommentInput && (
        <div className="space-y-4 pt-2">
          <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {loadingComments ? (
              <div className="text-xs text-slate-500 py-4">Đang tải bình luận...</div>
            ) : (
              comments.map((c, index) => {
                const isMyComment = c.userId === currentUser.id;
                return (
                  <div key={c.id} className="flex items-start space-x-2 group relative">
                    <Avatar size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 px-3 py-2 rounded-2xl shadow-sm">
                          <p className="text-[11px] font-bold text-slate-900">{isMyComment ? "Bạn" : "Người dùng khác"}</p>
                          <p className="text-sm text-slate-700">{c.content}</p>
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
                                // Fire-and-forget; UI updates immediately after API call succeeds.
                                deleteCommentAPI(post.id, String(c.id))
                                  .then(() => {
                                    setComments((prev) => prev.filter((x) => x.id !== c.id));
                                    setOpenCommentMenuIndex(null);
                                  })
                                  .catch((err) => {
                                    console.error("Failed to delete comment:", err);
                                  });
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-50">
            <Avatar size="sm" />
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleSendComment}
              placeholder="Viết bình luận..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm outline-none transition focus:bg-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
