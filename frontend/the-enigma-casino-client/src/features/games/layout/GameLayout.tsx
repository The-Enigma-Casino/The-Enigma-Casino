import { BlackjackGamePage } from "../blackjack/pages/BlackjackGamePage";
import { Chat } from "../shared/components/chat/Chat";

export const GameLayout = () => {
  return (
    <div className="flex flex-row h-screen w-screen">
      <div className="w-[15%] h-full p-4 bg-Background-Overlay text-white">
        <Chat />
      </div>

      <div className="flex-grow h-full p-4 overflow-auto">
        <BlackjackGamePage />
      </div>
    </div>
  );
};
