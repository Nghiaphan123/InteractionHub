export interface User {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  friendsCount: number;
  location: string;
  education: string;
  isOwnProfile: boolean;
  friendStatus: 'none' | 'friend' | 'pending' | 'follower';
  details: UserDetail[];
}

export interface UserDetail {
  id: string;
  content: string;
  type: 'education' | 'work' | 'location' | 'hometown' | 'status' | 'social';
  subStatus?: 'past' | 'current'
  isVisible: boolean; // Dành cho nút gạt ẩn/hiện
}