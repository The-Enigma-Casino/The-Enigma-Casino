import classes from "./Carousel.module.css";
import CarouselPack from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Link } from "react-router-dom";

function Carousel() {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
      partialVisibilityGutter: 20,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
      partialVisibilityGutter: 20,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      partialVisibilityGutter: 20,
    },
  }

  return (
    <div className={classes.carrouselContainer}>
      <CarouselPack
        className={classes.carrousel}
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={5000}
        showDots={true}
        arrows={false}
      >
        <Link to={`/`}>
          <img className={classes.bannerImg} src="/img/home-banner.webp" alt="Home" />
        </Link>
        <Link to={`/`} >
          <img
            className={classes.bannerImg}
            src="/img/game-banner.webp"
            alt="Games"
          />
        </Link>
        <Link to={`/catalog`}>
          <img className={classes.bannerImg} src="/img/paymenth-banner.webp" alt="Paymenth" />
        </Link>
      </CarouselPack>
    </div>

  );
}

export default Carousel;
