interface AvatarProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar = ({ src, size = 'md', className = '' }: AvatarProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-slate-200 border border-slate-100 flex-shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
          User
        </div>
      )}
    </div>
  );
};

export default Avatar;