import { Outlet } from "react-router-dom";
import Header from "../../../components/layouts/header/Header";

function AuthLayout() {
  return (
    <main className="containerMain">
      <Header />
      <section className="content">
        <Outlet />
      </section>
    </main>
  );
}

export default AuthLayout;
