type ActionButtonProps = {
  onClick: () => void;
  color: "green" | "yellow" | "purple" | "gray";
  label: string;
};

export const ActionButton = ({ onClick, color, label }: ActionButtonProps) => {
  const baseColors: Record<string, string> = {
    green: "bg-green-400 hover:bg-green-500 text-black border-green-600",
    yellow: "bg-yellow-300 hover:bg-yellow-400 text-black border-yellow-600",
    purple: "bg-purple-500 hover:bg-purple-600 text-white border-purple-700",
    gray: "bg-gray-600 hover:bg-gray-700 text-white border-gray-700",
  };

  const colorClass = baseColors[color] || baseColors.gray;

  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2
        rounded-lg font-semibold text-base
        shadow-md border transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        ${colorClass}
      `}
    >
      {label}
    </button>
  );
};
