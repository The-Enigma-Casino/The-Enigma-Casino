import "./App.css";
import AuthLayout from "./layouts/AuthLayout";

import RootLayout from "./layouts/RootLayout";
import Error from "./pages/Error";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

const routeDefinition = createRoutesFromElements(
  <Route path="/" element={<RootLayout />} errorElement={<Error />}>
    <Route index element={<Home />} />

    <Route path="auth" element={<AuthLayout/>} >
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>

  </Route>
);

const router = createBrowserRouter(routeDefinition);

function App() {
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
