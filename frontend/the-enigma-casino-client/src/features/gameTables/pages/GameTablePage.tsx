import { useUnit } from "effector-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  $countdowns,
  $currentTableId,
  $isInLobby,
  $joiningTableId,
  $pendingJoinTableId,
  $tables,
  $waitingOpponentTableId,
  clearPendingJoinTableId,
  exitLobbyPage,
  joinTableClicked,
  leaveTableClicked,
  sendLeaveTableMessage,
  tryJoinTable,
} from "../store/tablesIndex";
import { GameTable, Player } from "../models/GameTable.interface";
import { useEffect } from "react";
import { fetchTables } from "../actions/tableActions";

import "../../games/roulette/stores/rouletteHandler";
import "../../games/pocker/stores/pokerHandler";
import "../../games/match/matchHandler";
import { IMAGE_PROFILE_URL } from "../../../config";

function GameTablePage() {
  const navigate = useNavigate();

  const { gameType } = useParams<string>();
  const tables = useUnit($tables) as GameTable[];
  const countdowns = useUnit($countdowns);
  const currentTableId = useUnit($currentTableId);
  const isInLobby = useUnit($isInLobby);
  const pendingTableId = useUnit($pendingJoinTableId);
  const waitingOpponentTableId = useUnit($waitingOpponentTableId);
  const joiningTableId = useUnit($joiningTableId);

  useEffect(() => {
    if (gameType) {
      fetchTables(Number(gameType));
    }
  }, [gameType]);

  useEffect(() => {
    return () => {
      exitLobbyPage();
    };
  }, []);

  useEffect(() => {
    if (pendingTableId !== null) {
      joinTableClicked(pendingTableId);
      clearPendingJoinTableId();
    }
  }, [pendingTableId]);

  const location = useLocation();

  useEffect(() => {
    if (pendingTableId && location.pathname.startsWith("/tables")) {
      tryJoinTable(pendingTableId);
      clearPendingJoinTableId();
    }
  }, [pendingTableId, location.pathname]);

  const gameNames = ["Blackjack", "Poker", "Ruleta"];
  const gameName = gameNames[parseInt(gameType ?? "")] || "Desconocido";

  const handleJoinTable = (tableId: number) => {
    tryJoinTable(tableId);
  };

  const renderPlayerAvatars = (
    players: (Player | null)[],
    maxPlayers: number,
    tableId: number
  ) => {
    const isJoining = joiningTableId === tableId;

    const slots = Array.from({ length: maxPlayers }).map((_, i) => {
      if (players[i]) {
        return (
          <img
            key={i}
            src={
              IMAGE_PROFILE_URL + players[i]?.avatar || "/img/user_default.webp"
            }
            alt={`Jugador ${players[i]?.name}`}
            className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full"
          />
        );
      } else {
        return (
          <div
            key={i}
            className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-gray-500 flex justify-center items-center cursor-pointer hover:bg-gray-600"
            onClick={() => {
              if (!isJoining) handleJoinTable(tableId);
            }}
          >
            <span className="text-white text-lg font-bold">+</span>
          </div>
        );
      }
    });

    const mid = Math.ceil(maxPlayers / 2);
    const topRow = slots.slice(0, mid);
    const bottomRow = slots.slice(mid);

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-center gap-3">{topRow}</div>
        <div className="flex justify-center gap-3">{bottomRow}</div>
      </div>
    );
  };

  //Friend
  const pendingJoinTableId = useUnit($pendingJoinTableId);

  useEffect(() => {
    if (pendingJoinTableId !== null) {
      joinTableClicked(pendingJoinTableId);
      clearPendingJoinTableId();
    }
  }, [pendingJoinTableId]);

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-10 gap-6 min-h-screen w-full max-w-full flex flex-col text-white bg-Background-Page overflow-x-hidden">
      <h2
        className="text-8xl font-bold text-center mb-6 text-white inline-block"
        style={{
          textShadow: "0px 4px 8px rgba(255, 255, 255, 0.4)",
        }}
      >
        Mesas de {gameName}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-10 lg:gap-12 xl:gap-16 flex-grow shadow-xl-white">
        {tables.length > 0 ? (
          tables.map((table) => (
            <div
              key={table.id}
              className="bg-gray-800 text-white text-2xl sm:text-3xl md:text-4xl p-4 sm:p-5 md:p-6 rounded-2xl shadow-custom-white hover:shadow-custom-gray transition-all relative overflow-hidden h-full flex flex-col justify-center items-center max-w-[95vw] sm:max-w-none"
            >
              {currentTableId === table.id && isInLobby && (
                <button
                  className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl z-20 text-base"
                  onClick={() => {
                    sendLeaveTableMessage();
                    leaveTableClicked();
                    navigate("/");
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="/svg/delete.svg"
                      alt="salir"
                      className="w-8 h-8 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                    />
                    <span className="hidden sm:inline text-base md:text-lg lg:text-xl font-medium">
                      Salir
                    </span>
                  </div>
                </button>
              )}
              <img
                src="/img/mesa_lobby.webp"
                alt="Mesa de casino"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <div className="relative z-10 p-6 text-center">
                <h3 className="font-bold text-5xl mt-4">{table.name}</h3>
                <p className="text-md text-gray-300 mt-2">
                  Máximo: {table.maxPlayer} jugadores
                </p>

                {countdowns[table.id] !== undefined && (
                  <p className="mt-2 text-xl font-semibold text-red-300 animate-pulse">
                    Empieza en {countdowns[table.id]}s
                  </p>
                )}
                <div className="mt-3 min-h-[2.5rem] flex items-center justify-center">
                  {waitingOpponentTableId === table.id ? (
                    <p className="text-yellow-400 text-lg font-semibold animate-pulse text-center">
                      Esperando a un oponente para comenzar la partida...
                    </p>
                  ) : null}
                </div>
                <div className="mt-4">
                  {renderPlayerAvatars(
                    table.players,
                    table.maxPlayer,
                    table.id
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No hay mesas disponibles</p>
        )}
      </div>
    </div>
  );
}

export default GameTablePage;
