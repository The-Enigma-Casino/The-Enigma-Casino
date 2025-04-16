import { createEvent, createStore, sample } from "effector";
import { getPriceGachaponFx, playGachaponFx } from "../actions/gachaponEffects";

// EVENTOS
export const playGachaponClicked = createEvent();
export const loadGachaponPrice = createEvent();
export const resetGachapon = createEvent(); // 👈 nuevo evento para resetear el resultado

// PRECIO DEL GACHAPON
export const $gachaponPrice = createStore<number | null>(null)
  .on(getPriceGachaponFx.doneData, (_, price) => price)
  .reset(getPriceGachaponFx.fail);

// RESULTADO DE JUGAR
export const $gachaponPlayResult = createStore<{
  benefit: number;
  specialMessage?: string;
} | null>(null)
  .on(playGachaponFx.doneData, (_, result) => {
    if (!result) throw new Error("Failed to play gachapon");
    return result;
  })
  .reset([playGachaponFx.fail, resetGachapon]); // 👈 también se resetea desde resetGachapon

// TRIGGERS
sample({
  clock: playGachaponClicked,
  target: playGachaponFx,
});

sample({
  clock: loadGachaponPrice,
  target: getPriceGachaponFx,
});
