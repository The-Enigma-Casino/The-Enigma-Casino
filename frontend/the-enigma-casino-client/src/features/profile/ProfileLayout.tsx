import { Outlet } from "react-router-dom";
import Header from "../../components/layouts/header/Header";
import JoinGameModal from "../friends/modal/JoinGameModal";
import HeaderMobile from "../../components/layouts/header/HeaderMobile";
import { useMediaQuery } from "../../utils/useMediaQuery";

function ProfileLayout() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div>
      <div>{isMobile ? <HeaderMobile /> : <Header />}</div>
      <main>
        <Outlet />
      </main>
      <JoinGameModal />
    </div>
  );
}

export default ProfileLayout;
