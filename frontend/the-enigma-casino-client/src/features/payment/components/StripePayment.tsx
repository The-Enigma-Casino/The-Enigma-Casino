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

import styles from "./stripePayment.module.css";

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
      console.error("❌ No se encontró el token de autenticación.");
      return;
    }

    if (!coinCard) {
      console.error("❌ No se encontró ninguna tarjeta seleccionada.");
      return;
    }

    fetchClientSecretFx(coinCard.id);
  }, [token, coinCard]);

  const handleOnComplete = async () => {
    console.log("🔄 Fetching last order...");

    const fetchedOrderId = await fetchLastOrderIdFx();
    console.log("✅ Última orden después del fetch:", fetchedOrderId);

    if (fetchedOrderId) {
      await fetchPaymentStatusFx(fetchedOrderId);
    } else {
      console.error("❌ La orden sigue siendo null después del fetch.");
      return;
    }
  };

  useEffect(() => {
    if (paymentStatus === "paid") {
      console.log("✅ Pago confirmado, redirigiendo...");
      fetchLastOrderFx();
      navigate("/payment-confirmation?pagado=true");
    } else if (paymentError) {
      console.log("❌ Error en el pago, redirigiendo...");
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
