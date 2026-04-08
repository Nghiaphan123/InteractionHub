import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale'; // Ngôn ngữ tiếng Việt

interface TimeAgoProps {
  date: Date | string | number;
}

const TimeAgo = ({ date }: TimeAgoProps) => {
  // Chuyển đổi mọi định dạng đầu vào thành đối tượng Date của JS
  const dateObj = new Date(date);

  return (
    <span className="text-xs text-slate-400 font-medium hover:underline cursor-pointer">
      {formatDistanceToNow(dateObj, { 
        addSuffix: true, // Thêm chữ "trước" hoặc "sau"
        locale: vi      // Hiển thị tiếng Việt
      })}
    </span>
  );
};

export default TimeAgo;