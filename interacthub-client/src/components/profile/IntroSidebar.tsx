const IntroSidebar = () => {
  return (
    <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow space-y-4">
      <h3 className="font-bold text-xl dark:text-white">Giới thiệu</h3>
      <div className="text-center italic dark:text-gray-300">
        "Việc gì cũng có thể thành công nếu cố gắng"
      </div>
      <button className="w-full bg-gray-100 dark:bg-zinc-700 dark:text-white py-2 rounded-md font-semibold">Chỉnh sửa tiểu sử</button>
      
      <ul className="space-y-3 dark:text-gray-300 text-sm">
        <li className="flex items-center gap-2">🎓 Học tại <b>Đại học CNTT</b></li>
        <li className="flex items-center gap-2">🏠 Sống tại <b>TP. Hồ Chí Minh</b></li>
        <li className="flex items-center gap-2">📍 Đến từ <b>Việt Nam</b></li>
      </ul>
      
      <button className="w-full bg-gray-100 dark:bg-zinc-700 dark:text-white py-2 rounded-md font-semibold">Chỉnh sửa chi tiết</button>
    </div>
  );
};
export default IntroSidebar;