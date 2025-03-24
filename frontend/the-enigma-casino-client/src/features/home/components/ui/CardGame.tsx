import { useNavigate } from "react-router-dom";
import classes from "./CardGame.module.css";

interface CardGameProps {
  imageUrl: string;
  altText: string;
  name: string;
  gameType: number;
}

const CardGame: React.FC<CardGameProps> = ({ imageUrl, altText, gameType, name }) => {
  const navigate = useNavigate();

  return (
    <div className={classes.cardGameContainer} onClick={() => navigate(`/tables/${gameType}`)}>
      <div className={classes.cardGameImage}>
        <img
          src={imageUrl}
          alt={altText}
        />
      </div>
      <h2 className={classes.title}>{name}</h2>
    </div>
  );
};


export default CardGame;
