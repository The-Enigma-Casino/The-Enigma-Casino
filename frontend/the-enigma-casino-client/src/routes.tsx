import RootLayout from "./layouts/RootLayout";
import Home from "./features/home/pages/Home";
import Error from "./features/error/pages/Error";


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
      { path: "payment", element: <PaymentPage />  },
    ],
  },
  ...routeAuth,
]);

export default router;