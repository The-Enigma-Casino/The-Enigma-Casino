import { useEffect } from "react";
import { useUnit } from "effector-react";
import { $bigWins, loadBigWins } from "../../stores/wins.store";
import styles from "./Winners.module.css";

function Winners() {
  const [winners, load] = useUnit([$bigWins, loadBigWins]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-[90%] mx-auto bg-Background-nav py-2 rounded-md overflow-hidden font-reddit">
      <div className={`inline-block whitespace-nowrap ${styles.marquee}`}>
        {[...winners, ...winners].map((player, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 mx-2 px-3 py-1 rounded-full bg-[#1a1a1a] text-white text-sm sm:text-base"
          >
            <span className="text-white/80">{player.nickname}</span>
            <span className="text-Coins font-semibold">
              🪙 {player.amountWon}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default Winners;
