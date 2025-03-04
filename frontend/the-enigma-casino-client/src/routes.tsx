import RootLayout from "./layouts/RootLayout";
import Home from "./features/home/pages/Home";
import Error from "./features/error/pages/Error";
import Catalog from "./features/catalog/pages/Catalog";

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
      { path: "catalog", element: <Catalog /> },
    ],
  },
  ...routeAuth,
]);

export default router;
