import { useLocation } from "react-router-dom";
import InfoOrder from "../components/InfoOrder";
import { $lastOrder } from "../store/PaymentStore";
import { useUnit } from "effector-react";
import { useEffect } from "react";
import { loadCoins } from "../../coins/store/coinsStore";

function PaymentConfirmation() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const isPaid = queryParams.get("pagado") === "true";
  const hasError = queryParams.get("error") === "true";
  const order = useUnit($lastOrder);

  useEffect(() => {
    if (isPaid) {
      loadCoins();
    }
  }, [isPaid]);

  return (
    <>
      <section className="min-h-full bg-Background-Page flex flex-col gap-[4rem] lg:gap-[9rem]">
        {isPaid && order && (
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
