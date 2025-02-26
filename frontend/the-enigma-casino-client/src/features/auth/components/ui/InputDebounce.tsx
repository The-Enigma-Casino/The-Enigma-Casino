import classes from "./InputDebounce.module.css";

import React, { useState } from "react";
import { Country } from "../../../countries/models/country.interface";
import { searchCountryByName } from "../../../countries/actions/countriesActions";

type SearchInputProps = {
  placeholder: string;
  onSelect: (countryCode: string) => void; 
};

const InputDebounce = ({ placeholder, onSelect }: SearchInputProps) => {
  const [results, setResults] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      const countries = await searchCountryByName(value);
      setResults(countries.slice(0, 3));
    } else {
      setResults([]);
    }
  };

  const handleSelectCountry = (country: Country) => {
    setSearchTerm(country.name.common); 
    setResults([]);
    onSelect(country.cca3); 
  };
  

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
      />
      {results.length > 0 && (
        <ul className={classes.results} 
        >
          {results.map((country) => (
            <li className={classes.list}
              key={country.cca3}
              onClick={() => handleSelectCountry(country)}
            >
              <img
                src={country.flags.svg}
                alt={`Bandera de ${country.name.common}`}
                style={{ width: "20px", height: "15px", borderRadius: "2px" }}
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
