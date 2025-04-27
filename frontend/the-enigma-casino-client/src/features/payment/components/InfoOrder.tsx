import classes from "./InfoOrder.module.css";

import CoinsCard from "../../catalog/components/CoinsCard";
import { OrderDto } from "../models/OrderDto.interface";
import { formatPriceWithCurrency } from "../../../utils/priceUtils";
import { PayMode } from "../models/PayMode.enum";

interface InfoOrderProps {
  order: OrderDto;
}

const InfoOrder: React.FC<InfoOrderProps> = ({ order }) => {
  const date = `Fecha: ${new Date(order.paidDate).toLocaleDateString()}`;

  const orderPaidmode = order.payMode;
  let paidWith = "Pagado con: ";

  let priceEthereum = 0;

  if (orderPaidmode === PayMode.Ethereum) {
    paidWith += "Ethereum";
    priceEthereum = order.ehtereum ?? 0;
  } else if (orderPaidmode === PayMode.CreditCard) {
    paidWith += "Tarjeta de Crédito";
  } else {
    paidWith += "Desconocido";
  }

  const totalPaid = `Total pagado: ${formatPriceWithCurrency(
    order.coinsPack.offer > 0 ? order.coinsPack.offer : order.coinsPack.price
  )}`;


  return (
    <div className={classes.infoOrderContainer}>
      <CoinsCard
        id={order.id}
        price={order.coinsPack.price}
        quantity={order.coinsPack.quantity}
        image={order.coinsPack.image}
        offer={order.coinsPack.offer}
        isSelected={false}
        onSelect={() => {}}
      />
      <div className={classes.infoOrderDetails}>
        <div className={classes.coinsInfo}>
          <p className={classes.coinsPrice}>+{order.coinsPack.quantity}</p>
          <img className={classes.coinsImg} src="/svg/coins.svg" alt="coins" />
        </div>
        <p className={classes.text}>{date}</p>
        <p className={classes.text}>{paidWith}</p>
        <p className={classes.text}>{totalPaid}</p>
        {priceEthereum !== 0 && (
          <p className={classes.text}>
            Pagado en Ethereum: {priceEthereum.toFixed(6)}{" "}
            <img
              src="/svg/ethereum.svg"
              alt="Ethereum"
              className={classes.ethereumIcon}
            />
          </p>
        )}
      </div>
    </div>
  );
};

export default InfoOrder;
