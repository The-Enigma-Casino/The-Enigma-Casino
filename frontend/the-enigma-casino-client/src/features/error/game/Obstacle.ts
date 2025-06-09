import { GAME_WIDTH, GAME_HEIGHT, OBSTACLE } from "./constants";

let x = GAME_WIDTH;
let speed = OBSTACLE.speed;
let treasure = false;

const treasureImg = new Image();
treasureImg.src = "/img/treasure.webp";

const cloverImg = new Image();
cloverImg.src = "/img/clover.webp";

export function initObstacle() {
  x = GAME_WIDTH + 100;
  speed = OBSTACLE.speed;
  treasure = false;
}

export function updateObstacle(score: number) {
  const difficultyMultiplier = Math.min(1 + score / 8000, 1.8);
  x -= speed * difficultyMultiplier;

  if (x + OBSTACLE.width < 0) {
    treasure = Math.floor(score / 10) >= 1000 && Math.random() < 0.2;
    x = GAME_WIDTH + Math.random() * 200;
  }
}

export function drawObstacle(ctx: CanvasRenderingContext2D) {
  if (treasure) {
    ctx.drawImage(treasureImg, x, GAME_HEIGHT - 50, 50, 50);
  } else {
    ctx.drawImage(cloverImg, x, GAME_HEIGHT - 48, 51, 48);
  }
}

export function getObstacleRect() {
  const hitboxPaddingX = treasure ? 0 : 10;
  const width = treasure ? OBSTACLE.width : 51 - hitboxPaddingX * 2;
  const height = treasure ? OBSTACLE.height : 48;

  return {
    x: treasure ? x : x + hitboxPaddingX,
    y: GAME_HEIGHT - height,
    w: width,
    h: height,
  };
}

export function resetObstacle() {
  x = GAME_WIDTH + 100;
  treasure = false;
}

export function isTreasureObstacle() {
  return treasure;
}
