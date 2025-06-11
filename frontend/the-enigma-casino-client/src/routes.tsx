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
import routeProfile from "./features/profile/routes";
import routeAdmin from "./features/admin/routes";
import PoliciesPage from "./features/policies/pages/PoliciesPrivacyPage";
import { AuthGuard } from "./guards/AuthGuard";
import AboutPage from "./features/about/pages/AboutPage";
import ServerPage from "./features/server/pages/ServerPage";
import InstallPage from "./features/install/pages/InstallPage";

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
      { path: "catalog", element: <Catalog /> },
      { path: "policies", element: <PoliciesPage /> },

      {
        path: "payment",
        element: (
          <AuthGuard>
            <PaymentPage />
          </AuthGuard>
        ),
      },
      {
        path: "payment-confirmation",
        element: (
          <AuthGuard>
            <PaymentConfirmation />
          </AuthGuard>
        ),
      },
      {
        path: "withdrawal",
        element: (
          <AuthGuard>
            <Withdrawal />
          </AuthGuard>
        ),
      },
      {
        path: "withdraw-confirmation",
        element: (
          <AuthGuard>
            <WithdrawalConfirmation />
          </AuthGuard>
        ),
      },
      {
        path: "tables/:gameType",
        element: (
          <AuthGuard>
            <GameTable />
          </AuthGuard>
        ),
      },
      {
        path: "about",
        element: <AboutPage />
      },
      {
        path: "server",
        element: <ServerPage />,
      },
      {
        path: "install-app",
        element: <InstallPage />,
      }
    ],
  },
  ...routeAuth,
  ...routeGames,
  ...routeProfile,
  ...routeAdmin,
]);

export default router;
