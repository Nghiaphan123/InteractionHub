// types.ts
export interface UserBasic {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string;
  user: UserBasic;
  lastMessage: string;
  timestamp: string; // Lưu chuỗi ISO từ DB (ví dụ: "2026-04-14T...")
  unreadCount: number;
}

export interface NotificationData {
  id: string;
  sender: UserBasic;
  action: string; 
  timestamp: string;
  isUnread: boolean;
}

export interface StoryData {
  id: string;
  user: UserBasic;
  isMe?: boolean;
}