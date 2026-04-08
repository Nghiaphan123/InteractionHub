const Badge = ({ text, color = 'blue' }: { text: string, color?: string }) => {
  const colors: any = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    gold: "bg-yellow-100 text-yellow-700"
  };
  return (
    <span className={`${colors[color]} text-[10px] px-2 py-0.5 rounded-full font-bold uppercase`}>
      {text}
    </span>
  );
};

export default Badge;