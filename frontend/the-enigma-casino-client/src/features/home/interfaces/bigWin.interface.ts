export interface BigWin {
  nickname: string;
  gameType: number;
  amountWon: number;
  wonAt: string;
}

export const gameTypeMap: Record<number, string> = {
  0: "Blackjack",
  1: "Poker",
  2: "Rulette",
};
