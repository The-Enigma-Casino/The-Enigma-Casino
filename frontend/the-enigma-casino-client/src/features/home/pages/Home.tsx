import SidebarMenu from "../../../components/layouts/sidebarMenu/SidebarMenu";
import GamePanel from "../components/layouts/GamePanel";
import Carousel from "../components/ui/Carousel";
import classes from "./Home.module.css"; // Importamos los estilos en CSS puro

function Home() {
  return (
    <div className={classes.homeContainer}>
      <SidebarMenu />
      <section className={classes.homeSeption}>
      <Carousel />
      <h1>Hola mundo</h1>
      <GamePanel />
      </section>

    </div>
  );
}

export default Home;
