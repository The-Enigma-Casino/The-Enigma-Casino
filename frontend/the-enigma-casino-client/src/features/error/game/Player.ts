import { PLAYER } from "./constants";

let y = PLAYER.ground;
let vy = 0;
let isJumping = false;

const duende = new Image();
const duendeJump = new Image();
duende.src = "/img/elf.webp";
duendeJump.src = "/img/jumping-elf.webp";

export function initPlayer() {
  y = PLAYER.ground;
  vy = 0;
  isJumping = false;

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (!isJumping) {
        vy = -PLAYER.jumpStrength;
        isJumping = true;
      }
    }
  });

  window.addEventListener("touchstart", () => {
    if (!isJumping) {
      vy = -PLAYER.jumpStrength;
      isJumping = true;
    }
  });
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
  const image = isJumping ? duendeJump : duende;
  ctx.drawImage(image, PLAYER.x, y, PLAYER.width, PLAYER.height);
}

export function getPlayerRect() {
  return {
    x: PLAYER.x,
    y,
    w: PLAYER.width,
    h: PLAYER.height,
  };
}

export function resetPlayer() {
  y = PLAYER.ground;
  vy = 0;
  isJumping = false;
}

export function jump() {
  if (!isJumping) {
    vy = -PLAYER.jumpStrength;
    isJumping = true;
  }
}
