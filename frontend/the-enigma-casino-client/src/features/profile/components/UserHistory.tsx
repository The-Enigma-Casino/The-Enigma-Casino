import { GameDto } from "../store/history/types";
import Pagination from "../ui/Pagination";

interface UserHistoryProps {
  games: GameDto[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const gameTypeMap: Record<number, { label: string; img: string }> = {
  0: { label: "BLACK JACK", img: "/img/ficha-blackjack.webp" },
  1: { label: "Póker", img: "/img/ficha-poker.webp" },
  2: { label: "Ruleta", img: "/img/ficha-roulette.webp" },
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString("es-ES");
};

const UserHistory: React.FC<UserHistoryProps> = ({
  games,
  page,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="bg-Background-Page text-white flex flex-col items-center px-4 py-6 font-sans text-xl sm:text-2xl md:text-3xl">
      {/* Tabla */}
      <div className="w-full max-w-6xl border border-Green-lines rounded-md overflow-hidden">
        {/* Encabezado */}
        <div className="grid grid-cols-3 bg-Principal text-black font-bold text-3xl text-center py-4">
          <div>FECHA</div>
          <div>JUEGO</div>
          <div>BOTE GANADO</div>
        </div>

        {/* Filas */}
        {games.length === 0 ? (
          <div className="text-center text-white text-2xl py-10">
            No hay partidas disponibles.
          </div>
        ) : (
          games.map((game) => {
            const info = gameTypeMap[game.gameType];

            return (
              <div
                key={game.id}
                className="grid grid-cols-3 items-center bg-Background-Overlay text-center text-white py-6 px-2 sm:px-4"
              >
                <div className="font-bold">{formatDate(game.joinedAt)}</div>
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={info.img}
                    alt={info.label}
                    className={`h-10 sm:h-12 ${
                      info.label === "BLACK JACK"
                        ? "w-6 sm:w-8"
                        : "w-10 sm:w-12"
                    }`}
                  />
                  <span className="uppercase">{info.label}</span>
                </div>
                <div className="text-yellow-400 font-bold">
                  {game.chipResult > 0 ? `+${game.chipResult}` : 0}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginación */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default UserHistory;
