import { useEffect, useState } from "react";
import { GamePlayerCardList } from "./GameCardPlayerList";
import { GameCard } from "../../interfaces/gameCard.interface";

type GamePlayer = {
  id: number;
  nickName: string;
  hand: GameCard[];
  total?: number;
  bets?: { bet: string; amount: number }[];
  isTurn?: boolean;
  coins: number;
  currentBet?: number;
  totalBet?: number;
  role?: "dealer" | "sb" | "bb";
};

type Props = {
  players: GamePlayer[];
  gameType: "Blackjack" | "Poker";
  revealedHands?: {
    userId: number;
    cards: { rank: number; suit: number }[];
  }[];
};

export const ResponsivePlayerList = ({ players, gameType, revealedHands }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <div className="hidden lg:block">
        <GamePlayerCardList players={players} gameType={gameType} revealedHands={revealedHands} />
      </div>

      <div className="block lg:hidden fixed top-4 right-4 z-1">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-700 text-white font-bold px-3 py-2 rounded-lg shadow-lg text-base sm:text-lg md:text-xl"
        >
          Jugadores
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          <div className="ml-auto h-full w-full max-w-[340px] bg-green-950 text-white shadow-lg p-4 overflow-y-auto overflow-x-hidden flex flex-col items-center animate-slide-in">

            <div className="flex justify-between items-center mb-4 z-50 relative">
              <button
                className="bg-[var(--Color-Cancel)] p-4 rounded-full shadow-lg z-50 relative"
                onClick={() => setIsOpen(false)}
              >
                <img
                  src="/svg/delete.svg"
                  alt="Cerrar chat"
                  className="w-8 h-8 pointer-events-none"
                />
              </button>
            </div>

            <div className="w-full flex justify-center">
              <div className={`${isMobile ? "scale-[0.92]" : ""} origin-top`}>
                <GamePlayerCardList players={players} gameType={gameType} revealedHands={revealedHands} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
