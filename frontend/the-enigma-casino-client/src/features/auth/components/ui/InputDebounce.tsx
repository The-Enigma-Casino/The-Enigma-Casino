import React, { useEffect, useState } from "react";
import { Country } from "../../../countries/models/country.interface";
import { searchByAlphaCodeFx, searchCountryByName } from "../../../countries/actions/countriesActions";

type SearchInputProps = {
  placeholder: string;
  onSelect: (countryCode: string) => void;
  countryCode?: string;
  inputPaddingLeft?: string;
  flagLeft?: string;
};

const InputDebounce = ({ placeholder, onSelect, countryCode  }: SearchInputProps) => {
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
    <div className="flex items-center bg-white rounded-[20px] h-[60px] border border-gray-300 relative">
      {selectedCountry && (
        <img
          className="absolute left-[40px] top-1/2 transform -translate-y-1/2 w-[25px] h-[18px] rounded-sm"
          src={selectedCountry.flags.svg}
          alt={`Bandera de ${selectedCountry.name.common}`}
        />
      )}
      <input
        className={`border-none outline-none flex-1 bg-transparent text-[1.5rem] text-black placeholder-gray-400 rounded-[20px] h-full ${
          selectedCountry ? 'pl-[80px]' : 'pl-[40px]'
        }`}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>

    {results.length > 0 && (
      <ul className="absolute top-full left-0 right-0 bg-white border text-black border-gray-300 rounded-[20px] shadow-md z-[1000] mt-1 max-h-[200px] overflow-y-auto">
        {results.map((country) => (
          <li
            className="flex items-center gap-2 w-full h-[60px] px-[40px] text-[1.5rem] cursor-pointer transition-colors duration-300 ease-in-out rounded-[20px] border-b border-gray-300 hover:bg-gray-100 last:border-none"
            key={country.cca3}
            onClick={() => handleSelectCountry(country)}
          >
            <img
              className="w-[25px] h-[18px] rounded-sm"
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
