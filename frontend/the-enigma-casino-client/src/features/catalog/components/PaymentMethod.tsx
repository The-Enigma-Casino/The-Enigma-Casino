import React, { useState } from "react";
import { useUnit } from "effector-react";
import { $selectedCard, selectPaymentMethod } from "../store/catalogStore";
import { useNavigate } from "react-router-dom";
import { $token } from "../../auth/store/authStore";
import ButtonCard from "./ButtonCard";
import toast from "react-hot-toast";

const PaymentMethod: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>("Stripe"); //Stripe por defecto
  const selectedCard = useUnit($selectedCard);
  const navigate = useNavigate();
  const token = useUnit($token);

  const handlePaymentSelection = (method: string) => {
    setSelectedPayment(method);
    selectPaymentMethod(method);
  };

  const handlePayment = () => {
    if (!token) {
      toast.error("Por favor, inicie sesión para continuar con el pago.");
      setTimeout(() => {
        navigate("/auth/login")
      }, 3000);
    } else if (selectedPayment && selectedCard) {
      navigate("/payment", { state: { ...selectedCard, paymentMethod: selectedPayment } });
    } else {
      toast.error("Por favor, selecciona una forma de pago y una tarjeta.");
    }
  };


  return (
    <div className="bg-Background-Overlay p-6 rounded-2xl shadow-lg flex flex-col items-center w-80 gap-6">
      <h2 className="text-4xl font-extrabold text-white mb-4">Método de Pago</h2>
      <div className="w-full flex flex-row md:flex-col gap-4 items-center justify-center">
        <div
          className={`w-full flex flex-col gap-4 items-center p-4 border-2 rounded-lg cursor-pointer mb-3 ${selectedPayment === "Stripe" ? "border-Principal" : "border-Grey-color"
            }`}
          onClick={() => handlePaymentSelection("Stripe")}
        >
          <img src="/img/pago-stripe.webp" alt="Stripe" />
          <input type="radio" checked={selectedPayment === "Stripe"} readOnly className="mr-3 w-5 h-5" />
          <span className="text-white text-lg">Pagar con Stripe</span>
        </div>

        <div
          className={`w-full flex gap-4 flex-col items-center p-4 border-2 rounded-lg cursor-pointer ${selectedPayment === "Ethereum" ? "border-Principal" : "border-Grey-color"
            }`}
          onClick={() => handlePaymentSelection("Ethereum")}
        >
          <img src="/img/pago-ethereum.webp" alt="Stripe" />
          <input type="radio" checked={selectedPayment === "Ethereum"} readOnly className="mr-3 w-5 h-5" />
          <span className="text-white text-lg">Pagar con Ethereum</span>
        </div>
      </div>


      <ButtonCard
        selectedPayment={!!selectedPayment}
        selectedCard={!!selectedCard}
        disabled={!selectedPayment || !selectedCard} // Si falta cualquiera, se deshabilita
        onClick={handlePayment}
      >
        Pagar
      </ButtonCard>
    </div >
  );
};

export default PaymentMethod;
