import React from 'react';

// Sửa Interface: Đổi text thành content
interface BadgeProps {
  content: string | number; 
  variant?: 'primary' | 'danger' | 'success';
  size?: 'sm' | 'md';
  className?: string; // Thêm className để linh hoạt CSS
}

const Badge = ({ 
  content, 
  variant = 'danger', // Mặc định là danger (màu đỏ) cho tin nhắn
  size = 'md', 
  className = '' 
}: BadgeProps) => {
  const variantStyles = {
    primary: 'bg-blue-600 text-white',
    danger: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
  };

  const sizeStyles = {
    // Sm: nhỏ gọn cho nút trên Navbar
    sm: 'text-[10px] px-1 min-w-[16px] h-4', 
    // Md: vừa phải cho danh sách chat
    md: 'text-xs px-1.5 py-0.5 min-w-[20px] h-5',
  };

  return (
    <div className={`inline-flex items-center justify-center rounded-full font-bold leading-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {content}
    </div>
  );
};

export default Badge;