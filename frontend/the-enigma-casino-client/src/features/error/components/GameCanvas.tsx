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
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, LOSS_MESSAGES, SCORE_RANKS } from "../game/constants";
import { GameButton } from "./GameButton";

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rainbowRef = useRef<HTMLImageElement | null>(null);
  const duendeRef = useRef<HTMLImageElement | null>(null);

  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [bestScore, setBestScore] = useState(0);
  const [achievedHighScore, setAchievedHighScore] = useState(false);
  const [deathMessage, setDeathMessage] = useState("");
  const [scoreRank, setScoreRank] = useState("");

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#B5F3F5";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const rainbow = rainbowRef.current;
    if (rainbow) {
      ctx.drawImage(
        rainbow,
        GAME_WIDTH / 2 - 150,
        GAME_HEIGHT - 130,
        300,
        100
      );
    }

    ctx.fillStyle = "#7A9965";
    ctx.fillRect(0, GAME_HEIGHT - 30, GAME_WIDTH, 30);
  };

  const drawInitialScene = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    drawBackground(ctx);

    const duende = duendeRef.current;
    if (duende) {
      ctx.drawImage(
        duende,
        PLAYER.x,
        GAME_HEIGHT - PLAYER.height,
        PLAYER.width,
        PLAYER.height
      );
    }
  };

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

        const random = Math.floor(Math.random() * LOSS_MESSAGES.length);
        setDeathMessage(LOSS_MESSAGES[random]);

        const matchedRank = SCORE_RANKS
          .slice()
          .reverse()
          .find((r) => displayedScore >= r.score);
        setScoreRank(matchedRank?.label || "");

        setAchievedHighScore(displayedScore >= 500);
      }
    },
    draw: (ctx) => {
      drawBackground(ctx);
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

    const rainbowImg = new Image();
    rainbowImg.src = "/img/rainbow.webp";
    rainbowImg.onload = () => {
      rainbowRef.current = rainbowImg;
      drawInitialScene();
    };

    const duendeImg = new Image();
    duendeImg.src = "/img/elf.webp";
    duendeImg.onload = () => {
      duendeRef.current = duendeImg;
      drawInitialScene();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-start py-10 px-4 bg-Background-Page text-white font-reddit w-full max-w-3xl min-h-[560px]">
      <p className="text-2xl md:text-3xl font-semibold mb-2">
        Puntuación: <span className="font-extrabold text-Green-lines">{score}</span>
      </p>
      <p className="text-lg md:text-xl font-medium mb-6">
        Récord: <span className="font-bold text-Coins">{bestScore}</span>
      </p>

      <div className="w-full max-w-[100%] md:w-auto overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border border-Green-lines w-full h-auto"
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
        </div>
      )}

      {gameOver && (
        <div className="mt-8 text-center max-w-xl transition-opacity duration-300">
          {deathMessage && (
            <p className="text-red-400 font-bold text-xl md:text-2xl mb-3">{deathMessage}</p>
          )}
          {scoreRank && (
            <p className="text-Coins font-extrabold text-xl md:text-2xl mb-3">
              🏅 Título: {scoreRank}
            </p>
          )}
          {achievedHighScore && (
            <p className="text-green-400 font-bold text-xl md:text-2xl animate-pulseGlow">
              🎉 ¡Felicidades! Has llegado muy lejos. El trébol dorado casi fue tuyo ☘️✨
            </p>
          )}
        </div>
      )}
    </div>
  );
};
