import { GameCanvas } from "../components/GameCanvas";

function Error() {
  return (
    <div className="min-h-screen overflow-hidden bg-Background-Page text-white font-reddit flex flex-col items-center justify-start p-4">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mt-6 mb-10 tracking-wider text-center">
        ¡ERROR 404!
      </h1>
      <GameCanvas />
    </div>
  );
}

export default Error;
