import { useState } from "react";
import { Chat } from "./Chat";

interface ChatMobileProps {
  gameType: "poker" | "blackjack" | "roulette";
}

export const ChatMobile = ({ gameType }: ChatMobileProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {!expanded && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-[var(--Principal)] p-4 rounded-full shadow-lg"
          onClick={() => setExpanded(true)}
        >
          <img src="/svg/menu.svg" alt="Chat" className="w-8 h-8" />
        </button>
      )}

      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex flex-col">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setExpanded(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-lg"
            >
              Cerrar chat
            </button>
          </div>
          <div className="flex-grow overflow-hidden px-2">
            <Chat gameType={gameType} />
          </div>
        </div>
      )}
    </>
  );
};
