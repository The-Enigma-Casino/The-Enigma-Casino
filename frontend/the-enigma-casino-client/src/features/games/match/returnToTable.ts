import { createEvent, createStore, sample } from "effector";
import toast from "react-hot-toast";
import { navigateTo } from "../shared/router/navigateFx";

export const returnToTableReceived = createEvent<string>();

export const $wasReturnedAlone = createStore(false)
  .on(returnToTableReceived, () => true);

export const resetReturnStatus = createEvent();
$wasReturnedAlone.reset(resetReturnStatus);

sample({
  clock: returnToTableReceived,
  fn: (msg) => {
    toast.error(msg || "Todos los demás jugadores han abandonado. Volverás a la sala principal.");
    return "/";
  },
  target: navigateTo,
});
