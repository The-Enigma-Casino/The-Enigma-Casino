import { RouteObject } from "react-router-dom";
import Error from "../error/pages/Error";
import { BlackjackGamePage } from "./blackjack/pages/BlackjackGamePage";
import { GameLayout } from "./layout/GameLayout";

const routeGames: RouteObject[] = [
  {
    path: "game",
    element: <GameLayout />,
    errorElement: <Error />,
    children: [{ path: "blackjack", element: <BlackjackGamePage /> }],
  },
];

export default routeGames;
