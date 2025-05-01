import { createEvent, sample } from "effector";
import { navigateTo } from "../../shared/router/navigateFx";
import { RoulettePlayer } from "../types/roulettePlayer.type";
import { $name } from "../../../auth/store/authStore";
import { getPlayerAvatarsFx } from "../../actions/playerAvatarsAction";
import { loadCoins } from "../../../coins/store/coinsStore";

export const gameStateReceived = createEvent<{
  tableId: number;
  canPlaceBets: boolean;
  players: {
    nickName: string;
    bets: { bet: string; amount: number }[];
  }[];
}>();
export const spinResultReceived = createEvent<any>();
export const betConfirmed = createEvent<any>();

export const betsOpenedReceived = createEvent();
export const betsClosedReceived = createEvent();
export const roulettePausedReceived = createEvent();

export const playerPlaceBet = createEvent<any>();
export const requestGameState = createEvent<number>();

export const resetGameState = createEvent();

export const placeRouletteBet = createEvent<{
  tableId: string;
  amount: number;
  betType:
    | "Straight"
    | "Color"
    | "EvenOdd"
    | "Dozen"
    | "Column"
    | "HighLow";
  number?: number;
  color?: "red" | "black";
  evenOdd?: "Even" | "Odd";
  dozen?: 1 | 2 | 3;
  column?: 1 | 2 | 3;
  highLow?: "High" | "Low";
}>();

export const resetSpinResult = createEvent();

export const countdownTick = createEvent<number>();

export type PlaceRouletteBetPayload = {
  tableId: string;
  amount: number;
  betType: "Straight" | "Color" | "EvenOdd" | "Dozen" | "Column" | "HighLow";
  number?: number;
  color?: "red" | "black";
  evenOdd?: "Even" | "Odd";
  dozen?: 1 | 2 | 3;
  column?: 1 | 2 | 3;
  highLow?: "High" | "Low";
};

export const rouletteStopedReceived = createEvent();

export const matchReadyReceived = createEvent<number>();


sample({
  clock: matchReadyReceived,
  fn: (tableId) => {
    const path = `/game/roulette/${tableId}`;
    return path;
  },
  target: navigateTo,
});


export const setRoulettePlayers = createEvent<RoulettePlayer[]>();

export const resetRoulettePlayers = createEvent();


sample({
  clock: gameStateReceived,
  source: $name,
  fn: (currentName, payload): RoulettePlayer[] => {
    console.log("[✅ DEBUG sample] Payload:", payload);
    if (!payload?.players) return [];

    if (!currentName) return payload.players;

    return payload.players.filter(
      (p) => p.nickName.toLowerCase() !== currentName.toLowerCase()
    );
  },
  target: setRoulettePlayers,
});



sample({
  clock: setRoulettePlayers,
  fn: (players) => players.map((p) => p.nickName),
  target: getPlayerAvatarsFx,
});

sample({
  clock: gameStateReceived,
  target: loadCoins
});
