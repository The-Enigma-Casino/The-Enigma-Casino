import styles from "./rouletteBetBoard.module.css";

interface RouletteBetBoardProps {
  disabled?: boolean;
}

export const RouletteBetBoard = ({ disabled = false }: RouletteBetBoardProps) => {

  const handleBetClick = (bet: string | number) => {
    if (disabled) return;

    if (typeof bet === "number") {
      console.log(`🎯 Apuesta directa al número: ${bet}`);
    } else if (bet.startsWith("dozen")) {
      console.log(`📦 Apuesta a docena: ${bet}`);
    } else if (bet.startsWith("column")) {
      console.log(`🏛 Apuesta a columna: ${bet}`);
    } else if (bet === "red" || bet === "black") {
      console.log(`🔴⚫ Apuesta a color: ${bet}`);
    } else if (bet === "even" || bet === "odd") {
      console.log(`♻️ Apuesta a par/impar: ${bet}`);
    } else if (bet === "1_18" || bet === "19_36") {
      console.log(`📉📈 Apuesta a rango: ${bet}`);
    } else {
      console.log(`❓ Apuesta desconocida: ${bet}`);
    }

    // Aquí meteremos playerPlaceBet({ betType, amount, ... })
  };

  return (
    <div className={`${styles.roulette} ${disabled ? styles.disabled : ""}`}>
      <table>
        <tbody>
          <tr className={styles.nums}>
            <td
              className={`${styles.num} ${styles.green} ${styles.zero}`}
              rowSpan={3}
              onClick={() => handleBetClick(0)}
            >
              <span>0</span>
            </td>
            {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((n, i) => (
              <td
                key={n}
                onClick={() => handleBetClick(n)}
                className={`${styles.num} ${i % 2 === 0 ? styles.red : styles.black}`}
              >
                <span>{n}</span>
              </td>
            ))}
            <td className={styles.sector} onClick={() => handleBetClick("column_1")}>
              <span className={styles.vt}>2 to 1</span>
            </td>
          </tr>

          <tr className={styles.nums}>
            <td className={styles.hidden}></td>
            {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((n, i) => (
              <td
                key={n}
                onClick={() => handleBetClick(n)}
                className={`${styles.num} ${i % 2 === 0 ? styles.black : styles.red}`}
              >
                <span>{n}</span>
              </td>
            ))}
            <td className={styles.sector} onClick={() => handleBetClick("column_2")}>
              <span className={styles.vt}>2 to 1</span>
            </td>
          </tr>

          <tr className={styles.nums}>
            <td className={styles.hidden}></td>
            {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((n, i) => (
              <td
                key={n}
                onClick={() => handleBetClick(n)}
                className={`${styles.num} ${i % 2 === 0 ? styles.red : styles.black}`}
              >
                <span>{n}</span>
              </td>
            ))}
            <td className={styles.sector} onClick={() => handleBetClick("column_3")}>
              <span className={styles.vt}>2 to 1</span>
            </td>
          </tr>

          {/* Docenas */}
          <tr>
            <td className={styles.empty}></td>
            <td colSpan={4} className={styles.sector} onClick={() => handleBetClick("dozen_1")}>1st 12</td>
            <td colSpan={4} className={styles.sector} onClick={() => handleBetClick("dozen_2")}>2nd 12</td>
            <td colSpan={4} className={styles.sector} onClick={() => handleBetClick("dozen_3")}>3rd 12</td>
            <td className={styles.empty}></td>
          </tr>

          {/* Apuestas simples */}
          <tr>
            <td className={styles.empty}></td>
            <td colSpan={2} className={styles.sector} onClick={() => handleBetClick("1_18")}>1 to 18</td>
            <td colSpan={2} className={styles.sector} onClick={() => handleBetClick("even")}>EVEN</td>
            <td colSpan={2} className={`${styles.sector} ${styles.red}`} onClick={() => handleBetClick("red")}>RED</td>
            <td colSpan={2} className={`${styles.sector} ${styles.black}`} onClick={() => handleBetClick("black")}>BLACK</td>
            <td colSpan={2} className={styles.sector} onClick={() => handleBetClick("odd")}>ODD</td>
            <td colSpan={2} className={styles.sector} onClick={() => handleBetClick("19_36")}>19 to 36</td>
            <td className={styles.empty}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
