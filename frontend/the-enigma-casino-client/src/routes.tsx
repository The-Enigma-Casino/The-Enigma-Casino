import RootLayout from "./layouts/RootLayout";
import Home from "./features/home/pages/Home";
import Error from "./features/error/pages/Error";
import Catalog from "./features/catalog/pages/Catalog";
import PaymentPage from "./features/payment/pages/PaymentPage";
import PaymentConfirmation from "./features/payment/pages/PaymentConfirmation";

import routeAuth from "./features/auth/routes";

import { createBrowserRouter } from "react-router-dom";
import WithdrawConfirmation from "./features/withdraw/pages/WithdrawConfirmation";
import Withdraw from "./features/withdraw/pages/Withdraw";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "payment", element: <PaymentPage /> },
      { path: "payment-confirmation", element: <PaymentConfirmation /> },
      { path: "withdraw", element: <Withdraw /> },
      { path: "withdraw-confirmation", element: <WithdrawConfirmation /> },
      { path: "catalog", element: <Catalog /> },
    ],
  },
  ...routeAuth,
]);

export default router;
