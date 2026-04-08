interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button = ({ children, variant = 'primary', onClick, className = '' }: ButtonProps) => {
  // Định nghĩa các kiểu màu sắc khác nhau
  const baseStyles = "px-4 py-2 rounded-xl font-bold transition-all active:scale-95 text-sm";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;