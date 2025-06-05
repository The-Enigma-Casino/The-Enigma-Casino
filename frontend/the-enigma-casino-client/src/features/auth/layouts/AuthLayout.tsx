import { Outlet } from "react-router-dom";
import Header from "../../../components/layouts/header/Header";
import { useEffect } from "react";
import { useMediaQuery } from "../../../utils/useMediaQuery";
import HeaderMobile from "../../../components/layouts/header/HeaderMobile";

function AuthLayout() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    const flag = "__hasVisitedEnigma__";
    if (!window.name.includes(flag)) {
      window.name += ` ${flag}`;
    }
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden grid grid-rows-[auto_1fr]">
      <div className="row-start-1 row-end-2 shrink-0">
        {isMobile ? <HeaderMobile /> : <Header />}
      </div>
      <main className="row-start-2 row-end-3 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
