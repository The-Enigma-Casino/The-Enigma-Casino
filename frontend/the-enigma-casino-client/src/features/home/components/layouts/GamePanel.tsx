import CardGame from '../ui/CardGame';
import classes from './GamePanel.module.css';

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
    <div className={classes.panelContainer}>
      <h1 className={classes.title}>NUESTROS JUEGOS</h1>

      <div className={classes.cardContainer}>
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
