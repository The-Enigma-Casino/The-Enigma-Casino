import { socketMessageReceived } from "../../../websocket/store/wsIndex";
import { toast } from "react-hot-toast";

const errorMessageMap: Record<string, string> = {
  "already_left": "Has abandonado recientemente esta mesa. Espera a que termine la partida en curso o únete a otra mesa.",
  "not_enough_coins": "No tienes suficientes fichas para unirte.",
  "table_full": "La mesa está llena.",
  "maintenance": "Esta mesa está en mantenimiento.",
};

socketMessageReceived.watch((data) => {
  if (data.type !== "game_table" && data.type !== "error") return;

  const rawMessage = data.message;
  const userMessage = errorMessageMap[rawMessage] || "No se pudo procesar tu solicitud.";

  if (data.type === "game_table" || data.type === "error") {
    toast.error(userMessage);
  }

});
