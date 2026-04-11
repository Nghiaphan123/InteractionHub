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
}

