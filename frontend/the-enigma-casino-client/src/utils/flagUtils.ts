// utils/flagUtils.ts
import type { Country } from "../features/countries/models/country.interface";

export const getFlagUrlByCca3 = (code: string, countries: Country[]): string | null => {
  const country = countries.find(c => c.cca3.toUpperCase() === code.toUpperCase());
  return country?.flags.svg || null;
};
