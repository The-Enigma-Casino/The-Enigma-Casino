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
    <div className="w-full overflow-x-auto py-4 px-2 bg-black/30 rounded-t-xl">
      <div className="flex gap-4 min-w-fit">
        {players.map((player) => {
          const avatar = getAvatar(player.nickName);
          if (!avatar) return null;

          const country = countryCache[avatar.country ?? ""];
          const flagUrl = country?.flags?.png;

          return (
            <div
              key={player.nickName}
              className="bg-black/40 p-4 rounded-xl text-white shadow-md min-w-[250px] max-w-[250px] flex-shrink-0"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`${IMAGE_PROFILE_URL}${avatar.image}`}
                    alt={player.nickName}
                    className="w-12 h-12 rounded-full border border-white object-cover"
                  />
                  <p className="text-lg font-bold">{player.nickName}</p>
                </div>

                {flagUrl && (
                  <img
                    src={flagUrl}
                    alt={`Bandera de ${country.name.common}`}
                    className="w-6 h-4 object-cover rounded shadow"
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
