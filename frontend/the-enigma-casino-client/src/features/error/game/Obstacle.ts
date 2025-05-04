import { GAME_WIDTH, GAME_HEIGHT, OBSTACLE } from "./constants";

let x = GAME_WIDTH;
let speed = OBSTACLE.speed;
let treasure = false;

export function initObstacle() {
  x = GAME_WIDTH + 100;
  speed = OBSTACLE.speed;
  treasure = false;
}

export function updateObstacle(score: number) {
  const difficultyMultiplier = Math.min(1 + score / 1800, 1.75);
  x -= speed * difficultyMultiplier;

  if (x + OBSTACLE.width < 0) {
    treasure = Math.floor(score / 10) >= 1000 && Math.random() < 0.2;
    x = GAME_WIDTH + Math.random() * 200;
  }
}

export function drawObstacle(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = treasure ? "#ffdf31" : "red";
  ctx.fillRect(x, GAME_HEIGHT - OBSTACLE.height, OBSTACLE.width, OBSTACLE.height);
}

export function getObstacleRect() {
  return {
    x,
    y: GAME_HEIGHT - OBSTACLE.height,
    w: OBSTACLE.width,
    h: OBSTACLE.height,
  };
}

export function resetObstacle() {
  x = GAME_WIDTH + 100;
  treasure = false;
}

export function isTreasureObstacle() {
  return treasure;
}
