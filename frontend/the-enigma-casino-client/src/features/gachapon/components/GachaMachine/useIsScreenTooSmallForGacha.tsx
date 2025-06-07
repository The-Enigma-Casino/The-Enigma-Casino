import { useEffect, useState } from "react";

export function useIsScreenTooSmallForGacha(): boolean {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isLandscape = w > h;
      const shortestSide = Math.min(w, h);

      // Verifica si es móvil o tableta pequeña
      const isLikelyMobile =
        navigator.userAgent.match(/Android|iPhone|iPad|iPod/i) !== null;

      // Bloqueamos solo si es móvil Y en horizontal Y el lado corto es pequeño
      setIsBlocked(isLikelyMobile && isLandscape && shortestSide <= 680);
    };

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  return isBlocked;
}
