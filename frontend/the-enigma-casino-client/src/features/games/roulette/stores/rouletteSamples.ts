import { sample } from "effector";
import { $currentTableId } from "../../../gameTables/store/tablesStores";
import { messageSent } from "../../../../websocket/store/wsIndex";
import {
  countdownStart,
  countdownTick,
  gameStateReceived,
  matchReadyReceived,
  playerKickedReceived,
  playerPlaceBet,
  requestGameState,
  requestWheelState,
  setRoulettePlayers,
} from "./index";
import toast from "react-hot-toast";
import { navigateTo } from "../../shared/router/navigateFx";
import { $name } from "../../../auth/store/authStore";
import { RoulettePlayer } from "../types/roulettePlayer.type";
import { getPlayerAvatarsFx } from "../../actions/playerAvatarsAction";
import { loadCoins } from "../../../coins/stores/coinsStore";
import { forceLeaveTable } from "../../../gameTables/store/tablesIndex";

sample({
  clock: playerPlaceBet,
  source: $currentTableId,
  fn: (tableId, bet) =>
    JSON.stringify({
      type: "roulette",
      action: "place_bet",
      tableId: String(tableId),
      ...bet,
    }),
  target: messageSent,
});

sample({
  clock: requestGameState,
  fn: (tableId) =>
    JSON.stringify({
      type: "roulette",
      action: "request_game_state",
      tableId: String(tableId),
    }),
  target: messageSent,
});

sample({
  clock: requestWheelState,
  fn: (tableId) =>
    JSON.stringify({
      type: "roulette",
      action: "wheel_state",
      tableId: String(tableId),
    }),
  target: messageSent,
});

sample({
  source: playerKickedReceived,
  fn: () => {
    toast.error("Has sido expulsado de la mesa por inactividad.", {
      id: "kicked_for_inactivity",
    });

    return "/";
  },
  target: [navigateTo, forceLeaveTable],
});


sample({
  clock: gameStateReceived,
  source: $name,
  fn: (
    currentName: string,
    payload: { players: RoulettePlayer[] }
  ): RoulettePlayer[] => {
    if (!payload?.players) return [];

    if (!currentName) return payload.players;

    return payload.players.filter(
      (p) =>
        typeof p.nickName === "string" &&
        typeof currentName === "string" &&
        p.nickName.toLowerCase() !== currentName.toLowerCase()
    );
  },
  target: setRoulettePlayers,
});

sample({
  clock: setRoulettePlayers,
  fn: (players) =>
    players
      .filter((p) => p.nickName !== $name.getState())
      .map((p) => p.nickName),
  filter: (nicknames) => nicknames.length > 0,
  target: getPlayerAvatarsFx,
});

sample({
  clock: gameStateReceived,
  target: loadCoins,
});

sample({
  clock: matchReadyReceived,
  fn: (tableId) => {
    const path = `/game/roulette/${tableId}`;
    return path;
  },
  target: navigateTo,
});

sample({
  clock: countdownTick,
  target: countdownStart,
});
