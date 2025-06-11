import { Navigate, RouteObject } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Error from "../error/pages/Error";
import EmailConfirmation from "./pages/EmailConfirmation";
import GoogleRegisterPage from "./pages/GoogleRegisterPage";

const routeAuth: RouteObject[] = [
  {
    path: "auth",
    element: <AuthLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Navigate to="login" replace />,
      },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "email-confirmation/:token", element: <EmailConfirmation /> },
      { path: "google-register", element: <GoogleRegisterPage/> },
    ],
  },
];

export default routeAuth;
