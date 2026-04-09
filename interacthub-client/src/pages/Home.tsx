import { useState } from 'react'; // Thêm useState
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import TrendingTag from '../components/TrendingTag';
import StoryItem from '../components/StoryItem';
import NotificationItem from '../components/NotificationItem';
import TimeAgo from '../components/TimeAgo';
import Avatar from '../components/Avatar'; // Thêm import này
import Badge from '../components/Badge'; // Thêm import này

const Home = () => {
  // 1. Tạo mảng posts để chứa danh sách bài viết
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Lê Hoài Vũ",
      content: "Đã tách trang chủ ra file riêng thành công!",
      date: new Date('2026-04-07T10:00:00')
    }
  ]);

  // 2. Hàm để thêm bài viết mới (Sẽ truyền xuống component CreatePost)
  const addNewPost = (content: string) => {
    const newPost = {
      id: Date.now(), // Tạo ID duy nhất bằng thời gian
      author: "Hoài An", // Tên người dùng hiện tại
      content: content,
      date: new Date() // Thời gian vừa đăng
    };
    // Thêm vào đầu mảng
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
      {/* CỘT TRÁI - Giữ nguyên */}
      <aside className="hidden md:block col-span-1 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 font-bold">
          <p className="mb-4 text-blue-600">🏠 Trang chủ</p>
          <div className="space-y-3 text-sm font-medium text-slate-600">
            <p className="cursor-pointer hover:text-blue-600 transition">👥 Nhóm</p>
            <p className="cursor-pointer hover:text-blue-600 transition">🔖 Đã lưu</p>
          </div>
        </div>
      </aside>

      {/* CỘT GIỮA */}
      <main className="md:col-span-2 space-y-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
          <StoryItem name="Bạn" isMe />
          <StoryItem name="Văn A" />
          <StoryItem name="Thị B" />
        </div>

        {/* 3. Truyền hàm addNewPost vào CreatePost */}
        <CreatePost onPost={addNewPost} />

        {/* 4. Duyệt mảng posts để hiển thị danh sách bài viết */}
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            id={post.id} // Quan trọng để lưu bình luận đúng bài!
            author={post.author} 
            content={post.content} 
            time={<TimeAgo date={post.date} />} 
          />
        ))}
      </main>

      {/* CỘT PHẢI - Giữ nguyên */}
      <aside className="hidden md:block col-span-1 space-y-4">
        {/* Khối Thông báo - Giữ nguyên */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-slate-400 mb-3">Thông báo</h3>
          <NotificationItem user="Trần Nam" action="đã thích bài viết" time={<TimeAgo date={new Date('2026-04-07T15:59:00')} />} isUnread />
        </div>
        
        {/* Khối Xu hướng - Giữ nguyên */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-slate-400 mb-3">Xu hướng</h3>
          <TrendingTag name="ReactJS" posts="1.2k" />
          <TrendingTag name="SGU_IT" posts="500" />
        </div>

        {/* KHỐI NGƯỜI NHẮN TIN - MỚI THÊM VÀO DƯỚI CÙNG */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xs uppercase text-slate-400">Người nhắn tin</h3>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">MỚI</span>
          </div>
          
          <div className="space-y-4">
            {/* Tài khoản 1 - Có tin nhắn chờ */}
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar size="sm" />
                  {/* Chấm xanh online */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-bold">Văn A</p>
                  <p className="text-xs text-slate-500 truncate w-24">Đang làm gì đó?</p>
                </div>
              </div>
              {/* Badge số tin nhắn - variant danger (mặc định đỏ) */}
              <Badge content={1} size="sm" />
            </div>

            {/* Tài khoản 2 - Không có tin nhắn chờ */}
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition">
              <div className="flex items-center space-x-3">
                <Avatar size="sm" />
                <div>
                  <p className="text-sm font-bold">Thị B</p>
                  <p className="text-xs text-slate-400">Đã xem 5p trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Home;