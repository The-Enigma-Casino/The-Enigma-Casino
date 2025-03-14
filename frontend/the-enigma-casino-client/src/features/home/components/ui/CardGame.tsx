import { useNavigate } from "react-router-dom";
import classes from "./CardGame.module.css";

interface CardGameProps {
  imageUrl: string;
  altText: string;
  navigateTo: string;
  name: string;
}

const CardGame: React.FC<CardGameProps> = ({ imageUrl, altText, navigateTo, name }) => {
  const navigate = useNavigate();

  return (
    <div className={classes.cardGameContainer}>
      <div className={classes.cardGameImage}>
        <img
          src={imageUrl}
          alt={altText}
          onClick={() => navigate(navigateTo)}
        />
      </div>
      <h1 className={classes.title}>{name}</h1>
    </div>
  );
};


export default CardGame;
