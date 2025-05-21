import { useEffect } from "react";
import { useUnit } from "effector-react";
import { $bigWins, loadBigWins } from "../../stores/wins.store";

function Winners() {
  const [winners, load] = useUnit([$bigWins, loadBigWins]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-[90%] max-w-[1000px] mx-auto bg-Background-nav rounded-md overflow-hidden py-2 px-4 font-reddit text-white">
      <div className="relative w-full h-[2.4rem] sm:h-[2.8rem]">
        <div className="absolute top-0 left-0 h-full flex items-center animate-marquee whitespace-nowrap gap-6">
          {[...winners, ...winners].map((player, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 text-sm sm:text-base"
            >
              <span className="text-white/80">{player.nickname}</span>
              <span className="text-Coins font-semibold flex items-center gap-1">
                🪙 {player.amountWon}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Winners;
