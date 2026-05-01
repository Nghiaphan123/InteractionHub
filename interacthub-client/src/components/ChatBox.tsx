// src/components/chat/ChatBox.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Image, FileText, ThumbsUp, Send, Smile, PlusCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isMe: boolean;
  timestamp: Date;
}

interface ChatBoxProps {
  contact: { fullName: string; avatarUrl: string };
  onClose: () => void;
}

const ChatBox = ({ contact, onClose }: ChatBoxProps) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Hàm xử lý gửi tin nhắn
  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isMe: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  // Gửi icon Like nhanh
  const handleSendLike = () => {
    const likeMessage: Message = {
      id: Date.now().toString(),
      text: "👍",
      isMe: true,
      timestamp: new Date(),
    };
    setMessages([...messages, likeMessage]);
  };

  return (
    <div className="fixed bottom-0 right-10 w-[330px] bg-white dark:bg-[#242526] shadow-2xl rounded-t-xl border border-gray-200 dark:border-zinc-700 z-[999] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b dark:border-zinc-700 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 p-1 rounded-lg transition">
          <div className="relative">
            <img 
              src={contact.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky"} 
              className="w-8 h-8 rounded-full border border-gray-200" 
              alt="avatar" 
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold dark:text-white text-sm leading-tight">{contact.fullName}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Đang hoạt động</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-blue-500 transition">
            <span className="text-lg font-bold">✕</span>
          </button>
        </div>
      </div>

      {/* Body: Hiển thị tin nhắn */}
      <div 
        ref={scrollRef}
        className="h-72 overflow-y-auto p-3 space-y-3 bg-white dark:bg-[#242526] scrollbar-thin scrollbar-thumb-gray-300"
      >
        <div className="flex flex-col items-center mb-4">
          <img src={contact.avatarUrl} className="w-16 h-16 rounded-full mb-2" alt="" />
          <p className="font-bold text-sm dark:text-white">{contact.fullName}</p>
          <p className="text-xs text-gray-500">Các bạn là bạn bè trên InteractHub</p>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
              msg.isMe 
                ? 'bg-[#0084ff] text-white rounded-tr-none' 
                : 'bg-gray-200 dark:bg-zinc-700 dark:text-white rounded-tl-none'
            } ${msg.text === "👍" ? 'bg-transparent text-4xl p-0 shadow-none' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Ô nhập liệu & Nút chức năng */}
      <div className="p-2 border-t dark:border-zinc-700 bg-white dark:bg-[#242526]">
        <div className="flex items-center gap-1 mb-2">
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-blue-500 transition">
            <PlusCircle size={20} />
          </button>
          
          <label className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-blue-500 transition cursor-pointer">
            <Image size={20} />
            <input type="file" accept="image/*" className="hidden" />
          </label>

          <label className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-blue-500 transition cursor-pointer">
            <FileText size={20} />
            <input type="file" className="hidden" />
          </label>

          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-blue-500 transition">
            <Smile size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Aa" 
            className="flex-1 bg-gray-100 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm outline-none dark:text-white focus:ring-1 focus:ring-blue-500 transition-all"
          />
          
          {inputValue.trim() ? (
            <button onClick={handleSend} className="text-blue-600 hover:scale-110 transition-transform p-1">
              <Send size={20} fill="currentColor" />
            </button>
          ) : (
            <button onClick={handleSendLike} className="text-blue-600 hover:scale-110 transition-transform p-1">
              <ThumbsUp size={20} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;