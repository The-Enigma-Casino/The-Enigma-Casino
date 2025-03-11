import { useUnit } from "effector-react";
import EthereumPayment from "../components/EthereumPayment";
import StripePayment from "../components/StripePayment";
import CoinsCards from "./../../catalog/components/CoinsCard";
import {
  $paymentMethod,
  $selectedCard,
} from "../../catalog/store/catalogStore";

function PaymentPage() {
  const method = useUnit($paymentMethod);
  const coinCard = useUnit($selectedCard);
  console.log("Método de pago seleccionado:", method);

  return (
    <>
      <div className="h-full bg-Background-Page flex justify-center">
        <div className="grid grid-cols-2 gap-30 w-full justify-center">
          <div className="col-start-1 row-start-1 place-self-center ml-[-5rem]">
            <CoinsCards
              key={coinCard.id}
              id={coinCard.id}
              price={coinCard.price}
              quantity={coinCard.quantity}
              image={coinCard.image}
              offer={coinCard.offer}
              isSelected={false}
              onSelect={() => {}}
              size="large"
              clickable={false}
            />
          </div>

          <div className="col-start-2 row-start-1 flex place-self-center justify-center">
            {method === "Stripe" && <StripePayment />}
            {method === "Ethereum" && <EthereumPayment />}
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentPage;
