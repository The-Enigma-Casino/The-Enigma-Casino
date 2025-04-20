import { useEffect } from "react";
import { useUnit } from "effector-react";

// Stores
import { spinResult$ } from "../stores/rouletteStores";
import { betsClosed$ } from "../stores/rouletteStores";
import { isPaused$ } from "../stores/rouletteStores";
import { $currentTableId } from "../../../gameTables/store/tablesStores";

// Eventos
import { requestGameState } from "../stores/rouletteEvents";

// Componentes
import { RouletteBetBoard } from "../components/RouletteBetBoard";

function RouletteGamePage() {
  const spinResult = useUnit(spinResult$);
  const isBetsClosed = useUnit(betsClosed$);
  const isPaused = useUnit(isPaused$);
  const tableId = useUnit($currentTableId);

  useEffect(() => {
    if (tableId) requestGameState(tableId);
  }, [tableId]);

  const number = spinResult?.result?.number ?? "-";
  const color = spinResult?.result?.color ?? "-";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900 bg-repeat p-6 text-white font-mono">
      <h1 className="text-7xl text-center font-bold mb-6 drop-shadow">♠️ Ruleta</h1>

      {isPaused ? (
        <h2 className="text-3xl font-bold text-red-500 mb-6">Ruleta pausada por inactividad</h2>
      ) : (
        <>
          <h2 className="text-2xl mb-4">Número ganador: {number}</h2>
          <h2 className="text-2xl mb-4">Color ganador: {color}</h2>
          <RouletteBetBoard disabled={isBetsClosed} />
        </>
      )}
    </div>
  );
}

export default RouletteGamePage;
