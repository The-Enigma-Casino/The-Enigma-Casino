import React, { useEffect, useState } from "react";
import classes from "./InputDebounce.module.css";
import { Country } from "../../../countries/models/country.interface";
import { searchByAlphaCodeFx, searchCountryByName } from "../../../countries/actions/countriesActions";

type SearchInputProps = {
  placeholder: string;
  onSelect: (countryCode: string) => void;
  countryCode?: string;
  inputPaddingLeft?: string;
  flagLeft?: string;
};

const InputDebounce = ({ placeholder, onSelect, countryCode, inputPaddingLeft, flagLeft }: SearchInputProps) => {
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
    <div className={classes.container}>
      <div className={`${classes.inputWrapper} ${selectedCountry ? classes.withFlag : ""}`}>
        {selectedCountry && (
          <img
            className={classes.flagIcon}
            src={selectedCountry.flags.svg}
            alt={`Bandera de ${selectedCountry.name.common}`}
            style={{ left: flagLeft || "40px" }}
          />
        )}
        <input
          className={`${classes.input} ${selectedCountry ? classes.withFlag : ""}`}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
          style={{ paddingLeft: inputPaddingLeft || (selectedCountry ? "80px" : "40px") }}
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
