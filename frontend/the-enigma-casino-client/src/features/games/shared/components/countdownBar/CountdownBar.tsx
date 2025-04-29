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
    <div className="w-full max-w-md h-6 rounded-full overflow-hidden bg-Background-Overlay mb-6">
      <div
        className={`${getBarColor()} h-full`}
        style={{
          width: `${percentage}%`,
          transition: "width 0.95s linear",
        }}
      />
    </div>
  );
};
