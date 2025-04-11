import "./ModalGachaComponent.module.css";

function ModalGachaComponent({ isOpen, closeModal }) {
  if (!isOpen) return null;

  return (
    <div className="bg-Background-Overlay flex flex-row justify-center w-full">
      <div className="bg-Background-Overlay border border-solid border-Principal w-[650px] h-[705px] relative">
        <p className="absolute w-[297px] h-[22px] top-[577px] left-44 font-reddit font-bold text-Principal text-2xl text-center tracking-[0] leading-4">
          1 Tirada = 10 Fichas
        </p>

        <div className="absolute w-[571px] h-[85px] top-3 left-[60px]">
          <div className="absolute w-[560px] h-[85px] top-0 left-0 font-reddit font-bold text-Principal text-[40px] text-center tracking-[0] leading-10">
            GACHAPÓN <br />
            DE LA SUERTE
          </div>

          <img
            className="absolute w-[30px] h-[30px] top-[5px] left-[541px] cursor-pointer"
            alt="Cerrar"
            src={"/svg/close.svg"}
            onClick={closeModal} // Llama a la función para cerrar el modal
          />
        </div>

        <div className="absolute w-[466px] h-[452px] top-[100px] left-[97px] rounded-[20px] bg-[url(/frame-8.png)] bg-cover bg-[50%_50%]" />

        <div className="absolute w-[250px] h-[50px] top-[626px] left-[200px] bg-Principal rounded-[20px] shadow-custom-gray">
          <div className="absolute w-[250px] h-[26px] top-2.5 left-0 font-reddit font-bold text-Background-Page text-2xl text-center tracking-[0] leading-4">
            ¡COMPRAR TIRADA!
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalGachaComponent;
