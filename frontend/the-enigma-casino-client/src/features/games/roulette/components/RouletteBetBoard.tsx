import styles from "./rouletteBetBoard.module.css";

interface RouletteBetBoardProps {
  disabled?: boolean;
  onBet: (bet: number | string) => void;
  bets: { key: string; label: string; amount: number }[];
}

export const RouletteBetBoard = ({
  disabled = false,
  onBet,
  bets,
}: RouletteBetBoardProps) => {
  const getBetAmount = (key: string) =>
    bets.find((b) => b.key === key)?.amount ?? 0;

  const renderCell = (
    n: number,
    color: "red" | "black" | "green" = "green"
  ) => {
    const betKey = `number_${n}`;
    const hasBet = getBetAmount(betKey) > 0;

    return (
      <td
        key={n}
        onClick={() => !disabled && onBet(n)}
        className={`${styles.num} ${styles[color]} ${hasBet ? styles.active : ""}`}
        style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
      >
        <span>{n}</span>
        {hasBet && (
          <div className={styles.ficha}>
            {getBetAmount(betKey)}
          </div>
        )}
      </td>
    );
  };

  const renderSector = (label: string, id: string) => {
    const hasBet = getBetAmount(id) > 0;

    return (
      <td
        key={id}
        className={`${styles.sector} ${hasBet ? styles.active : ""}`}
        onClick={() => !disabled && onBet(id)}
        style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
      >
        <span className={styles.vt}>{label}</span>
        {hasBet && (
          <div className={styles.ficha}>
            {getBetAmount(id)}
          </div>
        )}
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
              style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
            >
              <span>0</span>
              {getBetAmount("number_0") > 0 && (
                <div className={styles.ficha}>
                  {getBetAmount("number_0")}
                </div>
              )}
            </td>
            {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((n, i) =>
              renderCell(n, i % 2 === 0 ? "red" : "black")
            )}
            {renderSector("2 to 1", "sector_1")}
          </tr>

          <tr className={styles.nums}>
            <td className={styles.hidden}></td>
            {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((n, i) =>
              renderCell(n, i % 2 === 0 ? "black" : "red")
            )}
            {renderSector("2 to 1", "sector_2")}
          </tr>

          <tr className={styles.nums}>
            <td className={styles.hidden}></td>
            {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((n, i) =>
              renderCell(n, i % 2 === 0 ? "red" : "black")
            )}
            {renderSector("2 to 1", "sector_3")}
          </tr>

          <tr>
            <td className={styles.empty}></td>
            {["1st 12", "2nd 12", "3rd 12"].map((label, i) =>
              <td
                key={label}
                colSpan={4}
                className={styles.sector}
                onClick={() => !disabled && onBet(`sector_${4 + i}`)}
                style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
              >
                {label}
                {getBetAmount(`sector_${4 + i}`) > 0 && (
                  <div className={styles.ficha}>
                    {getBetAmount(`sector_${4 + i}`)}
                  </div>
                )}
              </td>
            )}
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
            ].map(({ label, id, extra }) => (
              <td
                key={id}
                colSpan={2}
                className={`${styles.sector} ${extra || ""}`}
                onClick={() => !disabled && onBet(id)}
                style={{ cursor: disabled ? "not-allowed" : "pointer", position: "relative" }}
              >
                {label}
                {getBetAmount(id) > 0 && (
                  <div className={styles.ficha}>
                    {getBetAmount(id)}
                  </div>
                )}
              </td>
            ))}
            <td className={styles.empty}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
