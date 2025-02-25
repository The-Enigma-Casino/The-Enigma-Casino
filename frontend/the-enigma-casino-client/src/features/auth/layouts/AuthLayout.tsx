import { Outlet } from "react-router-dom";
import Header from "../../../components/layouts/header/Header";

function AuthLayout() {
  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
}

export default AuthLayout;
