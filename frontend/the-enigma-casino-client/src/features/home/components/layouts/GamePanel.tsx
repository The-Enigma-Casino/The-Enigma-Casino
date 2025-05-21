import CardGame from "../ui/CardGame";

function GamePanel() {
  const cardData = [
    {
      imageUrl: "/img/blackjack.webp",
      name: "BLACKJACK",
      gameType: 0,
    },
    {
      imageUrl: "/img/poker.webp",
      name: "POKER",
      gameType: 1,
    },
    {
      imageUrl: "/img/roulette.webp",
      name: "RULETA",
      gameType: 2,
    },
  ];

  return (
    <div className="flex flex-col items-center text-center text-Principal gap-8">
      <h1 className="text-[5rem] font-black text-Principal">NUESTROS JUEGOS</h1>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
        {cardData.map((card, index) => (
          <CardGame
            key={index}
            imageUrl={card.imageUrl}
            altText={card.name}
            gameType={card.gameType}
            name={card.name}
          />
        ))}
      </div>
    </div>
  );
}

export default GamePanel;
