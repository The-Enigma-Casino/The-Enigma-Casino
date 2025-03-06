import CoinsCard from "../../catalog/components/CoinsCard";
import { OrderDto } from "../models/OrderDto.interface";

interface InfoOrderProps {
  order: OrderDto;
}

const InfoOrder: React.FC<InfoOrderProps> = ({ order }) => {
  const date = `Fecha: ${order.paidDate.toLocaleDateString()}`;
  const paidWith = `Pagado con: ${order.payMode}`;
  const totalPaid = `Total pagado: ${order.coinsPack.price}`;

  return (
    <div>
      <CoinsCard
        id={order.id}
        price={order.coinsPack.price}
        quantity={order.coinsPack.quantity}
        image={order.coinsPack.image}
        offer={order.coinsPack.offer}
        isSelected={false}
        onSelect={() => {}}
      />
      <div>
        <div>
          <p>+{order.coinsPack.price}</p>
          <img src="/svg/coins.svg" alt="coins" />
        </div>
        <p>{date}</p>
        <p>{paidWith}</p>
        <p>{totalPaid}</p>
      </div>
    </div>
  );
};

export default InfoOrder;
