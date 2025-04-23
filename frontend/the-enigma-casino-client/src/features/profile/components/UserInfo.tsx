import Button from "../../../components/ui/button/Button";

interface UserData {
  name?: string;
  email?: string;
  nickname: string;
  address?: string;
  country?: string;
  coins?: number;
  image: string;
  role?: string;
}

interface UserInfoProps {
  user: UserData;
  relation: "self" | "friend" | "stranger";
}

const UserInfo: React.FC<UserInfoProps> = ({ user, relation }) => {
  const { name, email, nickname, address, country, coins, image, role } = user;

  const isSelf = relation === "self";
  const isFriend = relation === "friend";
  const isStranger = relation === "stranger";

  return (
    <>
      <div className="bg-Background-Page px-4 pt-40 sm:pt-44 md:pt-48 pb-10 flex flex-col items-center">
        <div
          className={`relative bg-Background-Overlay border ${isFriend || isStranger ? "border-Principal" : "border-Principal"
            } rounded-xl px-6 py-20 w-full max-w-6xl text-white mb-20 flex flex-col items-center`}
        >
          {/* Avatar */}
          <div
            className={`absolute -top-20 sm:-top-28 lg:-top-32
               w-40 h-40 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-full overflow-hidden`}
          >
            <img
              src={image}
              alt="Foto de perfil"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Bandera (opcional futura API) */}
          {(isFriend || isStranger) && (
            <div className="absolute top-4 right-4">
              <img
                src="/svg/flags/es.svg"
                alt="Bandera"
                className="w-10 h-7 object-cover rounded"
              />
            </div>
          )}

          {/* Contenido */}
          <div
            className={`${isStranger || isFriend
              ? "mt-28 text-center flex flex-col gap-6 items-center"
              : "flex flex-col lg:flex-row justify-between items-center lg:items-start mt-24 sm:mt-32 gap-10 w-full p-10"
              }`}
          >
            {/* Info */}
            <div
              className={`flex flex-col gap-4 ${isStranger || isFriend
                ? "text-3xl font-bold items-center"
                : "text-xl sm:text-2xl lg:text-3xl w-full text-center lg:text-left items-center lg:items-start"
                }`}
            >
              <p><strong>Nickname:</strong> {nickname}</p>
              {(isSelf) && country && <p><strong>Nacionalidad:</strong> {country}</p>}
              {isSelf && name && <p><strong>Nombre de Usuario:</strong> {name}</p>}
              {isSelf && email && <p><strong>Correo electrónico:</strong> {email}</p>}
              {isSelf && address && <p><strong>Dirección:</strong> {address}</p>}
              {isSelf && role && <p><strong>Rol:</strong> {role}</p>}
            </div>

            {/* Botones */}
            {isSelf && (
              <div className="flex flex-col gap-4 items-center mx-auto lg:mx-0">
                <Button variant="shortPlus" color="green" font="bold">
                  Modificar Datos
                </Button>
                <Button variant="shortPlus" color="green" font="bold">
                  Modificar Contraseña
                </Button>
                <Button variant="shortPlus" color="green" font="bold">
                  Retirar Dinero
                </Button>
              </div>
            )}

            {isFriend && (
              <Button
                variant="bigPlus"
                color="green"
                font="bold"
                onClick={() => console.log("Invitar a partida")}
              >
                Invitar a partida
              </Button>
            )}

            {isStranger && (
              <Button
                variant="bigPlus"
                color="green"
                font="bold"
                onClick={() => console.log("Enviar solicitud de Amistad")}
              >
                Enviar solicitud de Amistad
              </Button>
            )}
          </div>

          {/* Coins */}
          {isSelf && coins !== undefined && (
            <div className="flex justify-center items-center gap-3 mt-10 text-center">
              <h2 className="font-bold text-4xl sm:text-5xl text-Coins">
                {coins.toLocaleString()}
              </h2>
              <img
                src="/svg/coins.svg"
                alt="Coins"
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
          )}
        </div>
      </div>


    </>
  );
};

export default UserInfo;
