import React, { useState } from "react";
import classes from "./InputDebounce.module.css";
import { Country } from "../../../countries/models/country.interface";
import { searchCountryByName } from "../../../countries/actions/countriesActions";

type SearchInputProps = {
  placeholder: string;
  onSelect: (countryCode: string) => void;
};

const InputDebounce = ({ placeholder, onSelect }: SearchInputProps) => {
  const [results, setResults] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

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
    <div className={classes.container}>
      <div className={`${classes.inputWrapper} ${selectedCountry ? classes.withFlag : ""}`}>
        {selectedCountry && (
          <img
            className={classes.flagIcon}
            src={selectedCountry.flags.svg}
            alt={`Bandera de ${selectedCountry.name.common}`}
          />
        )}
        <input
          className={`${classes.input} ${selectedCountry ? classes.withFlag : ""}`}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {results.length > 0 && (
        <ul className={classes.results}>
          {results.map((country) => (
            <li
              className={classes.list}
              key={country.cca3}
              onClick={() => handleSelectCountry(country)}
            >
              <img
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
