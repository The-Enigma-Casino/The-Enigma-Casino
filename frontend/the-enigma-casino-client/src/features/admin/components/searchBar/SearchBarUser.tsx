import { useState } from "react";

interface Props {
  onSearch: (searchTerm: string) => void;
  onReset: () => void;
}

export function SearchBarUser({ onSearch, onReset }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      onReset();
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      onSearch(searchTerm);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    onReset();
  };

  return (
    <div className="flex items-center gap-6 justify-center mb-10">
      <div className="flex items-center bg-Background-nav border-2 border-Green-lines rounded-full px-6 py-3 w-[400px]">
        <button onClick={handleSearch}>
          <img
            src="/svg/search-user.svg"
            alt="Buscar"
            className="w-6 h-6 mr-3 hover:scale-110 transition-transform"
          />
        </button>
        <input
          className="bg-transparent outline-none w-full text-white placeholder-white text-lg"
          type="text"
          placeholder="Introduzca un nombre de usuario"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {searchTerm && (
        <button
          onClick={handleReset}
          className="text-Principal font-bold text-lg px-4 py-2 border-2 border-Green-lines rounded-full hover:scale-105 transition-transform"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
