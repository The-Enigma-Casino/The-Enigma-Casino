import CardGame from '../ui/CardGame';
import classes from './GamePanel.module.css';

function GamePanel() {

  const cardData = [
    {
      imageUrl: "/img/poker.webp",
      navigateTo: "/",
      name: "POKER",
    },
    {
      imageUrl: "/img/blackjack.webp",
      navigateTo: "/",
      name: "BLACKJACK",
    },
    {
      imageUrl: "/img/roulette.webp",
      navigateTo: "/",
      name: "RULETA",
    }
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
            navigateTo={card.navigateTo}
            name={card.name}
          />
        ))}
      </div>
    </div>
  );
}

export default GamePanel;
