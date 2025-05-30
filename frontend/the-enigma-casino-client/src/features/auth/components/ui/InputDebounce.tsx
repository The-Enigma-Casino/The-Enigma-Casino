import React, { useEffect, useState } from "react";
import { Country } from "../../../countries/models/country.interface";
import {
  searchByAlphaCodeFx,
  searchCountryByName,
} from "../../../countries/actions/countriesActions";

type SearchInputProps = {
  placeholder: string;
  onSelect: (countryCode: string) => void;
  countryCode?: string;
  inputPaddingLeft?: string;
  flagLeft?: string;
};

const InputDebounce = ({
  placeholder,
  onSelect,
  countryCode,
}: SearchInputProps) => {
  const [results, setResults] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  useEffect(() => {
    if (countryCode) {
      (async () => {
        const country = await searchByAlphaCodeFx(countryCode);
        if (country) {
          setSelectedCountry(country);
          setSearchTerm(country.name.common);
        }
      })();
    }
  }, [countryCode]);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setSelectedCountry(null);

    if (value) {
      const countries = await searchCountryByName(value);
      setResults(countries.slice(0, 3));
    } else {
      setResults([]);
    }
  };

  const handleSelectCountry = (country: Country) => {
    setSearchTerm(country.name.common);
    setSelectedCountry(country);
    setResults([]);
    onSelect(country.cca3);
  };

  return (
    <div className="relative w-full">
<div className="flex items-center w-full bg-white rounded-[20px] h-[60px] max-sm:h-[50px] border border-gray-300 relative overflow-hidden">        {selectedCountry && (
          <img
            className="absolute left-[20px] top-1/2 -translate-y-1/2 w-[22px] h-[16px] rounded-sm border border-gray-300"
            src={selectedCountry.flags.svg}
            alt={`Bandera de ${selectedCountry.name.common}`}
          />
        )}
        <input
          className={`w-full h-full leading-none bg-transparent text-black text-[1.5rem] placeholder-gray-400 rounded-[20px] outline-none border-none
        ${selectedCountry ? "pl-[60px]" : "pl-10"}
        max-sm:text-[1rem] max-sm:${selectedCountry ? "pl-[50px]" : "pl-6"}`}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {results.length > 0 && (
        <ul className="absolute top-full left-0 z-[1000] mt-1 w-full max-w-[260px] bg-white text-black border border-gray-300 rounded-[20px] shadow-md max-h-[200px] overflow-y-auto">
          {results.map((country) => (
            <li
              key={country.cca3}
              onClick={() => handleSelectCountry(country)}
              className="flex items-center gap-2 w-full h-[60px] px-6 text-[1.5rem] cursor-pointer border-b border-gray-300 hover:bg-gray-100 last:border-none"
            >
              <img
                className="w-[22px] h-[16px] rounded-sm border border-gray-300"
                src={country.flags.svg}
                alt={`Bandera de ${country.name.common}`}
              />
              {country.name.common}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InputDebounce;
