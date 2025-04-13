import { createEvent, createStore, sample } from 'effector';
import { getPriceGachaponFx, playGachaponFx } from '../actions/gachaponActions';

export const $gachaponPrice = createStore<number | null>(null)
  .on(getPriceGachaponFx.doneData, (_, price) => price)
  .reset(getPriceGachaponFx.fail);

export const $gachaponPlayResult = createStore<number | null>(null)
  .on(playGachaponFx.doneData, (_, revenue) => {
    if (revenue == null) {
      throw new Error('Failed to play gachapon');
    }
    return revenue;
  } )
  .reset(playGachaponFx.fail);

  export const playGachaponClicked = createEvent();

  export const loadGachaponPrice = createEvent();

  sample({
    clock: playGachaponClicked,
    target: playGachaponFx,
  });

sample({
  clock: loadGachaponPrice,
  target: getPriceGachaponFx,
});
