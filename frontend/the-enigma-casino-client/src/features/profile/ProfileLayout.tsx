import { Outlet } from "react-router-dom";
import Header from "../../components/layouts/header/Header";
import JoinGameModal from "../friends/modal/JoinGameModal";

function ProfileLayout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <JoinGameModal />
    </div>
  );
}

export default ProfileLayout;
