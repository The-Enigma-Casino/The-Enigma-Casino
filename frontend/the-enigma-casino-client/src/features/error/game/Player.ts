import { PLAYER } from "./constants";

let y = PLAYER.ground;
let vy = 0;
let isJumping = false;

export function initPlayer() {
  y = PLAYER.ground;
  vy = 0;
  isJumping = false;

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      jump();
    }
  });
}

export function jump() {
  if (!isJumping) {
    vy = -PLAYER.jumpStrength;
    isJumping = true;
  }
}

export function updatePlayer() {
  y += vy;
  vy += PLAYER.gravity;

  if (y >= PLAYER.ground) {
    y = PLAYER.ground;
    vy = 0;
    isJumping = false;
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "lime";
  ctx.fillRect(PLAYER.x, y, PLAYER.width, PLAYER.height);
}

export function getPlayerRect() {
  return { x: PLAYER.x, y, w: PLAYER.width, h: PLAYER.height };
}

export function resetPlayer() {
  y = PLAYER.ground;
  vy = 0;
  isJumping = false;
}
