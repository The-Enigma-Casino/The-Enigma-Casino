import { createEvent, createStore, sample } from "effector";
import { autoBanFx } from "../actions/autoBan.action";
import toast from "react-hot-toast";
import { logoutWithReason } from "../../auth/store/authStore";

export const openAutoBanModal = createEvent();
export const closeAutoBanModal = createEvent();

export const $isAutoBanModalOpen = createStore(false)
  .on(openAutoBanModal, () => true)
  .on(closeAutoBanModal, () => false);

sample({
  clock: autoBanFx.done,
  target: closeAutoBanModal,
});

sample({
  clock: autoBanFx.fail,
  fn: ({ error }) => {
    const message =
      error instanceof Error
        ? error.message
        : "Error al intentar autobanearte.";
    toast.error(message);
  },
});

sample({
  clock: autoBanFx.done,
  fn: () => "Auto-expulsión",
  target: logoutWithReason,
});
