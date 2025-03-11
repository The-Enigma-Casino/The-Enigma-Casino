import { useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";
import {
  $clientSecret,
  $lastOrder,
  $paymentError,
  $paymentStatus,
} from "../store/PaymentStore";
import {
  fetchClientSecretFx,
  fetchPaymentStatusFx,
} from "../actions/stripeActions";
import { $selectedCard } from "../../catalog/store/catalogStore";
import { useNavigate } from "react-router-dom";
import { fetchLastOrderFx } from "../actions/orderActions";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function StripePayment() {
  const token = useUnit($token);
  const clientSecret = useUnit($clientSecret);
  const paymentStatus = useUnit($paymentStatus);
  const paymentError = useUnit($paymentError);
  const coinCard = useUnit($selectedCard);
  const orderId = useUnit($lastOrder);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.error("❌ No se encontró el token de autenticación.");
      return;
    }

    if (!coinCard) {
      console.error("❌ No se encontró ninguna tarjeta seleccionada.");
      return;
    }

    fetchClientSecretFx(coinCard.id);
  }, [token, coinCard]);

  const handleOnComplete = useCallback(async () => {
    await fetchLastOrderFx();
  
    if (orderId !== null) {
      await fetchPaymentStatusFx(orderId);
    }
  
    console.log(paymentStatus);

    if (paymentStatus === "paid") {
      navigate("/paymentConfirmation?pagado=true");
    } else if (paymentError) {
      navigate("/paymentConfirmation?error=true");
    }
  }, [orderId, paymentStatus, paymentError, navigate]);

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
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </>
  );
}

export default StripePayment;
