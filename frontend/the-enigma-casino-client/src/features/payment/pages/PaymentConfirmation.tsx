// import CoinsCard from "../../catalog/components/CoinsCard";

function PaymentConfirmation() {
  return (
    <>
      <section className="min-h-screen bg-Background-Page">
        <h1 className="text-Coins text-[6rem] font-bold text-center font-reddit">
          PAGO REALIZADO
        </h1>
        <div>
          {/* <CoinsCard
            key={1}
            id={1}
            price={1000}
            quantity={100}
            image={"/img/pack1.webp"}
            offer={0}
          /> */}
          {/* Mi nuevo componente */}
        </div>
        <h1 className="text-Principal text-[6rem] font-bold text-center font-reddit">
          ¡GRACIAS POR TU COMPRA!
        </h1>
      </section>
    </>
  );
}

export default PaymentConfirmation;
