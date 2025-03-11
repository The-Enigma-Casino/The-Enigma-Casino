import InfoWithdraw from "../components/layouts/InfoWithdraw";

function WithdrawConfirmation() {
  const isPaid: boolean = true;
  const hasError: boolean = false;

  return (
    <section className="min-h-full bg-Background-Page flex flex-col gap-[2rem] lg:gap-[9rem]">
      {isPaid && (
        <>
          <h1 className="text-Coins text-[4rem] font-bold text-center font-reddit pt-8 lg:text-[6rem]">
            PAGO REALIZADO
          </h1>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <InfoWithdraw />
            <img
              className="w-80 h-80"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/2048px-MetaMask_Fox.svg.png"
              alt="metamask"
            />
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
