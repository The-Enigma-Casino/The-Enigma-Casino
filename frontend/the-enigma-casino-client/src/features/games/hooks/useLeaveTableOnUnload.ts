
import { useEffect } from "react";
import { useUnit } from "effector-react";
import { $hasLeftTable } from "../../gameTables/store/tablesStores";
import { markLeftTable, sendLeaveTableMessage } from "../../gameTables/store/tablesEvents";


export const useLeaveTableOnUnload = () => {
  const hasLeft = useUnit($hasLeftTable);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasLeft) {
        e.preventDefault();
        e.returnValue = "¿Seguro que quieres salir? Puedes perder el historial de partida.";
      }
    };

    const handleUnload = () => {
      if (!hasLeft) {
        sendLeaveTableMessage();
        markLeftTable();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [hasLeft]);
};
