export const CHIP_VALUES = [100, 50, 25, 10, 5, 1]; // ahora sí, 1 cuenta

export function splitCoinsIntoChips(coins: number): number[] {
  const result: number[] = [];

  for (const value of CHIP_VALUES) {
    const count = Math.floor(coins / value);
    coins %= value;

    for (let i = 0; i < count; i++) {
      result.push(value);
    }
  }

  return result;
}