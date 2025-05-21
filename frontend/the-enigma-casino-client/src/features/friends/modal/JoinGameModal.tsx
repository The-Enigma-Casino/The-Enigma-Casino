import { useUnit } from "effector-react";
import Modal from "../../../components/ui/modal/Modal";
import { $isGameLoading, stopGameLoading } from "../stores";
import Button from "../../../components/ui/button/Button";
import { useEffect, useRef, useState } from "react";



const JoinGameModal = () => {
  const isOpenGame = useUnit($isGameLoading);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(() => {
    const stored = localStorage.getItem("gameSoundMuted");
    return stored === "true";
  });

  // Inicializar el audio una sola vez
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/waiting.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 1;
    }
  }, []);

  // Controlar reproducción en base a modal abierto
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = muted;

    if (isOpenGame) {
      // Solo reproducir si no está reproduciendo ya
      audio
        .play()
        .catch((err) => console.warn("No se pudo reproducir el audio:", err));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isOpenGame, muted]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem("gameSoundMuted", String(next));

    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  };

  return (
    <Modal isOpen={isOpenGame} onClose={stopGameLoading} size="smallPlus" position="center">
      <div className="relative flex flex-col items-center justify-center gap-4 text-white p-4">
        <button onClick={toggleMute} className="absolute top-0 left-0 hover:opacity-80 transition">
          <img
            src={muted ? "/svg/speaker-off.svg" : "/svg/speaker-on.svg"}
            alt={muted ? "Sonido desactivado" : "Sonido activado"}
            className="w-10 h-10"
          />
        </button>
        <img src="/svg/loading-spinner.svg" className="w-40 h-40" />
        <p className="text-3xl font-bold">Uniéndose a partida...</p>
        <Button
          variant="short"
          color="red"
          font="bold"
          onClick={() => { stopGameLoading(); }}
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};


export default JoinGameModal;
