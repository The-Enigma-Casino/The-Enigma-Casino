interface CountdownBarProps {
  countdown: number;
  total?: number;
}

export const CountdownBar = ({ countdown, total = 30 }: CountdownBarProps) => {
  const percentage = Math.min(((total - countdown) / total) * 100, 100);

  const getBarColor = () => {
    if (countdown <= 5) return "bg-Color-Cancel";
    if (countdown <= 10) return "bg-orange-400";
    return "bg-Coins";
  };

  return (
    <div className="flex flex-col items-center mb-6 w-full max-w-md">
      <p className="text-white text-lg font-bold mb-1">
        Tiempo restante: <span className="text-yellow-300">{countdown}s</span>
      </p>
      <div className="w-full h-6 rounded-full overflow-hidden bg-black/30">
        <div
          className={`${getBarColor()} h-full transition-all duration-1000`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};
