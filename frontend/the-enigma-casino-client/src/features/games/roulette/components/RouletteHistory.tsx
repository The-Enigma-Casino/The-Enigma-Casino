interface RouletteHistoryProps {
  results: { number: number; color: string }[];
}

export const RouletteHistory = ({ results }: RouletteHistoryProps) => {
  const getColorClass = (color: string) => {
    const base = "text-white border-2 border-Coins";
    if (color === "red") return `bg-Roulette-red ${base}`;
    if (color === "black") return `bg-Roulette-black ${base}`;
    if (color === "green") return `bg-Roulette-green ${base}`;
    return `bg-gray-400 ${base}`;
  };

  return (
    <div className="flex gap-2 mt-6 flex-wrap justify-center">
      {results.map((r, idx) => (
        <div
          key={idx}
          className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold ${getColorClass(r.color)}`}
        >
          {r.number}
        </div>
      ))}
    </div>
  );
};
