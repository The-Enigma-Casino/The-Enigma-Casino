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
    <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center justify-center bg-Background-Page">
      <CoinsCard
        id={order.id}
        price={order.coinsPack.price}
        quantity={order.coinsPack.quantity}
        image={order.coinsPack.image}
        offer={order.coinsPack.offer}
        isSelected={false}
        onSelect={() => {}}
      />
      <div className="flex flex-col gap-6 md:gap-8 font-reddit text-white text-[1.2rem] md:text-[1.2rem] items-center md:items-start text-center md:text-left">
        <div className="flex items-center gap-3 md:gap-4 text-[2rem]">
          <p className="text-Coins font-bold">+{order.coinsPack.quantity}</p>
          <img src="/svg/coins.svg" alt="coins" className="w-8 h-8 object-contain" />
        </div>
        <p className="text-2xl">{date}</p>
        <p className="text-2xl">{paidWith}</p>
        <p className="text-2xl">{totalPaid}</p>
        {priceEthereum !== 0 && (
          <p className="text-2xl flex items-center justify-center md:justify-start">
            Pagado en Ethereum: {priceEthereum.toFixed(6)}
            <img
              src="/svg/ethereum.svg"
              alt="Ethereum"
              className="w-10 h-10 ml-2 object-contain"
            />
          </p>
        )}
      </div>
    </div>
  );
};

export default InfoOrder;
