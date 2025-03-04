import RootLayout from "./layouts/RootLayout";
import Home from "./features/home/pages/Home";
import Error from "./features/error/pages/Error";
import Coins from "./features/catalog/components/Coins";

import routeAuth from "./features/auth/routes";

import { createBrowserRouter } from "react-router-dom";
import PaymentPage from "./features/payment/pages/PaymentPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "payment", element: <PaymentPage /> },
      { path: "coins", element: <Coins /> },
    ],
  },
  ...routeAuth,
]);

export default router;
