import { createEvent, createStore, sample } from "effector";
import toast from "react-hot-toast";
import { navigateTo } from "../shared/router/navigateFx";

export const eliminatedNoCoinsReceived = createEvent();

export const $wasEliminated = createStore(false).on(
  eliminatedNoCoinsReceived,
  () => true
);

export const resetEliminationStatus = createEvent();
$wasEliminated.reset(resetEliminationStatus);

sample({
  clock: eliminatedNoCoinsReceived,
  fn: () => {
    toast.error(
      "Te has quedado sin monedas suficientes para continuar. Has sido eliminado de la mesa.",
      {
        id: "eliminated_no_coins",
      }
    );

    return "/";
  },
  target: navigateTo,
});
