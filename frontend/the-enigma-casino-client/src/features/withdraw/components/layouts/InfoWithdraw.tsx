import classes from "./infoWithdraw.module.css";

import { formatPriceWithCurrency } from "../../../../utils/priceUtils";

function InfoWithdraw() {
  const date1: Date = new Date();
  const eur: number = 123.27;
  const euth: number = 0.04767568006590946;
  const coins: number = 10000;

  const date = `Fecha: ${date1.toLocaleDateString()}`;
  const paidWith = `Pagado con: Ethereum`;
  const totalPaid = `Total pagado: ${formatPriceWithCurrency(eur)}`;

  return (
    <div className={classes.WithdrawConfirmation}>
      <div className={classes.info}>
        <div className={classes.textContainer}>
          <p className={classes.text}>{date}</p>
          <p className={classes.text}>{paidWith}</p>
          <div>
            <p className={classes.text}>{totalPaid}</p>
            <div className={classes.euth}>
              <p className={classes.text}>{euth} </p>
              <img src="/img/ethereum.webp" alt="ethereum" />
            </div>
          </div>
        </div>

        <div className={classes.coinsContainer}>
          <div className={classes.coinsInfo}>
            <p className={classes.coinsPrice}>{coins}</p>
            <img
              className={classes.coinsImg}
              src="/svg/coins.svg"
              alt="coins"
            />
          </div>
          <img src="/svg/arrow-coins.svg" alt="arrow" />
          <div className={classes.coinsInfo}>
            <p className={classes.coinsPrice}>0</p>
            <img
              className={classes.coinsImg}
              src="/svg/coins.svg"
              alt="coins"
            />
          </div>
        </div>
      </div>
    </div>
  );

}

export default InfoWithdraw;
