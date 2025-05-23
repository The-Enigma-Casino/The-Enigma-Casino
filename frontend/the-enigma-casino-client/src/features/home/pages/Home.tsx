import SidebarMenu from "../../../components/layouts/sidebarMenu/SidebarMenu";
import GamePanel from "../components/layouts/GamePanel";
import Carousel from "../components/ui/Carousel";
import Winners from "../components/ui/Winners";
import { FriendsModal } from "../../friends/modal/FriendsModal";
import { useState } from "react";

function Home() {
  const [showFriends, setShowFriends] = useState(false);

  return (
    <div className="flex grow h-full w-full max-w-full overflow-x-clip bg-Background-Page">
      <div className="hidden md:flex flex-col w-[280px] shrink-0 h-full">
        <SidebarMenu onOpenFriendsModal={() => setShowFriends(true)} />
      </div>

<section className="flex flex-col items-center gap-8 w-full grow pb-12">
        <Carousel />
        <Winners />
        <GamePanel />
      </section>

      {showFriends && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
          onClick={() => setShowFriends(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex justify-center px-4"
          >
            <FriendsModal onClose={() => setShowFriends(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
