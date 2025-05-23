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

  return (
    <>
      <div className="h-full bg-Background-Page flex justify-center px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-screen-xl place-items-center">
          <div className="w-full max-w-[50rem] flex justify-center">
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

          <div className="w-full max-w-[50rem] flex justify-center">
            {method === "Stripe" && <StripePayment />}
            {method === "Ethereum" && <EthereumPayment />}
          </div>
        </div>
      </div>
      );
    </>
  );
}

export default PaymentPage;
