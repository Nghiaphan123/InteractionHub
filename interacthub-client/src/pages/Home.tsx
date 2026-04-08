import { useState } from 'react'; // Thêm useState
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import TrendingTag from '../components/TrendingTag';
import StoryItem from '../components/StoryItem';
import NotificationItem from '../components/NotificationItem';
import TimeAgo from '../components/TimeAgo';

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
            author={post.author} 
            content={post.content} 
            time={<TimeAgo date={post.date} />} 
          />
        ))}
      </main>

      {/* CỘT PHẢI - Giữ nguyên */}
      <aside className="hidden md:block col-span-1 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-slate-400 mb-3">Thông báo</h3>
          <NotificationItem user="Trần Nam" action="đã thích bài viết" time={<TimeAgo date={new Date('2026-04-07T15:59:00')} />} isUnread />
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-slate-400 mb-3">Xu hướng</h3>
          <TrendingTag name="ReactJS" posts="1.2k" />
          <TrendingTag name="SGU_IT" posts="500" />
        </div>
      </aside>
    </div>
  );
};

export default Home;