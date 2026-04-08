import Avatar from './Avatar';

const UserMenu = ({ name }: { name: string }) => {
  return (
    <div className="flex items-center space-x-2 bg-slate-100 p-1 pr-3 rounded-full hover:bg-slate-200 cursor-pointer transition-all">
      <Avatar size="sm" />
      <span className="text-sm font-bold text-slate-700 hidden sm:inline">{name}</span>
    </div>
  );
};

export default UserMenu;