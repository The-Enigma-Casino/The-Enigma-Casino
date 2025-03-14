import SidebarMenu from "../../../components/layouts/sidebarMenu/SidebarMenu";
import GamePanel from "../components/layouts/GamePanel";
import Carousel from "../components/ui/Carousel";
import classes from "./Home.module.css"; // Importamos los estilos en CSS puro

function Home() {
  return (
    <div className={classes.homeContainer}>
      <SidebarMenu />
      <section className={classes.homeSection}>
        <Carousel />
        <GamePanel />
      </section>
    </div>
  );
}

export default Home;
