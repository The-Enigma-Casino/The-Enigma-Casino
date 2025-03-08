import { useEffect, useState } from "react";
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
  
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isCheckoutReady, setIsCheckoutReady] = useState(false); // ✅ Control de renderización
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("No se encontró el token de autenticación.");
      return;
    }

    if (!coinCard) {
      console.log("No se encontró ninguna tarjeta seleccionada.");
      return;
    }

    console.log("Iniciando fetchClientSecretFx con cardId:", coinCard.id);
    fetchClientSecretFx(coinCard.id);
  }, [token, coinCard]);

  useEffect(() => {
    if (paymentStatus === "paid") {
      console.log("✅ Pago exitoso. Redirigiendo a la página de confirmación...");
      navigate("/paymentConfirmation?pagado=true");
    }

    if (paymentError) {
      console.log("❌ Error en el pago. Redirigiendo a la página de error...");
      navigate("/paymentConfirmation?error=true");
    }
  }, [paymentStatus, paymentError, navigate]);

  useEffect(() => {
    // ✅ Solo se actualiza `orderId` cuando cambia `$lastOrder`
    const newOrderId = $lastOrder.getState();
    if (newOrderId) {
      console.log("📦 Actualizando `orderId` en estado:", newOrderId);
      setOrderId(newOrderId);
      setIsCheckoutReady(true); // ✅ Solo activamos el renderizado cuando haya un `orderId`
    }
  }, [$lastOrder]);

  const handleOnComplete = async () => {
    console.log("✅ onComplete ha sido ejecutado, verificando orderId...");

    let finalOrderId = orderId;

    if (!finalOrderId) {
      console.log("🔄 orderId no disponible, esperando actualización...");
      await fetchLastOrderFx();
      finalOrderId = $lastOrder.getState();
      console.log("🔍 orderId después de esperar:", finalOrderId);
      setOrderId(finalOrderId);
    }

    if (!finalOrderId) {
      console.error("❌ No se pudo obtener orderId para verificar el pago.");
      return;
    }

    console.log(`📡 Enviando petición para verificar pago de orderId: ${finalOrderId}`);
    fetchPaymentStatusFx(finalOrderId);
  };

  return (
    <>
      {clientSecret && isCheckoutReady && ( // ✅ Evita renderizar si `clientSecret` cambia
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            clientSecret,
            onComplete: handleOnComplete, // ✅ `onComplete` es siempre el mismo
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </>
  );
}

export default StripePayment;
