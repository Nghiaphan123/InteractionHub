import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import TrendingTag from '../components/TrendingTag';
import StoryItem from '../components/StoryItem';
import NotificationItem from '../components/NotificationItem';
import TimeAgo from '../components/TimeAgo';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import type { Post } from '../types/post';

const Home = () => {
  // 1. SỬA: Khởi tạo từ localStorage để không bị mất bài khi F5
  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem('interactionhub_posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });

  const [currentUser] = useState({
    fullName: "Huy",
    avatarUrl: "" 
  });

  // 2. MỚI: Mỗi khi danh sách posts thay đổi, tự động lưu vào localStorage
  useEffect(() => {
    localStorage.setItem('interactionhub_posts', JSON.stringify(posts));
  }, [posts]);

  // 3. MỚI: Giả lập lấy dữ liệu từ Server chỉ khi lần đầu chạy và chưa có bài nào trong local
  useEffect(() => {
    if (posts.length === 0) {
        const mockDataFromServer: Post[] = [
          {
            id: "1",
            author: { fullName: "Lê Hoài Vũ", avatarUrl: "" },
            content: "Đã chuyển đổi sang cấu trúc dữ liệu động thành công!",
            createdAt: new Date().toISOString(),
            likesCount: 10,
            commentsCount: 2,
            isLiked: false
          },
          {
            id: "2",
            author: { fullName: "Huy (Admin)", avatarUrl: "" },
            content: "Chào mừng đến với InteractionHub!",
            createdAt: new Date().toISOString(),
            likesCount: 99,
            commentsCount: 5,
            isLiked: true
          }
        ];
        setPosts(mockDataFromServer);
    }
  }, []);

  // 4. Hàm thêm bài viết mới
  const addNewPost = (content: string, imageFile: File | null) => {
    let url = "";
    if (imageFile) {
      url = URL.createObjectURL(imageFile); // Tạo link tạm từ file vừa chọn
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        fullName: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl
      },
      content: content,
      imageUrl: url, // Lưu link ảnh vào đây
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false
    };

    setPosts([newPost, ...posts]);
  };

  // 5. MỚI: Định nghĩa hàm handleDeletePost (Ông bị thiếu cái này nên code lỗi)
  const handleDeletePost = (id: string) => {
    if (window.confirm("Ông có chắc muốn xóa bài viết này không?")) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
      {/* CỘT TRÁI */}
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

        <CreatePost onPost={addNewPost} />

        {/* 6. Duyệt mảng posts - Truyền đầy đủ props bao gồm cả handleDeletePost */}
        {posts.length > 0 ? (
          posts.map((postItem) => (
            <PostCard 
              key={postItem.id} 
              post={postItem}
              onDelete={handleDeletePost} // Truyền hàm xóa xuống đây
              currentUser={currentUser}
            />
          ))
        ) : (
          <p className="text-center text-slate-500 text-sm py-10">Đang tải bài viết...</p>
        )}
      </main>

      {/* CỘT PHẢI */}
      <aside className="hidden md:block col-span-1 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-slate-400 mb-3">Thông báo</h3>
          <NotificationItem user="Trần Nam" action="đã thích bài viết" time={<TimeAgo date={new Date()} />} isUnread />
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-slate-400 mb-3">Xu hướng</h3>
          <TrendingTag name="ReactJS" posts="1.2k" />
          <TrendingTag name="SGU_IT" posts="500" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xs uppercase text-slate-400">Người nhắn tin</h3>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">MỚI</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar size="sm" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-bold">Văn A</p>
                  <p className="text-xs text-slate-500 truncate w-24">Đang làm gì đó?</p>
                </div>
              </div>
              <Badge content={1} size="sm" />
            </div>

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