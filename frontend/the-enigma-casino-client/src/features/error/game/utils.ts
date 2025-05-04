import { getPlayerRect } from "./Player";
import { getObstacleRect } from "./Obstacle";

export function checkCollision(): boolean {
  const a = getPlayerRect();
  const b = getObstacleRect();

  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}


