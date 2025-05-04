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
