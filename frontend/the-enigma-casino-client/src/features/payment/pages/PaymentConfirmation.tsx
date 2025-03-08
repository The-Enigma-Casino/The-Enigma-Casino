import { useLocation } from "react-router-dom";
import InfoOrder from "../components/InfoOrder";
import { OrderDto } from "../models/OrderDto.interface";
import { PayMode } from "../models/PayMode.enum";

function PaymentConfirmation() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const isPaid = queryParams.get("pagado") === "true";
  const hasError = queryParams.get("error") === "true";

  const order: OrderDto = {
    id: 1,
    coinsPack: {
      id: 1,
      price: 1000,
      quantity: 100,
      image: "images/coins/pack1.webp",
      offer: 100,
    },
    isPaid: isPaid,
    paidDate: new Date("2024-03-06T12:00:00Z"),
    coins: 110,
    payMode: PayMode.Euro,
  };

  return (
    <>
      <section className="min-h-full bg-Background-Page flex flex-col gap-[4rem] lg:gap-[9rem]">
        {isPaid && (
          <>
            <h1 className="text-Coins text-[4rem] font-bold text-center font-reddit pt-8 lg:text-[6rem]">
              PAGO REALIZADO
            </h1>
            <InfoOrder order={order} />
            <h1 className="text-Principal text-[3rem] font-bold text-center font-reddit lg:text-[6rem]">
              ¡GRACIAS POR TU COMPRA!
            </h1>
          </>
        )}

        {hasError && (
          <div className="text-center text-red-500 text-[3rem] font-bold font-reddit pt-8 lg:text-[5rem]">
            ❌ ERROR EN EL PAGO ❌
            <p className="text-[2rem] text-white mt-4">
              Hubo un problema con tu pago. Inténtalo de nuevo.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

export default PaymentConfirmation;
