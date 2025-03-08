import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";
import { $orderId, $clientSecret, $error, confirmOrder, createPaymentSessionFx, getSessionStripeFx, setClientSecret, setError } from "../store/PaymentStore";
// import { CREATE_PAYMENT_SESSION, CONFIRM_ORDER, PAYMENT_STATUS } from "../../config";
import { deleteLocalStorage } from "../../../utils/storageUtils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function StripePayment() {
  const token = useUnit($token);
  const orderId = useUnit($orderId);
  const clientSecret = useUnit($clientSecret);
  const error = useUnit($error);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!token) {
  //     setError("No se encontró el token de autenticación.");
  //     return;
  //   }
  //   createPaymentSessionFx({ url: CREATE_PAYMENT_SESSION, token, orderId })
  //     .then((data) => setClientSecret(data.clientSecret))
  //     .catch((err) => setError(`Error: ${err.message}`));
  // }, [token, orderId]);

  useEffect(() => {
    return () => {
      deleteLocalStorage("order");
    };
  }, []);

  const handleComplete = async () => {
    try {
      const status = await getSessionStripeFx({ url: PAYMENT_STATUS, orderId, token });
      if (status.paymentStatus === "paid") {
        const confirmedOrderId = await confirmOrder({ url: CONFIRM_ORDER, orderId, token });
        navigate("/paymentConfirmation", { state: { status: "success", orderId: confirmedOrderId } });
      } else {
        navigate("/paymentConfirmation", { state: { status: "failure" } });
      }
    } catch (err) {
      navigate("/paymentConfirmation", { state: { status: "failure" } });
    }
  };

  return (
    <>
      {error && <p>{error}</p>}
      {clientSecret && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret, onComplete: handleComplete }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </>
  );
}

export default StripePayment;
