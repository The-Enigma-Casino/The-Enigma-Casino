import React, { useState } from 'react';

import { Country } from '../../../countries/models/country.interface';
import { searchCountryByName } from '../../../countries/actions/countriesActions';

type SearchInputProps = {
  placeholder: string;
};

const SearchInput = ({ placeholder }: SearchInputProps) => {
  const [results, setResults] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      const countries = await searchCountryByName(value); 
      setResults(countries);
    } else {
      setResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
      />
      {results.length > 0 && (
        <ul>
          {results.map((country) => (
            <li key={country.cca3}>{country.name.common}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { SearchInput };
