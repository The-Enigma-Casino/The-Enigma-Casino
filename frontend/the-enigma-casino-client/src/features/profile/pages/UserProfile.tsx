import Button from "../../../components/ui/button/Button";

const UserProfile = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 bg-Background-Page min-h-screen">
        <div className="relative bg-Background-Overlay rounded-xl border border-Green-lines pt-20 pb-10 px-10 w-[700px] h-[450px] mx-auto text-white">
          {/* Avatar */}
          <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full border-4 border-transparent overflow-hidden ">
            <img src="/img/blackjack.webp" alt="Foto de perfil" className="w-full h-full object-cover" />
          </div>

          {/* User Data */}
          <div className="flex flex-col lg:flex-row justify-between gap-4 mt-20">
            {/* Info */}
            <div className="flex flex-col gap-4 text-2xl">
              <h2 className="font-bold text-3xl">Apodo: <span>Ale777</span></h2>
              <h2 className="font-bold text-3xl">Nombre de Usuario: <span>Alejandro Barrionuevo</span></h2>
              <h2 className="font-bold text-3xl">Correo electrónico: <span>Ale777@gmail.com</span></h2>
              <h2 className="font-bold text-3xl">Dirección: <span>Calle Fin del Mundo Nº777</span></h2>
              <h2 className="font-bold text-3xl">Nacionalidad: <span>ESPAÑA</span></h2>
              <h2 className="font-bold text-3xl">Rol: <span>Admin</span></h2>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4">
              <Button
                variant="shortPlus"
                color="green"
                font="bold"
                onClick={() => console.log("Modificar Datos")}
              >Modificar Datos</Button>
              <Button
                variant="shortPlus"
                color="green"
                font="bold"
                onClick={() => console.log("Modificar contraseña")}
              >Modificar Contraseña</Button>
              <Button
                variant="shortPlus"
                color="green"
                font="bold"
                onClick={() => console.log("Retirar Dinero")}
              >Retirar Dinero</Button>
            </div>
          </div>

          {/* Coins */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <h2 className="font-bold text-5xl text-Coins">12.327</h2>
            <img src="/svg/coins.svg" alt="Coins" />
          </div>
        </div>
      </div>

      {/* History */}
      <div></div>
    </>

  );
};

export default UserProfile;
