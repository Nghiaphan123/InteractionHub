const CoverSection = () => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Ảnh bìa */}
      <div className="relative h-[250px] md:h-[350px] w-full bg-gray-300 dark:bg-zinc-800 rounded-b-xl">
        <img src="https://picsum.photos/1000/400" className="w-full h-full object-cover rounded-b-xl" alt="cover" />
        <button className="absolute bottom-4 right-4 bg-white dark:bg-zinc-700 px-3 py-2 rounded-md font-semibold text-sm flex items-center gap-2 dark:text-white">
          📷 <span className="hidden md:inline">Chỉnh sửa ảnh bìa</span>
        </button>
      </div>

      {/* Thông tin Profile */}
      <div className="flex flex-col md:flex-row items-center md:items-end px-4 pb-4 -mt-12 md:-mt-8 gap-4">
        <div className="relative">
          <img 
            src="https://picsum.photos/200" 
            className="w-40 h-40 rounded-full border-4 border-white dark:border-[#242526] object-cover"
          />
          <button className="absolute bottom-2 right-2 bg-gray-200 dark:bg-zinc-600 p-2 rounded-full">📷</button>
        </div>

        <div className="flex-1 text-center md:text-left mb-2">
          <h1 className="text-3xl font-bold dark:text-white">Hoài An</h1>
          <p className="text-gray-500 dark:text-gray-400 font-semibold">1,2K bạn bè</p>
        </div>

        <div className="flex gap-2 mb-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold">+ Thêm vào tin</button>
          <button className="bg-gray-200 dark:bg-zinc-700 dark:text-white px-4 py-2 rounded-md font-semibold">✎ Chỉnh sửa</button>
        </div>
      </div>
    </div>
  );
};
export default CoverSection;