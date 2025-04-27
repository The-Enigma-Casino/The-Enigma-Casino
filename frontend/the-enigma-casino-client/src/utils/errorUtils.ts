export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as any).response?.data || "Error desconocido.";
  }
  return "Error desconocido.";
}
