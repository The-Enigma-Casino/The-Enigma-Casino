import Footer from "../components/layouts/footer/Footer";
import Header from "../components/layouts/header/Header";
import HeaderMobile from "../components/layouts/header/HeaderMobile";
import { NavigationInit } from "../features/games/shared/router/NavigationInit";
import { Outlet, useLocation } from "react-router-dom";
import { useMediaQuery } from "../utils/useMediaQuery";

function RootLayout() {
  const location = useLocation();
  const isGameRoute = location.pathname.includes("/game/");
  const isMobile = useMediaQuery("(max-width: 767px)");


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
    </>
  );
}

export default RootLayout;
