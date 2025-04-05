import React, { useEffect, useRef } from "react";
import InfoWithdraw from "../components/layouts/InfoWithdraw";
import MetaMaskLogo from "@metamask/logo";

const WithdrawConfirmation: React.FC = () => {
  const isPaid: boolean = true;
  const hasError: boolean = false;
  const logoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewer = MetaMaskLogo({
      pxNotRatio: true,
      width: 200,
      height: 200,
      followMouse: true,
      slowDrift: true,
    });

    if (logoRef.current) {
      logoRef.current.appendChild(viewer.container);
    }
    return () => {
      viewer.stopAnimation();
    };
  }, []);

  return (
    <section className="min-h-full bg-Background-Page flex flex-col gap-[2rem] lg:gap-[9rem]">
      {isPaid && (
        <>
          <h1 className="text-Coins text-[4rem] font-bold text-center font-reddit pt-8 lg:text-[6rem]">
            PAGO REALIZADO
          </h1>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <InfoWithdraw />
            <div className="flex justify-center items-center my-5" ref={logoRef}></div>
          </div>
          <h1 className="text-Principal text-[2.5rem] font-bold text-center font-reddit lg:text-[6rem]">
            TUS FICHAS YA FUERON RETIRADAS
          </h1>
        </>
      )}

      {hasError && (
        <div className="text-center text-red-500 text-[3rem] font-bold font-reddit pt-8 lg:text-[5rem]">
          ❌ ERROR EN EL PAGO ❌
          <p className="text-[2rem] text-white mt-4">
            Hubo un problema con tu pago. Inténtalo de nuevo.
          </p>
        </div>
      )}
    </section>
  );
}

export default WithdrawConfirmation;
