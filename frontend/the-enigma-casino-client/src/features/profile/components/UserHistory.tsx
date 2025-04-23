const games = {
  poker: { label: 'Póker', icon: '🎲' },
  ruleta: { label: 'Ruleta', icon: '🎡' },
  blackjack: { label: 'BLACK JACK', icon: '🂡' },
};

const rows = [
  { date: '22/06/2025', game: 'poker', prize: 10000 },
  { date: '22/06/2025', game: 'ruleta', prize: 12000 },
  { date: '22/06/2025', game: 'poker', prize: 1000 },
  { date: '22/06/2025', game: 'blackjack', prize: 2500 },
  { date: '21/06/2025', game: 'blackjack', prize: 45000 },
];

const UserHistory = () => {
  return (
    <div className="bg-Background-Page text-white flex flex-col items-center px-4 py-6 font-sans text-3xl">
      {/* Título */}
      <div className="w-full max-w-xl mb-4  ">
        <h2 className=" text-Principal font-bold text-4xl px-4 py-3">
          HISTORIAL DE PARTIDAS
        </h2>
      </div>

      {/* Tabla */}
      <div className="w-full max-w-6xl border border-Green-lines rounded-md overflow-hidden">
        {/* Encabezado */}
        <div className="grid grid-cols-3 bg-Principal text-black font-bold text-3xl text-center py-4">
          <div>FECHA</div>
          <div>JUEGO</div>
          <div>BOTE GANADO</div>
        </div>

        {/* Filas */}
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-3 md:grid-cols-3 items-center bg-Background-Overlay   text-center text-white py-6 px-2 sm:px-4"
          >
            <div className="font-bold">{row.date}</div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl">{games[row.game].icon}</span>
              <span className="uppercase">{games[row.game].label}</span>
            </div>
            <div className="text-yellow-400 font-bold">{row.prize}</div>
          </div>
        ))}
      </div>

      {/* Paginacion */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 text-white items-center font-bold text-3xl">
        <span className="cursor-pointer">{'‹'}</span>
        {[1, 2, 3, 4, 5].map((page) => (
          <span
            key={page}
            className={`cursor-pointer px-2 ${page === 1 ? 'text-green-400 font-bold' : 'text-white'
              }`}
          >
            {page}
          </span>
        ))}
        <span>…</span>
        <span className="cursor-pointer">{'›'}</span>
      </div>
    </div>
  );
};

export default UserHistory;
