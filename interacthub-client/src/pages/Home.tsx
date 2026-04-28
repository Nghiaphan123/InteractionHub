import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getPostsAPI } from '../services/postService';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import type { Post } from '../types/post';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPostsAPI();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        const message = axios.isAxiosError(err) 
          ? err.response?.data?.message 
          : "Không thể tải bài viết";
        setError(typeof message === 'string' ? message : "Không thể tải bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handlePostCreated = async (content: string, imageFile: File | null) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }
      
      // Create a new post object
      const newPost: Post = {
        id: `${Date.now()}`,
        author: {
          id: user?.id || '',
          fullName: user?.name || 'User',
          avatarUrl: '',
          username: user?.email || '',
        },
        content,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      };
      setPosts([newPost, ...posts]);
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Main Feed */}
      <main className="w-full">
        {/* Create Post */}
        {user && (
          <div className="mb-6">
            <CreatePost 
              onPost={handlePostCreated}
            />
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 text-center py-12 rounded-lg">
              <p className="text-slate-600 mb-2">Chưa có bài viết nào</p>
              <p className="text-sm text-slate-500">Hãy tạo bài viết đầu tiên hoặc kết bạn để xem bài viết của họ</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
                currentUser={{
                  fullName: user?.name || 'User',
                }}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}