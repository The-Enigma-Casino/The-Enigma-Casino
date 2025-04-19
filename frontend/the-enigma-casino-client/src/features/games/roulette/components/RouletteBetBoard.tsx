import styles from "./rouletteBetBoard.module.css";

export const RouletteBetBoard = () => {
  return (
    <div className={styles.roulette}>
      <table>
        <tbody>
          <tr className={styles.nums}>
            <td className={`${styles.num} ${styles.green} ${styles.zero}`} rowSpan={3}>
              <span>0</span>
            </td>
            {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((n, i) => (
              <td
                key={n}
                className={`${styles.num} ${i % 2 === 0 ? styles.red : styles.black}`}
              >
                <span>{n}</span>
              </td>
            ))}
            <td className={styles.sector} data-sector="1">
              <span className={styles.vt}>2 to 1</span>
            </td>
          </tr>

          <tr className={styles.nums}>
            <td className={styles.hidden}></td>
            {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((n, i) => (
              <td
                key={n}
                className={`${styles.num} ${i % 2 === 0 ? styles.black : styles.red}`}
              >
                <span>{n}</span>
              </td>
            ))}
            <td className={styles.sector} data-sector="2">
              <span className={styles.vt}>2 to 1</span>
            </td>
          </tr>

          <tr className={styles.nums}>
            <td className={styles.hidden}></td>
            {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((n, i) => (
              <td
                key={n}
                className={`${styles.num} ${i % 2 === 0 ? styles.red : styles.black}`}
              >
                <span>{n}</span>
              </td>
            ))}
            <td className={styles.sector} data-sector="3">
              <span className={styles.vt}>2 to 1</span>
            </td>
          </tr>

          <tr>
            <td className={styles.empty}></td>
            <td colSpan={4} className={styles.sector} data-sector="4">
              1st 12
            </td>
            <td colSpan={4} className={styles.sector} data-sector="5">
              2nd 12
            </td>
            <td colSpan={4} className={styles.sector} data-sector="6">
              3rd 12
            </td>
            <td className={styles.empty}></td>
          </tr>

          <tr>
            <td className={styles.empty}></td>
            <td colSpan={2} className={styles.sector} data-sector="7">
              1 to 18
            </td>
            <td colSpan={2} className={styles.sector} data-sector="8">
              EVEN
            </td>
            <td colSpan={2} className={`${styles.sector} ${styles.red}`} data-sector="9">
              RED
            </td>
            <td colSpan={2} className={`${styles.sector} ${styles.black}`} data-sector="10">
              BLACK
            </td>
            <td colSpan={2} className={styles.sector} data-sector="11">
              ODD
            </td>
            <td colSpan={2} className={styles.sector} data-sector="12">
              19 to 36
            </td>
            <td className={styles.empty}></td>
          </tr>
        </tbody>
      </table>

      <div className={styles.controlls}>
        <div className={`${styles.btn} ${styles["btn-zero"]}`} data-num="0"></div>
      </div>
    </div>
  );
};
