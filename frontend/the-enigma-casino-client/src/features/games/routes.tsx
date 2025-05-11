import { RouteObject } from "react-router-dom";
import Error from "../error/pages/Error";
import { BlackjackGamePage } from "./blackjack/pages/BlackjackGamePage";
import { GameLayout } from "./layout/GameLayout";
import RouletteGamePage from "./roulette/pages/RouleteGamePage";
import { PokerGamePage } from "./pocker/pages/PokerGamePage";
import { AuthGuard } from "../../guards/AuthGuard";

const routeGames: RouteObject[] = [
  {
    path: "game/:gameType/:tableId",
    element: (
      <AuthGuard>
        <GameLayout />
      </AuthGuard>
    ),
    errorElement: <Error />,
    children: [
      { path: "blackjack/:tableId", element: <BlackjackGamePage /> },
      { path: "poker/:tableId", element: <PokerGamePage /> },
      { path: "roulette/:tableId", element: <RouletteGamePage /> },
    ],
  },
];

export default routeGames;
