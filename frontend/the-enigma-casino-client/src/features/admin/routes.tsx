import Error from "../error/pages/Error";
import UsersAdminPage from "./pages/UsersAdminPage";
import CoinsAdminPage from "./pages/CoinsAdminPage";
import AdminLayout from "./layouts/AdminLayout";
import { RouteObject } from "react-router-dom";

const routeAdmin: RouteObject[] = [
  {
    path: "admin",
    element: <AdminLayout />,
    errorElement: <Error />,
    children: [
      { path: "users", element: <UsersAdminPage /> },
      { path: "coins", element: <CoinsAdminPage /> },
    ],
  },
];

export default routeAdmin;
