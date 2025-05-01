import { useEffect } from "react";
import { useUnit } from "effector-react";
import { roulettePlayers$ } from "../stores/rouletteStores";
import { $playerAvatars } from "../../stores/gamesStore";
import { $countryCache, requestCountry } from "../../../countries/stores/countriesStore";
import { IMAGE_PROFILE_URL } from "../../../../config";

export const RoulettePlayersPanel = () => {
  const players = useUnit(roulettePlayers$);
  const avatars = useUnit($playerAvatars);
  const countryCache = useUnit($countryCache);

  const getAvatar = (nickName: string) => {
    return avatars.find((a) => a.nickName === nickName);
  };

  useEffect(() => {
    avatars.forEach((a) => {
      if (a.country) {
        requestCountry(a.country);
      }
    });
  }, [avatars]);

  if (players.length === 0) return null;

  return (
    <div className="bg-black/40 rounded-xl p-4 h-[calc(100vh-48px)] overflow-y-auto flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        Jugadores en la partida
      </h2>

      <div className="grid grid-cols-1 gap-y-6">
        {players.map((player) => {
          const avatar = getAvatar(player.nickName);
          if (!avatar) return null;

          const country = countryCache[avatar.country ?? ""];
          const flagUrl = country?.flags?.png;

          return (
            <div
              key={player.nickName}
              className="bg-black/30 p-4 rounded-xl text-white shadow-md relative"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`${IMAGE_PROFILE_URL}${avatar.image}`}
                    alt={player.nickName}
                    className="w-14 h-14 rounded-full border border-white object-cover"
                  />
                  <p className="text-xl font-extrabold">{player.nickName}</p>
                </div>

                {flagUrl && (
                  <img
                    src={flagUrl}
                    alt={`Bandera de ${country.name.common}`}
                    className="w-8 h-6 object-cover rounded shadow"
                    style={{ marginRight: "4px", marginTop: "4px" }}
                  />
                )}
              </div>

              <div>
                <p className="font-bold mb-1 text-sm text-yellow-300">Apuestas:</p>
                {player.bets.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin apuestas activas</p>
                ) : (
                  <ul className="text-sm list-disc list-inside">
                    {player.bets.map((bet, idx) => (
                      <li key={idx}>
                        {bet.bet} – {bet.amount} fichas
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
