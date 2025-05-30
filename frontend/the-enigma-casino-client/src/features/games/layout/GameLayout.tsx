import { useParams } from "react-router-dom";
import { Chat } from "../chat/components/Chat";
import { BlackjackGamePage } from "../blackjack/pages/BlackjackGamePage";
import RouletteGamePage from "../roulette/pages/RouleteGamePage";
import { PokerGamePage } from "../pocker/pages/PokerGamePage";
import { NavigationInit } from "../shared/router/NavigationInit";
import { useLeaveTableOnUnload } from "../hooks/useLeaveTableOnUnload";
import { useMediaQuery } from "../../../utils/useMediaQuery";
import { ChatMobile } from "../chat/components/ChatMobile";
import { useEffect } from "react";
import { resetMessages } from "../chat/stores/chatStore";

export const GameLayout = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const numericId = parseInt(tableId ?? "0", 10);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  useLeaveTableOnUnload();

  useEffect(() => {
    return () => {
      resetMessages();
    };
  }, [tableId]);

  const gameType =
    numericId >= 1 && numericId <= 6
      ? "blackjack"
      : numericId >= 7 && numericId <= 12
      ? "poker"
      : "roulette";

  return (
    <>
      <NavigationInit />
      <div className="flex flex-row h-screen w-full">
        {/* Chat visible solo en escritorio */}
        {!isMobile && (
          <div className="w-[15%] h-full p-4 bg-Background-Overlay text-white">
            <Chat gameType={gameType} />
          </div>
        )}

        {/* Chat flotante solo en móvil */}
        {isMobile && <ChatMobile gameType={gameType} />}

        <div className="flex-grow h-full overflow-auto">
          <div className="flex flex-col h-full w-full bg-Background-Overlay text-white">
            <div className="flex-grow overflow-auto">
              {gameType === "blackjack" && <BlackjackGamePage />}
              {gameType === "poker" && <PokerGamePage />}
              {gameType === "roulette" && <RouletteGamePage />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
