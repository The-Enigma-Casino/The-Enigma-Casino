import React, { useState } from "react";
import { useUnit } from "effector-react";
import { $selectedCard, selectPaymentMethod } from "../store/paymentStore";
import { useNavigate } from "react-router-dom";

const PaymentMethod: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>("Stripe"); //Stripe por defecto
  const selectedCard = useUnit($selectedCard);
  const navigate = useNavigate();

  const handlePaymentSelection = (method: string) => {
    setSelectedPayment(method);
    selectPaymentMethod(method);
  };

  const handlePayment = () => {
    if (selectedPayment && selectedCard) {
      navigate("/payment", { state: { ...selectedCard, paymentMethod: selectedPayment } }); //Ruta navegar PAGO
    }
  };

  return (
    <div className="bg-Background-Overlay p-6 rounded-2xl shadow-lg flex flex-col items-center w-80">
      <h2 className="text-4xl font-extrabold text-white mb-4">Método de Pago</h2>

      <div
        className={`w-full flex flex-col gap-4 items-center p-4 border-2 rounded-lg cursor-pointer mb-3 ${selectedPayment === "Stripe" ? "border-Principal" : "border-gray-500"
          }`}
        onClick={() => handlePaymentSelection("Stripe")}
      >
        <img src="/img/pago-stripe.webp" alt="Stripe" />
        <input type="radio" checked={selectedPayment === "Stripe"} readOnly className="mr-3 w-5 h-5" />
        <span className="text-white text-lg">Pagar con Stripe</span>
      </div>

      <div
        className={`w-full flex gap-4 flex-col items-center p-4 border-2 rounded-lg cursor-pointer ${selectedPayment === "Ethereum" ? "border-Principal" : "border-gray-500"
          }`}
        onClick={() => handlePaymentSelection("Ethereum")}
      >
        <img src="/img/pago-ethereum.webp" alt="Stripe" />
        <input type="radio" checked={selectedPayment === "Ethereum"} readOnly className="mr-3 w-5 h-5" />
        <span className="text-white text-lg">Pagar con Ethereum</span>
      </div>

      <button
        className={`mt-6 px-6 py-3 text-2xl text-Black-color font-bold rounded-lg w-full ${selectedPayment && selectedCard
          ? "bg-Principal text-white hover:bg-Coins"
          : "bg-gray-500 text-gray-300 cursor-not-allowed"
          }`}
        disabled={!selectedPayment || !selectedCard}
        onClick={handlePayment}
      >
        Pagar
      </button>
    </div>
  );
};

export default PaymentMethod;
