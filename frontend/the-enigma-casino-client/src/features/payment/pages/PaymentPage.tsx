import { useUnit } from "effector-react";
import EthereumPayment from "../components/EthereumPayment";
import StripePayment from "../components/StripePayment";
import { $paymentMethod } from "../store/PaymentStore";

function PaymentPage() {
  const method = useUnit($paymentMethod);

  return (
    <>
      <div>
        <div>Aqui va la tarjeta</div>
        <div>
          {method === "stripe" && <StripePayment />}
          {method === "ethereum" && <EthereumPayment />}
        </div>
      </div>
    </>
  );
}

export default PaymentPage;
