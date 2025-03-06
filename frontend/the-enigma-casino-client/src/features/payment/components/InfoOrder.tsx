import classes from "./infoOrder.module.css";

import CoinsCard from "../../catalog/components/CoinsCard";
import { OrderDto } from "../models/OrderDto.interface";
import { formatPriceWithCurrency } from "../../../utils/priceUtils";

interface InfoOrderProps {
  order: OrderDto;
}

const InfoOrder: React.FC<InfoOrderProps> = ({ order }) => {
  const date = `Fecha: ${order.paidDate.toLocaleDateString()}`;
  const paidWith = `Pagado con: ${order.payMode}`;
  const totalPaid = `Total pagado: ${formatPriceWithCurrency(
    order.coinsPack.price
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
          <p className={classes.coinsPrice}>+{order.coinsPack.price}</p>
          <img className={classes.coinsImg} src="/svg/coins.svg" alt="coins" />
        </div>
        <p className={classes.text}>{date}</p>
        <p className={classes.text}>{paidWith}</p>
        <p className={classes.text}>{totalPaid}</p>
      </div>
    </div>
  );
};

export default InfoOrder;
