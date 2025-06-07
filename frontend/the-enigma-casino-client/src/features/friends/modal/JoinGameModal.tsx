import { useUnit } from "effector-react";
import Modal from "../../../components/ui/modal/Modal";
import { $isGameLoading, stopGameLoading } from "../stores";
import Button from "../../../components/ui/button/Button";
import { useEffect, useRef, useState } from "react";
import {
  clearJoinProtection,
  sendLeaveTableMessage,
} from "../../gameTables/store/tablesIndex";

const JoinGameModal = () => {
  const isOpenGame = useUnit($isGameLoading);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(() => {
    const stored = localStorage.getItem("gameSoundMuted");
    return stored === "true";
  });

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/music/waiting.mp3");
      audioRef.current.loop = true;
    }

    audioRef.current.muted = muted;

    if (isOpenGame) {
      audioRef.current
        .play()
        .catch((err) => console.warn("No se pudo reproducir el audio:", err));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [isOpenGame, muted]);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem("gameSoundMuted", String(next));
      return next;
    });
  };

  return (
    <Modal
      isOpen={isOpenGame}
      onClose={stopGameLoading}
      size="smallPlus"
      position="center"
    >
      <div className="relative flex flex-col items-center justify-center gap-4 text-white p-4">
        <button
          onClick={toggleMute}
          className="absolute top-0 left-0 hover:opacity-80 transition"
        >
          <img
            src={muted ? "/svg/speaker-off.svg" : "/svg/speaker-on.svg"}
            alt={muted ? "Sonido desactivado" : "Sonido activado"}
            className="w-10 h-10"
          />
        </button>
        <img src="/svg/loading-spinner.svg" className="w-40 h-40" />
        <p className="text-3xl font-bold">Uniendose a partida...</p>
        <Button
          variant="short"
          color="red"
          font="bold"
          onClick={() => {
            console.log("🛑 Botón CANCELAR pulsado");
            setMuted(false);
            clearJoinProtection();
            stopGameLoading();
            sendLeaveTableMessage();
          }}
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};

export default JoinGameModal;
