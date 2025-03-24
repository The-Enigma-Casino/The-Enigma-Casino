import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { $tables } from '../store/tableStores';
import { fetchTables } from '../actions/tableActions';

function GameTable() {
  const { gameType } = useParams<{ gameType: string }>();
  const tables = useUnit($tables);

  useEffect(() => {
    if (gameType) {
      fetchTables(Number(gameType));
    }
  }, [gameType]); // Cada vez que cambie gameType

  const nameGame = {
    name: gameType === "0" ? "Blackjack" : gameType === "1" ? "Poker" : "Ruleta"
  }

  return (
    <div>
      <h2 className="text-4xl font-bold">Mesas de {nameGame.name}- Tipo {gameType}</h2>
      {tables.length > 0 ? (
        <ul className="list-disc pl-5">
          {tables.map((table) => (
            <li key={table.id}>
              <strong>{table.name}</strong> - {table.maxPlayer} jugadores máximo
              <div>
                {table.players.length > 0
                  ? `Jugadores: ${table.players.length}`
                  : "Sin jugadores"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay mesas disponibles para este tipo de juego.</p>
      )}
    </div>
  );
}

export default GameTable;
