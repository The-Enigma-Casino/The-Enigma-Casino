type ActionButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  color?: "purple" | "green" | "yellow" | "gray";
  className?: string;
};

export const ActionButton = ({
  onClick,
  disabled = false,
  label,
  color = "gray",
  className = "",
}: ActionButtonProps) => {
  const baseColors: Record<string, string> = {
    purple: "bg-purple-600 hover:bg-purple-700 text-white border-purple-700",
    green: "bg-green-500 hover:bg-green-600 text-white border-green-600",
    yellow: "bg-yellow-300 hover:bg-yellow-400 text-black border-yellow-600",
    gray: "bg-gray-600 hover:bg-gray-700 text-white border-gray-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-36 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-base sm:text-lg md:text-xl border transition-all duration-150 disabled:opacity-50 ${baseColors[color]} ${className}`}
    >
      {label}
    </button>

  );
};
