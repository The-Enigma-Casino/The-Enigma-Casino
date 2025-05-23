import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useUnit } from "effector-react";
import { useEffect } from "react";
import { $token } from "../../auth/store/authStore";

import { useNavigate } from "react-router-dom";
import { $selectedCard } from "../../catalog/store/catalogStore";
import { fetchLastOrderFx, fetchLastOrderIdFx } from "../actions/orderActions";
import {
  fetchClientSecretFx,
  fetchPaymentStatusFx,
} from "../actions/stripeActions";
import {
  $clientSecret,
  $paymentError,
  $paymentStatus,
} from "../store/PaymentStore";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function StripePayment() {
  const token = useUnit($token);
  const clientSecret = useUnit($clientSecret);
  const paymentStatus = useUnit($paymentStatus);
  const paymentError = useUnit($paymentError);
  const coinCard = useUnit($selectedCard);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!coinCard) {
      return;
    }

    fetchClientSecretFx(coinCard.id);
  }, [token, coinCard]);

  const handleOnComplete = async () => {
    const fetchedOrderId = await fetchLastOrderIdFx();

    if (fetchedOrderId) {
      await fetchPaymentStatusFx(fetchedOrderId);
    } else {
      return;
    }
  };

  useEffect(() => {
    if (paymentStatus === "paid") {
      fetchLastOrderFx();
      navigate("/payment-confirmation?pagado=true");
    } else if (paymentError) {
      navigate("/payment-confirmation?error=true");
    }
  }, [paymentStatus, paymentError, navigate]);

  return (
    <>
      {clientSecret && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            clientSecret,
            onComplete: handleOnComplete,
          }}
        >
          <div className="w-[90vw] sm:w-[32rem] md:w-[40rem] lg:w-[50rem] xl:w-[64rem] py-3 bg-Background-Overlay border-2 border-Green-lines rounded-2xl shadow-lg">
            <EmbeddedCheckout />
          </div>
        </EmbeddedCheckoutProvider>
      )}
    </>
  );
}

export default StripePayment;
