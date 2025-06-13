import axios from "axios";
import { createEffect, createStore } from "effector";
import { COUNTRIES_API_URL } from "../config";
import { Country } from "../models/country.interface";

export const countriesFx = createEffect<void, Country[], Error>(async () => {
  try {
    const response = await axios.get<Country[]>(`${COUNTRIES_API_URL}/all?fields=name,cca2,cca3,flags`, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
});

export const searchByAlphaCodeFx = createEffect<string, Country | null, Error>(async (code) => {
  const url = `${COUNTRIES_API_URL}/alpha/${code}`;

  try {
    const response = await axios.get<Country[]>(url, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Error fetching country by alpha code:", error);
    return null;
  }
});

export const searchCountryByName = async (term: string): Promise<Country[]> => {
  const url = `${COUNTRIES_API_URL}/name/${term}`;

  try {
    const response = await axios.get<Country[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching countries by name:', error);
    return [];
  }
};

export const $allCountries = createStore<Country[]>([]).on(
  countriesFx.doneData,
  (_, countries) => countries
);

export const getFlagUrlByCca3 = (code: string, countries: Country[]): string | null => {
  const country = countries.find(c => c.cca3.toUpperCase() === code.toUpperCase());
  return country?.flags?.png ?? null;
};
