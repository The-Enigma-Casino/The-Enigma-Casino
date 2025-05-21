import Footer from "../components/layouts/footer/Footer";
import Header from "../components/layouts/header/Header";
import HeaderMobile from "../components/layouts/header/HeaderMobile";
import { NavigationInit } from "../features/games/shared/router/NavigationInit";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "../utils/useMediaQuery";
import { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import { $token } from "../features/auth/store/authStore";
import AutoBanModal from "../features/autoBan/components/AutoBanModal";
import JoinGameModal from "../features/friends/modal/JoinGameModal";


function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useUnit($token);
  const isGameRoute = location.pathname.includes("/game/");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const flag = "__hasVisitedEnigma__";
    const isFirstVisit = !window.name.includes(flag);
    const isRoot = location.pathname === "/" || location.pathname === "";
    const isPublicEntry = ["/catalog", "/policies", "/auth", "/about"].some((path) =>
      location.pathname.startsWith(path)
    );

    if (!token && isFirstVisit && isRoot && !isPublicEntry) {
      window.name += ` ${flag}`;
      navigate("/landing", { replace: true });
      return;
    }

    setReady(true);
  }, [token, location.pathname, navigate]);

  if (!ready && (location.pathname === "/" || location.pathname === "")) {
    return null;
  }

  return (
    <>
      <NavigationInit />
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen w-full max-w-full overflow-x-clip">
        {!isGameRoute && (
          <div className="row-start-1 row-end-2">
            {isMobile ? <HeaderMobile /> : <Header />}
          </div>
        )}

        <main className="w-full max-w-full overflow-x-clip">
          <Outlet />
        </main>

        {!isGameRoute && (
          <div className="row-start-3 row-end-4">
            <Footer />
          </div>
        )}
      </div>
      <AutoBanModal />
      <JoinGameModal />
    </>
  );
}

export default RootLayout;
