import CardGame from '../ui/CardGame';
import classes from './GamePanel.module.css';

function GamePanel() {

  const cardData = [
    {
      imageUrl: "/img/icono.webp",
      navigateTo: "/",
      name: "POKER",
    },
    {
      imageUrl: "/img/icono.webp",
      navigateTo: "/",
      name: "BLACKJACK",
    },
    {
      imageUrl: "/img/icono.webp",
      navigateTo: "/",
      name: "RULETA",
    }
  ];

  return (
    <div className={classes.panelContainer}>
      <h1>NUESTROS JUEGOS</h1>

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
