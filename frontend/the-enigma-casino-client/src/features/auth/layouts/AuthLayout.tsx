import { Outlet, useLocation } from "react-router-dom";
import Header from "../../../components/layouts/header/Header";
import { useEffect } from "react";
import { useMediaQuery } from "../../../utils/useMediaQuery";
import HeaderMobile from "../../../components/layouts/header/HeaderMobile";

function AuthLayout() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const location = useLocation();
  const isConfirmationPage = location.pathname.includes(
    "/auth/email-confirmation"
  );
const isAuthPage = location.pathname === "/auth/login" || location.pathname === "/auth/register";

  useEffect(() => {
    const flag = "__hasVisitedEnigma__";
    if (!window.name.includes(flag)) {
      window.name += ` ${flag}`;
    }
  }, []);

return (
  <div
    className={`h-screen w-full grid grid-rows-[auto_1fr] ${
      (isConfirmationPage || (!isMobile && isAuthPage)) ? "overflow-hidden" : ""
    }`}
  >
    <div className="row-start-1 row-end-2 shrink-0">
      {isMobile ? <HeaderMobile /> : <Header />}
    </div>
    <main
      className={`row-start-2 row-end-3 ${
        (isConfirmationPage || (!isMobile && isAuthPage)) ? "overflow-hidden" : ""
      }`}
    >
      <Outlet />
    </main>
  </div>
);
}

export default AuthLayout;
