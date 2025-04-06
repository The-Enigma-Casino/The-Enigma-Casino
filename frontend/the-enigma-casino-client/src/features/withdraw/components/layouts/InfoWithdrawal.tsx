import React, { useEffect, useRef } from "react";
import classes from "./infoWithdrawal.module.css";
import { useUnit } from "effector-react";
import { fetchLastOrderWithdrawalFx } from "../../actions/withdrawalActions";
import { $lastOrderWithdrawal } from "../../store/WithdrawalStore";
import { formatPriceWithCurrency } from "../../../../utils/priceUtils";
import { $token } from "../../../auth/store/authStore";
function InfoWithdrawal() {
  const token = useUnit($token);
  const lastOrder = useUnit($lastOrderWithdrawal);

  useEffect(() => {
    if (!lastOrder) {
      fetchLastOrderWithdrawalFx({ token });
    }
  }, [lastOrder]);

  if (!lastOrder) {
    return (
      <div className={classes.loadingMessage}>
        <p>Cargando datos...</p>
      </div>
    );
  }

  const date = lastOrder.paidDate ? `Fecha: ${new Date(lastOrder.paidDate).toLocaleDateString()}` : "Fecha no disponible";
  const paidWith = `Pagado con: ${lastOrder.payMode === 0 ? "Ethereum" : "Otro"}`;
  const totalPaid = `Equivalencia a Euros: ${formatPriceWithCurrency(lastOrder.price)}`;
  const euth = `Ethereum ingresados: ${lastOrder.ethereumPrice.toFixed(6) || 0}`;
  const coins = `Fichas retiradas: ${lastOrder.coins || 0}`;
  const hash = `Hash: ${lastOrder.ethereumTransactionHash || 0}`;



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
            <p className={classes.text}>{hash}</p>
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
        </div>
      </div>
    </div>
  );

}

export default InfoWithdrawal;
