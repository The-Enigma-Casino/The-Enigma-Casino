import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../../components/layouts/header/Header";

function AuthLayout() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
}

export default AuthLayout;
