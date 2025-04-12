import { useParams } from "react-router-dom";
import { Chat } from "../shared/components/chat/Chat";
import { BlackjackGamePage } from "../blackjack/pages/BlackjackGamePage";

export const GameLayout = () => {
  const { tableId } = useParams<{ tableId: string }>();

  const numericId = parseInt(tableId ?? "0", 10);

  const gameType =
    numericId >= 1 && numericId <= 6
      ? "blackjack"
      : numericId >= 7 && numericId <= 12
      ? "poker"
      : "roulette";

  return (
    <>
      <div className="flex flex-row h-screen w-screen">
        <div className="w-[15%] h-full p-4 bg-Background-Overlay text-white">
          <Chat gameType={gameType} />
        </div>

        <div className="flex-grow h-full p-4 overflow-auto">
          <BlackjackGamePage />
        </div>
      </div>
    </>
  );
};
