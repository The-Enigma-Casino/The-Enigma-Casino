import { createStore, createEvent, sample } from "effector";
import { Country } from "../models/country.interface";
import { searchByAlphaCodeFx } from "../actions/countriesActions";


export const requestCountry = createEvent<string>();

export const $countryCache = createStore<Record<string, Country>>({})
  .on(searchByAlphaCodeFx.doneData, (state, result) => {
    if (!result) return state;
    return { ...state, [result.cca3]: result };
  });

  sample({
    clock: requestCountry,
    source: $countryCache,
    fn: (_, code) => code,
    filter: (cache, code) => !cache[code],
    target: searchByAlphaCodeFx,
  });
