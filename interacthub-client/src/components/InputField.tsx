interface InputProps {
  placeholder: string;
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
}

const InputField = ({ placeholder, value, onChange, className = '' }: InputProps) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`bg-slate-100 w-full rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-transparent focus:bg-white transition-all ${className}`}
    />
  );
};

export default InputField;