import RootLayout from "./layouts/RootLayout";
import Home from "./features/home/pages/Home";
import Error from "./features/error/pages/Error";
import Catalog from "./features/catalog/pages/Catalog";
import PaymentPage from "./features/payment/pages/PaymentPage";
import PaymentConfirmation from "./features/payment/pages/PaymentConfirmation";

import routeAuth from "./features/auth/routes";
import routeGames from "./features/games/routes";

import { createBrowserRouter } from "react-router-dom";
import WithdrawalConfirmation from "./features/withdraw/pages/WithdrawalConfirmation";
import LandingPage from "./features/landingPage/pages/LandingPage";
import GameTable from "./features/gameTables/pages/GameTablePage";
import Withdrawal from "./features/withdraw/pages/Withdrawal";
import GachaponPage from "./GachaMachine/GachaponPage";

const router = createBrowserRouter([
  {
    path: "/landing",
    element: <LandingPage />,
  },
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "payment", element: <PaymentPage /> },
      { path: "payment-confirmation", element: <PaymentConfirmation /> },
      { path: "withdrawal", element: <Withdrawal /> },
      { path: "withdraw-confirmation", element: <WithdrawalConfirmation /> },
      { path: "catalog", element: <Catalog /> },
      { path: "/tables/:gameType", element: <GameTable /> },
      { path: "/gachapon", element: <GachaponPage /> },
    ],
  },
  ...routeAuth,
  ...routeGames,
]);

export default router;
