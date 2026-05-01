import { useState, useRef, type ChangeEvent } from 'react'; // Thêm ChangeEvent
import Avatar from './Avatar';
import Button from './Button';

interface CreatePostProps {
  // [SỬA] Cập nhật kiểu dữ liệu: onPost nhận content (string) và file (File)
  onPost?: (content: string, imageFile: File | null) => void; 
}

const CreatePost = ({ onPost }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [1] MỚI: State để quản lý tệp ảnh thật và link để hiển thị preview
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleSubmit = () => {
    // [SỬA] Gửi thêm selectedImage lên cho component Home
    if ((content.trim() || selectedImage) && onPost) { 
      onPost(content, selectedImage); 
      // Xóa trắng dữ liệu sau khi đăng xong
      setContent(""); 
      setSelectedImage(null);
      setImagePreviewUrl(null);
    }
  };

  const handleFileClick = () => { fileInputRef.current?.click(); };

  // [2] MỚI: Hàm xử lý khi người dùng chọn xong tệp ảnh
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Kiểm tra xem file có phải là ảnh không (cho chắc ăn)
      if (!file.type.startsWith('image/')) {
          alert('Chỉ cho phép chọn tệp hình ảnh, ông ơi!');
          return;
      }

      // Lưu file thật để gửi lên server
      setSelectedImage(file);

      // Tạo một cái link tạm thời (Preview URL) để hiển thị ra màn hình
      const objectUrl = URL.createObjectURL(file);
      setImagePreviewUrl(objectUrl);
    }
  };

  // [3] MỚI: Hàm để xóa ảnh đã chọn nếu không thích nữa
  const handleRemoveImage = () => {
      setSelectedImage(null);
      if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl); // Giải phóng bộ nhớ
          setImagePreviewUrl(null);
      }
  };

  // Vô hiệu hóa nút Đăng nếu không có chữ mà cũng không có ảnh
  const isButtonDisabled = !content.trim() && !selectedImage;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex space-x-3 items-start">
        <Avatar size="md" />
        
        {/* Khu vực ô nhập liệu */}
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì thế?" 
          className="bg-slate-100 flex-1 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm min-h-[80px] resize-none"
        />
      </div>

      {/* [4] MỚI: KHU VỰC HIỂN THỊ ẢNH XEM TRƯỚC (PREVIEW) */}
      {imagePreviewUrl && (
          <div className="relative pt-2 pl-12 group">
              {/* Ảnh xem trước */}
              <img 
                  src={imagePreviewUrl} 
                  alt="Ảnh đã chọn" 
                  className="rounded-xl max-h-80 object-cover border border-slate-100 shadow-inner"
              />
              {/* Nút X xóa ảnh - Chỉ hiện khi di chuột vào ảnh */}
              <button 
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-2 bg-white text-slate-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg font-bold opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-red-500 transition-all cursor-pointer"
                  title="Xóa ảnh này"
              >
                  ✕
              </button>
          </div>
      )}

      {/* Khu vực các nút chức năng */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <div className="flex space-x-2 md:space-x-4 text-slate-500 text-sm font-medium">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*" // Chỉ cho phép chọn ảnh (Tạm bỏ video cho code sạch)
            className="hidden" 
          />

          <button 
            onClick={handleFileClick}
            className="hover:bg-slate-100 p-2 rounded-lg flex items-center space-x-1 transition cursor-pointer"
          >
            <span>📷</span> <span className="hidden sm:inline">Ảnh/Video</span>
          </button>

          <button className="hover:bg-slate-100 p-2 rounded-lg flex items-center space-x-1 transition cursor-pointer">
            <span>😊</span> <span className="hidden sm:inline">Cảm xúc</span>
          </button>
        </div>
        
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isButtonDisabled} 
          className={isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          Đăng bài
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;