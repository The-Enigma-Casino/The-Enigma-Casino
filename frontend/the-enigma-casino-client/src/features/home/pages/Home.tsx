import SidebarMenu from "../../../components/layouts/sidebarMenu/SidebarMenu";
import GamePanel from "../components/layouts/GamePanel";
import Carousel from "../components/ui/Carousel";
import Winners from "../components/ui/Winners";
import classes from "./Home.module.css"; // Importamos los estilos en CSS puro
import { FriendsModal } from "../../friends/modal/FriendsModal";
import { useState } from "react";

function Home() {
  const [showFriends, setShowFriends] = useState(false);

  return (
    <div className={classes.homeContainer}>
      <SidebarMenu onOpenFriendsModal={() => setShowFriends(true)} />

      <section className={classes.homeSection}>
        <Carousel />
        <Winners />
        <GamePanel />
      </section>

      {showFriends && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
          onClick={() => setShowFriends(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center px-4">
            <FriendsModal onClose={() => setShowFriends(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
