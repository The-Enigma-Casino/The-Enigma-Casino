import { createEvent, createStore, sample } from "effector";
import { PlayerDto } from "../shared/interfaces/playerDto.interface";
import { getPlayerAvatarsFx } from "../actions/playerAvatarsAction";

export const fetchPlayerAvatars = createEvent<string[]>();


export const resetPlayerAvatars = createEvent();

export const $playerAvatars = createStore<PlayerDto[]>([])
  .on(getPlayerAvatarsFx.doneData, (_, avatars) => avatars)
  .reset(resetPlayerAvatars);

sample({
  clock: fetchPlayerAvatars,
  target: getPlayerAvatarsFx,
});
