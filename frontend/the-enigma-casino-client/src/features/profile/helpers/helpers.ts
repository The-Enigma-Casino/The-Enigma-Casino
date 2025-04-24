export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.getFullYear() <= 1 ? "-" : date.toLocaleDateString("es-ES");
};

export const payModes: Record<number, string> = {
  0: "Ethereum",
  1: "Tarjeta",
};
