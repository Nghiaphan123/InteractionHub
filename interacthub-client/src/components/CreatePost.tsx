import { useState } from 'react'; // 1. Thêm useState
import Avatar from './Avatar';
import Button from './Button';

// 2. Định nghĩa kiểu dữ liệu cho Prop onPost
interface CreatePostProps {
  onPost?: (content: string) => void;
}

const CreatePost = ({ onPost }: CreatePostProps) => {
  // 3. Tạo State để quản lý nội dung người dùng gõ
  const [content, setContent] = useState("");

  // 4. Hàm xử lý khi nhấn nút "Đăng bài"
  const handleSubmit = () => {
    if (content.trim() && onPost) {
      onPost(content); // Gửi nội dung lên component Home
      setContent("");  // Xóa trắng ô nhập sau khi đăng xong
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex space-x-3">
        <Avatar size="md" />
        <input 
          type="text" 
          value={content} // 5. Gắn giá trị từ State
          onChange={(e) => setContent(e.target.value)} // 6. Cập nhật State khi gõ phím
          placeholder="Bạn đang nghĩ gì thế?" 
          className="bg-slate-100 flex-1 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} // Nhấn Enter cũng đăng được luôn
        />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <div className="flex space-x-2 md:space-x-4 text-slate-500 text-sm font-medium">
          <button className="hover:bg-slate-100 p-2 rounded-lg flex items-center space-x-1 transition">
            <span>📷</span> <span className="hidden sm:inline">Ảnh/Video</span>
          </button>
          <button className="hover:bg-slate-100 p-2 rounded-lg flex items-center space-x-1 transition">
            <span>😊</span> <span className="hidden sm:inline">Cảm xúc</span>
          </button>
        </div>
        
        {/* 7. Gắn sự kiện onClick vào Button */}
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={!content.trim()} // Vô hiệu hóa nút nếu chưa gõ chữ nào
          className={!content.trim() ? "opacity-50 cursor-not-allowed" : ""}
        >
          Đăng bài
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;