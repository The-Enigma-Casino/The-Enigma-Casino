import InfoOrder from "../components/InfoOrder";
import { OrderDto } from "../models/OrderDto.interface";
import { PayMode } from "../models/PayMode.enum";

function PaymentConfirmation() {

  const order: OrderDto = {
    id: 1,
    coinsPack: {
      id: 1,
      price: 1000,
      quantity: 100,
      image: "/img/pack1.webp",
      offer: 100,
    },
    isPaid: true,
    paidDate: new Date("2024-03-06T12:00:00Z"),
    coins: 110,
    payMode: PayMode.Euro,
  };

  return (
    <>
      <section className="min-h-screen bg-Background-Page flex flex-col gap-[9rem]">
      <h1 className="text-Coins text-[6rem] font-bold text-center font-reddit pt-8">
          PAGO REALIZADO
        </h1>
        <InfoOrder order={order} />
        <h1 className="text-Principal text-[6rem] font-bold text-center font-reddit">
          ¡GRACIAS POR TU COMPRA!
        </h1>
      </section>
    </>
  );
}

export default PaymentConfirmation;
