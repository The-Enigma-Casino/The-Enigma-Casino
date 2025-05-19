import { useRef } from "react";
import styles from "./RouletteBetBoard.module.css";

interface RouletteBetBoardProps {
  disabled?: boolean;
  onBet: (bet: number | string) => void;
  onRemove: (bet: number | string) => void;
  bets: { key: string; label: string; amount: number }[];
}

const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18,
  19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export const RouletteBetBoard = ({
  disabled = false,
  onBet,
  onRemove,
  bets,
}: RouletteBetBoardProps) => {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const getBetAmount = (key: string) =>
    bets.find((b) => b.key === key)?.amount ?? 0;

  const getNumberColor = (n: number): "red" | "black" | "green" => {
    if (n === 0) return "green";
    return redNumbers.has(n) ? "red" : "black";
  };

  const handleRightClick = (e: React.MouseEvent, bet: number | string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) onRemove(bet);
  };

  const handleTouchStart = (bet: number | string) => {
    longPressTimer.current = setTimeout(() => {
      if (!disabled) onRemove(bet);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const renderCell = (n: number) => {
    const betKey = `number_${n}`;
    const hasBet = getBetAmount(betKey) > 0;
    const color = getNumberColor(n);

    return (
      <td
        key={n}
        onClick={() => !disabled && onBet(n)}
        onContextMenu={hasBet ? (e) => handleRightClick(e, n) : undefined}
        onTouchStart={hasBet ? () => handleTouchStart(n) : undefined}
        onTouchEnd={hasBet ? handleTouchEnd : undefined}
        className={`${styles.num} ${styles[color]} ${hasBet ? styles.active : ""}`}
        style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
      >
        <span>{n}</span>
        {hasBet && <div className={styles.ficha}>{getBetAmount(betKey)}</div>}
      </td>
    );
  };

  const renderSideBet = (id: string) => {
    const hasBet = getBetAmount(id) > 0;
    return (
      <td
        className={`${styles.sector} ${hasBet ? styles.active : ""}`}
        onClick={() => !disabled && onBet(id)}
        onContextMenu={hasBet ? (e) => handleRightClick(e, id) : undefined}
        onTouchStart={hasBet ? () => handleTouchStart(id) : undefined}
        onTouchEnd={hasBet ? handleTouchEnd : undefined}
        style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
      >
        <span className={styles.vt}>2 to 1</span>
        {hasBet && <div className={styles.ficha}>{getBetAmount(id)}</div>}
      </td>
    );
  };

  return (
    <div className={`${styles.roulette} ${disabled ? styles.disabled : ""}`}>
      <table>
        <tbody>
          <tr className={styles.nums}>
            <td
              className={`${styles.num} ${styles.green} ${styles.zero}`}
              rowSpan={3}
              onClick={() => !disabled && onBet(0)}
              onContextMenu={getBetAmount("number_0") > 0 ? (e) => handleRightClick(e, 0) : undefined}
              onTouchStart={getBetAmount("number_0") > 0 ? () => handleTouchStart(0) : undefined}
              onTouchEnd={getBetAmount("number_0") > 0 ? handleTouchEnd : undefined}
              style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
            >
              <span>0</span>
              {getBetAmount("number_0") > 0 && (
                <div className={styles.ficha}>{getBetAmount("number_0")}</div>
              )}
            </td>
            {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map(renderCell)}
            {renderSideBet("sector_1")}
          </tr>

          <tr className={styles.nums}>
            <td className={styles.hidden}></td>
            {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map(renderCell)}
            {renderSideBet("sector_2")}
          </tr>

          <tr className={styles.nums}>
            <td className={styles.hidden}></td>
            {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map(renderCell)}
            {renderSideBet("sector_3")}
          </tr>

          <tr>
            <td className={styles.empty}></td>
            {["1st 12", "2nd 12", "3rd 12"].map((label, i) => {
              const id = `sector_${4 + i}`;
              const hasBet = getBetAmount(id) > 0;
              return (
                <td
                  key={label}
                  colSpan={4}
                  className={`${styles.sector} ${hasBet ? styles.active : ""}`}
                  onClick={() => !disabled && onBet(id)}
                  onContextMenu={hasBet ? (e) => handleRightClick(e, id) : undefined}
                  onTouchStart={hasBet ? () => handleTouchStart(id) : undefined}
                  onTouchEnd={hasBet ? handleTouchEnd : undefined}
                  style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
                >
                  {label}
                  {hasBet && <div className={styles.ficha}>{getBetAmount(id)}</div>}
                </td>
              );
            })}
            <td className={styles.empty}></td>
          </tr>

          <tr>
            <td className={styles.empty}></td>
            {[
              { label: "1 to 18", id: "sector_7" },
              { label: "EVEN", id: "sector_8" },
              { label: "RED", id: "sector_9", extra: styles.red },
              { label: "BLACK", id: "sector_10", extra: styles.black },
              { label: "ODD", id: "sector_11" },
              { label: "19 to 36", id: "sector_12" },
            ].map(({ label, id, extra }) => {
              const hasBet = getBetAmount(id) > 0;
              return (
                <td
                  key={id}
                  colSpan={2}
                  className={`${styles.sector} ${extra || ""} ${hasBet ? styles.active : ""}`}
                  onClick={() => !disabled && onBet(id)}
                  onContextMenu={hasBet ? (e) => handleRightClick(e, id) : undefined}
                  onTouchStart={hasBet ? () => handleTouchStart(id) : undefined}
                  onTouchEnd={hasBet ? handleTouchEnd : undefined}
                  style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
                >
                  {label}
                  {hasBet && <div className={styles.ficha}>{getBetAmount(id)}</div>}
                </td>
              );
            })}
            <td className={styles.empty}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
