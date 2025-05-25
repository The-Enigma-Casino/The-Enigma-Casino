import Button from "../../../components/ui/button/Button";
import ModalEditUser from "../modal/ModalEditUser";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ModalEditImage from "../modal/ModalEditImage";
import { IMAGE_PROFILE_URL } from "../../../config";
import ModalEditPassword from "../modal/ModalEditPassword";
import { useUnit } from "effector-react";
import { getFlagUrlByCca3 } from "../../../utils/flagUtils";
import {
  $allCountries,
  countriesFx,
} from "../../countries/actions/countriesActions";
import {
  inviteFriendFromList,
  sendFriendRequestWs,
  startGameLoading,
} from "../../friends/stores/friends.events";
import { $friends, $onlineFriendsMap } from "../../friends/stores/friends.store";

interface UserData {
  id?: number;
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
  relations: "self" | "friend" | "stranger";
}

const UserInfo: React.FC<UserInfoProps> = ({ user, relations }) => {
  const { name, email, nickname, address, country, coins, image, role } = user;
  const navigate = useNavigate();
  const onlineFriends = useUnit($onlineFriendsMap);
  console.log("Online Friends Map:", onlineFriends);
  const isOnline = onlineFriends.has(Number(user.id));
  const isStatusFriend = useUnit($friends);

  const isPlaying = isStatusFriend.find((f) => f.status === "Playing");


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const countries = useUnit($allCountries);
  const flagUrl = getFlagUrlByCca3(user.country ?? "ESP", countries);

  const isSelf = relations === "self";
  const isFriend = relations === "friend";
  const isStranger = relations === "stranger";

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("pointerdown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (countries.length === 0) {
      countriesFx();
    }
  }, []);

  return (
    <>
      <div className="bg-Background-Page px-4 pt-40 sm:pt-44 md:pt-48 pb-10 flex flex-col items-center">
        <div
          className={`relative bg-Background-Overlay border ${isFriend || isStranger ? "border-Principal" : "border-Principal"
            } rounded-xl px-6 py-20 w-full max-w-6xl text-white mb-20 flex flex-col items-center`}
        >
          {/* Avatar */}
          <div
            className={`absolute -top-20 sm:-top-28 lg:-top-32 w-40 h-40 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-full overflow-hidden border-transparent cursor-pointer transition duration-100 transform hover:scale-105 hover:border-2 hover:border-Principal hover:shadow-[0_0_20px_var(--Principal)]`}
            onClick={isSelf ? () => setShowImageModal(true) : undefined}
          >
            <img
              src={`${IMAGE_PROFILE_URL}${image}?${Date.now()}`}
              alt="Foto de perfil"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Bandera */}
          {(isFriend || isStranger) && flagUrl && (
            <div className="absolute top-4 right-4">
              <img
                src={flagUrl}
                alt={`Bandera de ${user.country}`}
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
              <p className={!isSelf ? "text-5xl" : ""}>
                {isSelf && "Nickname: "}
                <strong>{nickname}</strong>
              </p>

              {isSelf && name && (
                <p>
                  Nombre de Usuario: <strong>{name}</strong>
                </p>
              )}
              {isSelf && email && (
                <p>
                  Correo electrónico: <strong>{email}</strong>
                </p>
              )}
              {isSelf && address && (
                <p>
                  Dirección: <strong>{address}</strong>
                </p>
              )}
              {isSelf && country && flagUrl && (
                <div className="flex items-center gap-3">
                  <p>Nacionalidad:</p>
                  <img
                    src={flagUrl}
                    alt={`Bandera de ${user.country}`}
                    className="w-10 h-7 object-cover rounded"
                  />
                </div>
              )}
              {isSelf && role && (
                <p>
                  Rol: <strong>{role}</strong>
                </p>
              )}
            </div>

            {/* Botones */}
            {isSelf && (
              <div className="flex flex-col gap-4 items-center mx-auto lg:mx-0">
                <Button
                  variant="shortPlus"
                  color="green"
                  font="bold"
                  onClick={handleOpenModal}
                >
                  Modificar Datos
                </Button>
                <Button
                  variant="shortPlus"
                  color="green"
                  font="bold"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Modificar Contraseña
                </Button>
                <Button
                  variant="shortPlus"
                  color="green"
                  font="bold"
                  onClick={() => navigate("/withdrawal")}
                >
                  Retirar Dinero
                </Button>
              </div>
            )}

            {isFriend && isOnline && !isPlaying && (

              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="bigPlus"
                  color="green"
                  font="bold"
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  Invitar a partida ⏷
                </Button>

                {showDropdown && (
                  <div className="absolute top-[110%] right-0 w-104 text-2xl bg-Background-Overlay border border-Principal rounded-xl shadow-xl z-50 overflow-hidden">
                    {[
                      { label: "Mesa de Blackjack", value: "BlackJack" },
                      { label: "Mesa de Poker", value: "Poker" },
                      { label: "Mesa de Ruleta", value: "Roulette" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => {
                          if (user.id !== undefined) {
                            startGameLoading();
                            inviteFriendFromList({
                              friendId: user.id,
                              gameType: item.value,
                            });
                            setShowDropdown(false);
                          }
                        }}
                        className="w-full px-4 py-2 text-white hover:bg-zinc-700 transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isFriend && isPlaying && (
              <p className="text-yellow-400 text-4xl">Tu amigo está en una partida</p>
            )}

            {isFriend && !isOnline && (
              <p className="text-gray-400 text-4xl">Tu amigo está desconectado</p>
            )}

            {isStranger && user.id !== undefined && (
              <Button
                variant="bigPlus"
                color="green"
                font="bold"
                onClick={() => {
                  sendFriendRequestWs({ receiverId: user.id! });
                }}
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

      {/* Modal editar perfil */}
      {isModalOpen && (
        <ModalEditUser
          onCancel={handleCloseModal}
          onSave={() => {
            handleCloseModal();
          }}
        />
      )}
      {/* Modal imagen */}
      {showImageModal && (
        <ModalEditImage
          image={image}
          onCancel={() => setShowImageModal(false)}
          onConfirm={() => {
            setShowImageModal(false);
          }}
        />
      )}
      {/* Modal Contrasena */}
      {showPasswordModal && (
        <ModalEditPassword
          onCancel={() => setShowPasswordModal(false)}
          onConfirm={() => {
            setShowPasswordModal(false);
          }}
        />
      )}
    </>
  );
};

export default UserInfo;
