import { useParams } from "react-router-dom";
import { Chat } from "../chat/components/Chat";
import { BlackjackGamePage } from "../blackjack/pages/BlackjackGamePage";
import RouletteGamePage from "../roulette/pages/RouleteGamePage";
import PokerGamePage from "../pocker/pages/PokerGamePage";

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

        <div className="flex-grow h-full overflow-auto">
          <div className="flex flex-col h-full w-full bg-Background-Overlay text-white">
            <div className="flex-grow overflow-auto">
              {gameType === "blackjack" && <BlackjackGamePage />}
              {gameType === "poker" && <PokerGamePage/>}
              {gameType === "roulette" && <RouletteGamePage/>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
