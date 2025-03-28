import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUnit } from "effector-react";
import { $tables } from "../store/tableStores";
import { fetchTables } from "../actions/tableActions";

// Definir los tipos de los jugadores y las mesas
interface Player {
  id: number;
  name: string;
  avatar: string;
}

interface Table {
  id: number;
  name: string;
  maxPlayer: number;
  players: (Player | null)[];
}

function GameTable() {
  const { gameType } = useParams<string>();
  const tables = useUnit($tables) as Table[];

  useEffect(() => {
    if (gameType) {
      fetchTables(Number(gameType));
    }
  }, [gameType]);

  const gameNames = ["Blackjack", "Poker", "Ruleta"];
  const gameName = gameNames[parseInt(gameType)] || "Desconocido";

  const handleJoinTable = (tableId: number, index: number) => {
    // const updatedTables = tables.map((table) => {
    //   if (table.id === tableId && table.players[index] === null) {
    //     table.players[index] = user;
    //   }
    //   return table;
    // });
  };

  const renderPlayerAvatars = (players: (Player | null)[], maxPlayers: number, tableId: number) => {
    const avatars: JSX.Element[] = [];

    for (let i = 0; i < maxPlayers; i++) {
      if (players[i]) {
        // Si hay un jugador en esta posición, mostramos su avatar
        avatars.push(
          <img
            key={i}
            src={players[i]?.avatar || "/path-to-default-avatar.jpg"}
            alt={`Jugador ${players[i]?.name}`}
            className="w-12 h-12 rounded-full border-2 border-gray-500"
          />
        );
      } else {
        avatars.push(
          <div
            key={i}
            className="w-20 h-20 rounded-full bg-gray-500 flex justify-center items-center cursor-pointer hover:bg-gray-600"
            onClick={() => handleJoinTable(tableId, i)}
          >
            <span className="text-white text-lg font-bold">+</span>
          </div>
        );
      }
    }
    return avatars;
  };

  return (
    <div className="p-16 gap-6 h-screen w-screen flex flex-col text-white bg-Background-Page">
      <h2 className="text-8xl font-bold text-center mb-6 text-white inline-block" style={{
        textShadow: '0px 4px 8px rgba(255, 255, 255, 0.4)',
      }}>
        Mesas de {gameName}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-20 flex-grow shadow-xl-white">
        {tables.length > 0 ? (
          tables.map((table) => (
            <div
              key={table.id}
              className="bg-gray-800 text-white text-4xl p-6 rounded-2xl shadow-custom-white hover:shadow-custom-gray transition-all relative overflow-hidden h-full flex flex-col justify-center items-center"
            >
              <img
                src="/img/mesa_lobby.jpg"
                alt="Mesa de casino"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <div className="relative z-10 p-6 text-center">
                <h3 className="font-bold text-5xl mt-4">{table.name}</h3>
                <p className="text-md text-gray-300 mt-2">Máximo: {table.maxPlayer} jugadores</p>
                <div className="mt-3 text-gray-200">
                  {table.players.length > 0 ? (
                    <p>{table.players.filter(player => player !== null).length} jugadores en la mesa</p>
                  ) : (
                    <p className="text-gray-400">Sin jugadores</p>
                  )}
                </div>
                <div className="mt-4 flex justify-center gap-6">
                  {renderPlayerAvatars(table.players, table.maxPlayer, table.id)}
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

export default GameTable;
