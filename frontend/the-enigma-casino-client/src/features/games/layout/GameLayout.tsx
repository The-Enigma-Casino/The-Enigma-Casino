import { BlackjackGamePage } from "../blackjack/pages/BlackjackGamePage";
import { Chat } from "../shared/components/chat/Chat";


export const GameLayout = () => {
  return (
    <div className="flex w-full h-full">
      <div className="w-[18%] p-4 bg-Background-Overlay text-white flex flex-col">
        <Chat />
      </div>

      <div className="flex-grow p-4">
        <BlackjackGamePage />
      </div>
    </div>
  );
};