import { PlaceRouletteBetPayload } from "../stores/rouletteEvents";

// Función para construir la apuesta a enviar
export function buildBetPayload(
  tableId: string,
  key: string,
  amount: number
): PlaceRouletteBetPayload | undefined {
  if (key.startsWith("number_")) {
    const number = parseInt(key.split("_")[1]);
    return { tableId, amount, betType: "Straight", number };
  }

  if (key === "sector_9")
    return { tableId, amount, betType: "Color", color: "red" };
  if (key === "sector_10")
    return { tableId, amount, betType: "Color", color: "black" };
  if (key === "sector_8")
    return { tableId, amount, betType: "EvenOdd", evenOdd: "Even" };
  if (key === "sector_11")
    return { tableId, amount, betType: "EvenOdd", evenOdd: "Odd" };
  if (key === "sector_7")
    return { tableId, amount, betType: "HighLow", highLow: "Low" };
  if (key === "sector_12")
    return { tableId, amount, betType: "HighLow", highLow: "High" };
  if (key === "sector_4")
    return { tableId, amount, betType: "Dozen", dozen: 1 };
  if (key === "sector_5")
    return { tableId, amount, betType: "Dozen", dozen: 2 };
  if (key === "sector_6")
    return { tableId, amount, betType: "Dozen", dozen: 3 };
  if (key === "sector_1")
    return { tableId, amount, betType: "Column", column: 1 };
  if (key === "sector_2")
    return { tableId, amount, betType: "Column", column: 2 };
  if (key === "sector_3")
    return { tableId, amount, betType: "Column", column: 3 };

  console.warn("[Ruleta] Sector no reconocido:", key);
  return undefined;
}
