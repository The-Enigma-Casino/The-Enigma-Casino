import { useEffect } from "react";
import { useUnit } from "effector-react";
import { $bigWins, loadBigWins } from "../../stores/wins.store";

function Winners() {
  const [winners, load] = useUnit([$bigWins, loadBigWins]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full max-w-screen-xl mx-auto bg-Background-nav rounded-xl overflow-hidden py-2 px-4 font-reddit text-white">

      <div className="relative w-full h-[2.4rem] sm:h-[2.8rem] group">
        <div className="absolute top-0 left-0 h-full flex items-center animate-marquee whitespace-nowrap gap-10 group-hover:[animation-play-state:paused] group-hover:pointer-events-none">
          {[...winners, ...winners].map((player, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 text-lg sm:text-2xl"
            >
              <span className="text-white/80">{player.nickname}</span>
              <span className="text-Coins font-semibold flex items-center gap-1">
                <img src="/svg/coins.svg" alt="Coin" className="w-5 h-5" />
                {player.amountWon}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Winners;
