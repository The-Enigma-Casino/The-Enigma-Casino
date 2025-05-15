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
    <div className="w-[90%] mx-auto bg-Background-nav py-2 px-4 rounded-md overflow-hidden font-reddit text-white">
      <div className={`inline-block whitespace-nowrap ${styles.marquee}`}>
        {[...winners, ...winners].map((player, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 mx-3 text-sm sm:text-base"
          >
            <span className="text-white/80">{player.nickname}</span>
            <span className="text-Coins font-semibold flex items-center gap-1">
              🪙 {player.amountWon}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default Winners;
