import Footer from "../components/layouts/footer/Footer";
import Header from "../components/layouts/header/Header";
import HeaderMobile from "../components/layouts/header/HeaderMobile";
import { NavigationInit } from "../features/games/shared/router/NavigationInit";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "../utils/useMediaQuery";
import { useEffect } from "react";
import { useUnit } from "effector-react";
import { $token } from "../features/auth/store/authStore";

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useUnit($token);
  const isGameRoute = location.pathname.includes("/game/");
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    const flag = "__hasVisitedEnigma__";

    const isLandingOrAuth = location.pathname.startsWith("/landing") || location.pathname.startsWith("/auth");

    if (!token && !window.name.includes(flag) && !isLandingOrAuth) {
      window.name += ` ${flag}`;
      navigate("/landing");
    }
  }, [token, location.pathname, navigate]);

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
