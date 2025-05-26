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
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen w-full max-w-full overflow-x-clip">
      <div className="row-start-1 row-end-2">
        {isMobile ? <HeaderMobile /> : <Header />}
      </div>
      <main className="w-full max-w-full h-full min-h-0 overflow-x-clip">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
