import { createEvent, createStore } from "effector";

export interface ActivePlayer {
  tableId: number;
  userId: number;
  nickName: string;
  image: string;
}

export const allPlayersReceived = createEvent<ActivePlayer[]>();
export const addActivePlayer = createEvent<ActivePlayer>();
export const setActivePlayers = createEvent<ActivePlayer[]>();
export const removeActivePlayer = createEvent<number>();
export const setPlayersForTable = createEvent<{ tableId: number; players: ActivePlayer[] }>();


export const $activePlayers = createStore<ActivePlayer[]>([])
  .on(setActivePlayers, (_, players) => players)
  .on(addActivePlayer, (state, newPlayer) => {
    const filtered = state.filter(
      (p) => !(p.userId === newPlayer.userId && p.tableId === newPlayer.tableId)
    );
    return [...filtered, newPlayer];
  });

$activePlayers.on(removeActivePlayer, (state, userId) =>
  state.filter((p) => p.userId !== userId)
);


$activePlayers.on(setPlayersForTable, (state, { tableId, players }) => {
  const filtered = state.filter((p) => p.tableId !== tableId);
  return [...filtered, ...players];
});
