const TrendingTag = ({ name, posts }: { name: string, posts: string }) => {
  return (
    <div className="group cursor-pointer p-2 hover:bg-blue-50 rounded-xl transition-all">
      <p className="text-blue-600 font-bold text-sm group-hover:underline">#{name}</p>
      <p className="text-[10px] text-slate-400">{posts} bài viết</p>
    </div>
  );
};

export default TrendingTag;