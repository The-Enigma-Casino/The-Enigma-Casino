export function translatePokerHandDescription(description: string): string {
  if (!description) return "";

  const cardName = (rank: string): string => {
    const map: Record<string, string> = {
      Ace: "As",
      King: "Rey",
      Queen: "Reina",
      Jack: "Jota",
      Ten: "Diez",
      Nine: "Nueve",
      Eight: "Ocho",
      Seven: "Siete",
      Six: "Seis",
      Five: "Cinco",
      Four: "Cuatro",
      Three: "Tres",
      Two: "Dos",
    };
    return map[rank] ?? rank;
  };

  if (description.includes("Escalera de Color"))
    return description
      .replace("Escalera de Color", "Escalera de color")
      .replace(
        /Carta Alta: (\w+)/,
        (_, rank) => `carta alta: ${cardName(rank)}`
      );

  if (description.startsWith("Póker:"))
    return description.replace("Póker: ", "Póker de ").replace(/s$/, "");

  if (description.startsWith("Full:"))
    return description
      .replace("Full: ", "Full: ")
      .replace(/s con /, " con ")
      .replace(/s$/, "")
      .replace(
        /(\w+) con (\w+)/,
        (_, trio, pair) => `${cardName(trio)} con ${cardName(pair)}`
      );

  if (description.startsWith("Color"))
    return description
      .replace("Color", "Color")
      .replace(
        /Carta Alta: (\w+)/,
        (_, rank) => `carta alta: ${cardName(rank)}`
      );

  if (description.startsWith("Escalera"))
    return description
      .replace("Escalera", "Escalera")
      .replace(
        /Carta Alta: (\w+)/,
        (_, rank) => `carta alta: ${cardName(rank)}`
      );

  if (description.startsWith("Trio de :"))
    return description
      .replace("Trio de :", "Trío de")
      .replace(/s$/, "")
      .replace(/\b(\w+)\b/, (_, rank) => cardName(rank));

  if (description.startsWith("DOBLE PAREJA"))
    return description
      .replace("DOBLE PAREJA: ", "Doble pareja: ")
      .replace("s and ", " y ")
      .replace(/s/g, "")
      .replace(
        /Doble pareja: (\w+) y (\w+)/,
        (_, a, b) => `Doble pareja: ${cardName(a)} y ${cardName(b)}`
      );

  if (description.startsWith("PAREJA DE"))
    return description
      .replace("PAREJA DE ", "Pareja de ")
      .replace(/s$/, "")
      .replace(/Pareja de (\w+)/, (_, rank) => `Pareja de ${cardName(rank)}`);

  if (description.startsWith("Carta Alta"))
    return description
      .replace("Carta Alta: ", "Carta alta: ")
      .replace(
        /Carta alta: (\w+)/,
        (_, rank) => `Carta alta: ${cardName(rank)}`
      );

  if (description.includes("Ganador automático"))
    return "Ganador automático (único jugador activo)";

  return description;
}
