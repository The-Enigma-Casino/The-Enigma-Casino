import { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";

import {
  fetchClientSecretFx,
  fetchPaymentStatusFx,
} from "../actions/stripeActions";
import { $selectedCard } from "../../catalog/store/catalogStore";
import { useNavigate } from "react-router-dom";
import { fetchLastOrderFx, fetchLastOrderIdFx } from "../actions/orderActions";
import {
  $clientSecret,
  $paymentError,
  $paymentStatus,
} from "../store/PaymentStore";

import styles from "./StripePayment.module.css";

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
          <EmbeddedCheckout className={styles["App-Container"]} />
        </EmbeddedCheckoutProvider>
      )}
    </>
  );
}

export default StripePayment;
