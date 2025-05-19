import Header from "../../../components/layouts/header/Header";
import HeaderMobile from "../../../components/layouts/header/HeaderMobile";
import { useMediaQuery } from "../../../utils/useMediaQuery";
import { GameCanvas } from "../components/GameCanvas";

function Error() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div className="min-h-screen overflow-hidden bg-Background-Page">
      <div className="row-start-1 row-end-2">
        {isMobile ? <HeaderMobile /> : <Header />}
      </div>
      <div className=" text-white font-reddit flex flex-col items-center justify-start p-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mt-6 mb-10 tracking-wider text-center">
          ¡ERROR 404!
        </h1>
        <GameCanvas />
      </div>
    </div>
  );
}

export default Error;
