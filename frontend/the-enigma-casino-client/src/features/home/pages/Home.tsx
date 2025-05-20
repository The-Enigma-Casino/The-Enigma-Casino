import SidebarMenu from "../../../components/layouts/sidebarMenu/SidebarMenu";
import GamePanel from "../components/layouts/GamePanel";
import Carousel from "../components/ui/Carousel";
import Winners from "../components/ui/Winners";

function Home() {
  return (
    <div className="flex h-screen w-full max-w-full overflow-x-clip bg-Background-Page">
      <div className="hidden md:block w-[280px] shrink-0">
        <SidebarMenu />
      </div>

      <section className="flex flex-col items-center gap-8 w-full">
        <Carousel />
        <Winners />
        <GamePanel />
      </section>
    </div>
  );
}

export default Home;
