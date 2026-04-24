import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import TrendingTag from '../components/TrendingTag';
import StoryItem from '../components/StoryItem';
import NotificationItem from '../components/NotificationItem';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import type { Post } from '../types/post';
import { CURRENT_USER } from '../services/auth';

const Home = () => {
  // 1. Khởi tạo từ localStorage
  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem('interactionhub_posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });

  const currentUser = CURRENT_USER;

  // 2. Mảng dữ liệu mẫu cho Story (Đã thêm ID vào user để hết lỗi TypeScript)
  const mockStories = [
    { id: "me", user: { id: "u_me", name: "Bạn", avatarUrl: "" }, isMe: true },
    { id: "s1", user: { id: "u2", name: "Văn A", avatarUrl: "https://i.pravatar.cc/150?u=a" }, isMe: false },
    { id: "s2", user: { id: "u3", name: "Thị B", avatarUrl: "https://i.pravatar.cc/150?u=b" }, isMe: false },
    { id: "s3", user: { id: "u4", name: "Trần Nam", avatarUrl: "https://i.pravatar.cc/150?u=c" }, isMe: false },
    { id: "s4", user: { id: "u5", name: "Lý Chí Huy", avatarUrl: "https://i.pravatar.cc/150?u=d" }, isMe: false },
  ];

  // 3. Tự động lưu vào localStorage khi posts thay đổi
  useEffect(() => {
    localStorage.setItem('interactionhub_posts', JSON.stringify(posts));
  }, [posts]);

  // 4. Giả lập lấy dữ liệu từ Server nếu local trống
  useEffect(() => {
    if (posts.length === 0) {
      const mockDataFromServer: Post[] = [
        {
          id: "1",
          author: { id: "u1", fullName: "Lê Hoài Vũ", avatarUrl: "" },
          content: "Đã chuyển đổi sang cấu trúc dữ liệu động thành công!",
          createdAt: new Date().toISOString(),
          likesCount: 10,
          commentsCount: 2,
          isLiked: false
        },
        {
          id: "2",
          author: {id: "u2", fullName: "Huy (Admin)", avatarUrl: "" },
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

  // 5. Hàm thêm bài viết mới
  const addNewPost = (content: string, imageFile: File | null) => {
    let url = "";
    if (imageFile) {
      url = URL.createObjectURL(imageFile);
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl
      },
      content: content,
      imageUrl: url,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false
    };

    setPosts([newPost, ...posts]);
  };

  // 6. Hàm xóa bài viết
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
          <p className="mb-4 text-blue-600 cursor-pointer">🏠 Trang chủ</p>
          <div className="space-y-3 text-sm font-medium text-slate-600">
            <p className="cursor-pointer hover:text-blue-600 transition">👥 Nhóm</p>
            <p className="cursor-pointer hover:text-blue-600 transition">🔖 Đã lưu</p>
          </div>
        </div>
      </aside>

      {/* CỘT GIỮA */}
      <main className="md:col-span-2 space-y-4">
        {/* Story Section */}
        <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
          {mockStories.map((story) => (
            <StoryItem key={story.id} data={story} />
          ))}
        </div>

        <CreatePost onPost={addNewPost} />

        {/* Post List */}
        {posts.length > 0 ? (
          posts.map((postItem) => (
            <PostCard 
              key={postItem.id} 
              post={postItem}
              onDelete={handleDeletePost}
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
          <NotificationItem 
            data={{
              id: "n1",
              sender: { id: "u1", name: "Trần Nam", avatarUrl: "" },
              action: "đã thích bài viết",
              timestamp: new Date().toISOString(),
              isUnread: true
            }} 
          />
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs uppercase text-slate-400 mb-3">Xu hướng</h3>
          <TrendingTag name="ReactJS" posts="1.2k" />
          <TrendingTag name="SGU_IT" posts="500" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
          <h3 className="font-bold text-xs uppercase text-slate-400 mb-4">Người nhắn tin</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar size="sm" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Văn A</p>
                  <p className="text-xs text-slate-500 truncate w-24">Đang làm gì đó?</p>
                </div>
              </div>
              <Badge content={1} size="sm" />
            </div>

            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition">
              <div className="flex items-center space-x-3">
                <Avatar size="sm" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Thị B</p>
                  <p className="text-xs text-slate-400">5 phút trước</p>
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