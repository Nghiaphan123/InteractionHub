import React, { useState, useEffect, useRef } from 'react';
import { Pencil, X, Check, Trash2, MoreHorizontal } from 'lucide-react';

interface MessageProps {
  initialContent: string;
  sender: string;
  isMe: boolean;
  isEditedFromServer?: boolean; // Thêm từ backend để biết đã sửa hay chưa
  onDelete?: () => void;
  onSaveServer?: (newContent: string) => void;
}

const MessageItem: React.FC<MessageProps> = ({ 
  initialContent, 
  sender, 
  isMe, 
  isEditedFromServer, 
  onDelete, 
  onSaveServer 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // Quản lý đóng mở menu 3 chấm
  const [content, setContent] = useState(initialContent);
  const [tempContent, setTempContent] = useState(initialContent);
  const [hasEdited, setHasEdited] = useState(isEditedFromServer || false);

  useEffect(() => {
    setContent(initialContent);
    setTempContent(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    const trimmed = tempContent.trim();
    if (trimmed === "" || trimmed === content) {
      setIsEditing(false);
      return;
    }
    
    setContent(trimmed); 
    setHasEdited(true); // Đánh dấu là đã chỉnh sửa
    setIsEditing(false);

    if (onSaveServer) {
      onSaveServer(trimmed);
    }
  };

  const handleCancel = () => {
    setTempContent(content); 
    setIsEditing(false);
  };

  return (
    <div className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'} group relative`}>
      <div className="flex items-start gap-2 max-w-[80%]">
        
        {/* Menu 3 chấm xuất hiện khi hover (Giống FB) */}
        {isMe && !isEditing && (
          <div className="relative self-center">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-lg rounded-md z-10 py-1">
                <button 
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Pencil size={14} /> Chỉnh sửa
                </button>
                <button 
                  onClick={() => { onDelete?.(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            )}
          </div>
        )}

        {/* Khung nội dung bình luận */}
        <div className={`flex-1 px-4 py-2 rounded-2xl shadow-sm transition-all ${
          isMe 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-gray-200 dark:bg-slate-800 dark:text-gray-200 rounded-tl-none'
        } ${isEditing ? 'ring-2 ring-blue-400 min-w-[300px]' : ''}`}>
          
          {isEditing ? (
            <div className="w-full">
              <textarea
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                  }
                  if (e.key === 'Escape') handleCancel();
                }}
                className="w-full bg-white dark:bg-slate-700 text-black dark:text-white rounded p-2 text-sm outline-none resize-none border-none"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2 border-t dark:border-slate-600 pt-2">
                <button onClick={handleCancel} className="text-xs font-semibold hover:underline text-gray-200">Hủy</button>
                <button onClick={handleSave} className="text-xs font-semibold hover:underline text-green-300">Lưu</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[15px] break-words whitespace-pre-wrap leading-tight">{content}</p>
            </>
          )}
        </div>
      </div>
      
      {/* Hiển thị dòng "Đã chỉnh sửa" bên dưới */}
      {(hasEdited) && (
        <span className={`text-[11px] text-gray-500 mt-1 ${isMe ? 'mr-2' : 'ml-2'}`}>
          Đã chỉnh sửa
        </span>
      )}
    </div>
  );
};

export default MessageItem;