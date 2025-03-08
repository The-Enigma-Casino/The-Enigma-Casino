import { useUnit } from "effector-react";
import EthereumPayment from "../components/EthereumPayment";
import StripePayment from "../components/StripePayment";
import CoinsCards from "../components/CoinsCard";
import { $paymentMethod } from "../store/PaymentStore";

function PaymentPage() {
  const method = useUnit($paymentMethod);

  return (
    <>
      <div className="h-full bg-Background-Page flex justify-center">
        <div className="grid grid-cols-2 gap-30 w-full justify-center">
          <div className="col-start-1 row-start-1 place-self-center  ml-[-5rem]">
            <CoinsCards
              id={1}
              price={1}
              quantity={1}
              image="url"
              offer={0}
              size="large"
            />
          </div>

          <div className="col-start-2 row-start-1 flex place-self-center justify-self-end">
            {method === "stripe" && <StripePayment />}
            {method === "ethereum" && <EthereumPayment />}
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentPage;
