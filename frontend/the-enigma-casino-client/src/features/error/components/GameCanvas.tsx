import { useEffect, useRef, useState } from "react";
import { useGameLoop } from "../hooks/useGameLoop";
import {
  initPlayer,
  updatePlayer,
  drawPlayer,
  resetPlayer,
  jump,
} from "../game/Player";
import {
  initObstacle,
  updateObstacle,
  drawObstacle,
  resetObstacle,
  isTreasureObstacle,
} from "../game/Obstacle";
import { checkCollision } from "../game/utils";
import { GAME_WIDTH, GAME_HEIGHT } from "../game/constants";
import { GameButton } from "./GameButton";

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [bestScore, setBestScore] = useState(0);
  const [achievedHighScore, setAchievedHighScore] = useState(false);
  const [deathMessage, setDeathMessage] = useState("");
  const [scoreRank, setScoreRank] = useState("");

  const lossMessages = [
    "💥 Te estampaste como un trébol distraído.",
    "🧱 El muro fue más rápido que tus reflejos.",
    "🌪️ El viento se llevó tu suerte.",
    "💀 RIP Leprechaun 2025 - 2025.",
    "🚧 Te olvidaste de mirar a ambos lados.",
    "💍 Es mío, solo mío... mi tesoro.",
    "💨 Te volaste como un trébol en el viento.",
    "🪙 Por poco pillas la olla de oro... por poco.",
    "🍀 El trébol dorado se escapó de tus manos.",
    "🪙 El oro se escurrió entre tus dedos.",
    "🍀 Eso tuvo que doler.",
    "💀 Tu partida fue un Dark Souls sin rodar.",
    "⭐ Sentiste un gran disturbio en la Fuerza.",
    "🧟 Tu suerte murió más rápido que un aldeano en Minecraft.",
    "🚗 Esquivar no es lo tuyo, ¿verdad, Toretto?",
    "💡 Fue un plan brillante... hasta que saltaste.",
    "🕷️ Tu sentido arácnido no funcionó a tiempo.",
    "🧙‍♂️ El hechizo del trébol no fue suficiente.",
    "🧚‍♂️ El hada de la suerte no estaba de tu lado.",
    "🎩 No eres un mago, Harry.",
    "🧢 Ah sh*t, here we go again...",
  ];

  const scoreRanks = [
    { score: 0, label: "Corredor sin suerte" },
    { score: 100, label: "Cazador de tréboles" },
    { score: 200, label: "Saltador de tréboles" },
    { score: 300, label: "Corredor de arcoíris" },
    { score: 400, label: "Esquivador profesional" },
    { score: 500, label: "Maestro del trébol" },
    { score: 600, label: "Leyenda del trébol dorado" },
    { score: 700, label: "Leprechaun invencible" },
    { score: 800, label: "Semidiós del 404" },
    { score: 900, label: "Leyenda del oro perdido" },
    { score: 1000, label: "Dios Inmortal del trébol" },
  ];

  const { start, stop } = useGameLoop({
    update: () => {
      updatePlayer();
      updateObstacle(scoreRef.current);

      scoreRef.current += 1;
      const displayedScore = Math.floor(scoreRef.current / 10);
      setScore(displayedScore);

      if (checkCollision()) {
        stop();

        if (isTreasureObstacle()) {
          setVictory(true);
          setHasStarted(false);
          return;
        }

        setGameOver(true);
        if (displayedScore > bestScore) {
          setBestScore(displayedScore);
        }

        const random = Math.floor(Math.random() * lossMessages.length);
        setDeathMessage(lossMessages[random]);

        const matchedRank = scoreRanks
          .slice()
          .reverse()
          .find((r) => displayedScore >= r.score);
        setScoreRank(matchedRank?.label || "");

        setAchievedHighScore(displayedScore >= 500);
      }
    },
    draw: (ctx) => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      drawPlayer(ctx);
      drawObstacle(ctx);
    },
    canvasRef,
  });

  const handleStart = () => {
    setGameOver(false);
    setVictory(false);
    setHasStarted(true);
    scoreRef.current = 0;
    setScore(0);
    setAchievedHighScore(false);
    setDeathMessage("");
    setScoreRank("");
    resetPlayer();
    resetObstacle();
    start();
  };

  useEffect(() => {
    initPlayer();
    initObstacle();
  }, []);

  return (
    <div className="flex flex-col items-center justify-start py-10 px-4 bg-Background-Page text-white font-reddit w-full max-w-3xl min-h-[560px]">
      <p className="text-2xl md:text-3xl font-semibold mb-2">
        Puntuación:{" "}
        <span className="font-extrabold text-Green-lines">{score}</span>
      </p>
      <p className="text-lg md:text-xl font-medium mb-6">
        Récord: <span className="font-bold text-Coins">{bestScore}</span>
      </p>

      <div className="w-full max-w-[100%] md:w-auto overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border border-white bg-black w-full h-auto"
        />
      </div>

      {(!hasStarted || gameOver || victory) && (
        <div className="mt-6">
          <GameButton
            onAction={handleStart}
            color="green"
            label={hasStarted ? "Reintentar" : "Jugar"}
          />
        </div>
      )}

{hasStarted && !gameOver && !victory && (
  <div className="block md:hidden mt-6">
    <GameButton
      onAction={jump}
      color="green"
      label="SALTAR"
    />
  </div>
)}

      {victory && (
        <div className="mt-8 text-center max-w-xl">
          <p className="text-yellow-300 text-2xl md:text-3xl font-extrabold mb-4">
            🏆 ¡Encontraste el tesoro escondido!
          </p>
          <p className="text-Green-lines text-xl md:text-2xl font-bold animate-pulseGlow">
            🪙 ¡El caldero de oro es tuyo, campeón del 404!
          </p>
          {/* futuro gif 😺 */}
        </div>
      )}

      {gameOver && (
        <div className="mt-8 text-center max-w-xl transition-opacity duration-300">
          {deathMessage && (
            <p className="text-red-400 font-bold text-xl md:text-2xl mb-3">
              {deathMessage}
            </p>
          )}
          {scoreRank && (
            <p className="text-Coins font-extrabold text-xl md:text-2xl mb-3">
              🏅 Título: {scoreRank}
            </p>
          )}
          {achievedHighScore && (
            <p className="text-green-400 font-bold text-xl md:text-2xl animate-pulseGlow">
              🎉 ¡Felicidades! Has llegado muy lejos. El trébol dorado casi fue
              tuyo ☘️✨
            </p>
          )}
        </div>
      )}
    </div>
  );
};
