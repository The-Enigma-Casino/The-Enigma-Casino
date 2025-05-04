import { useEffect, useRef, RefObject, useCallback } from "react";

interface GameLoopOptions {
  update: (delta: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export const useGameLoop = ({ update, draw, canvasRef }: GameLoopOptions) => {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number | undefined>(undefined); // ✅ ahora acepta undefined
  const isRunningRef = useRef(false);

  const start = useCallback(() => {
    const loop = (time: number) => {
      if (!previousTimeRef.current) previousTimeRef.current = time;
      const delta = time - previousTimeRef.current;
      previousTimeRef.current = time;

      update(delta);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) draw(ctx);

      if (isRunningRef.current) {
        requestRef.current = requestAnimationFrame(loop);
      }
    };

    if (!isRunningRef.current) {
      isRunningRef.current = true;
      previousTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(loop);
    }
  }, [update, draw, canvasRef]); // ✅ dependencias correctas

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => stop, [stop]); // ✅ incluye stop en dependencias

  return { start, stop, isRunning: isRunningRef };
};
