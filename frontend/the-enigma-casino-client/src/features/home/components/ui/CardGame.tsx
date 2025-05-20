import { useNavigate } from "react-router-dom";

interface CardGameProps {
  imageUrl: string;
  altText: string;
  name: string;
  gameType: number;
}

const CardGame: React.FC<CardGameProps> = ({ imageUrl, altText, gameType, name }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tables/${gameType}`)}
      className="flex flex-col items-center justify-center w-[18rem] h-[20rem] bg-Background-Overlay rounded-[40px] text-white gap-6 cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:border-2 hover:border-Principal"
    >
      <div className="w-[14rem] h-[14rem] rounded-full overflow-hidden flex justify-center items-center">
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-3xl text-white text-center">{name}</h2>
    </div>
  );
};



export default CardGame;
