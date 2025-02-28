import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../../components/layouts/header/Header";

function AuthLayout() {
  useEffect(() => {
    const updateOverflow = () => {
      if (window.innerWidth > 768) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    };

    updateOverflow();
    window.addEventListener("resize", updateOverflow);

    return () => {
      window.removeEventListener("resize", updateOverflow);
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
