import { formatPriceWithCurrency } from "../../../../utils/priceUtils";

interface Player {
  name: string;
  cent: number;
}

function Winners() {
  const players: Player[] = [
    { name: "Alejandro", cent: 77700 },
    { name: "Jose", cent: 35000 },
    { name: "Raquel", cent: 1000000000 },
    { name: "Rocio", cent: 4000 },
    { name: "Jose S", cent: 5000 },
    { name: "Fernando", cent: 1000 },
    { name: "Pablo", cent: 2000 },
    { name: "Mikel", cent: 3000 },
    { name: "Antoñito", cent: 4000 },
    { name: "David", cent: 6000 },
  ];

  return (
    <div className="p-6 text-white text-center bg-[#2e2e2e] rounded-full">
      <p className="text-lg">
        {players.map((player, index) => (
          <span key={index}>
            {player.name} - {formatPriceWithCurrency(player.cent)}
            {index < players.length - 1 ? " | " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

export default Winners;
