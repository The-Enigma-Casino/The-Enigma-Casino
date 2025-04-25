import { useEffect, useRef, useState } from "react";

interface Props {
  winningNumber: number;
}

const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6,
  27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16,
  33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28,
  12, 35, 3, 26,
];

const sectorAngle = 360 / numbers.length;

export default function RouletteWheel({ winningNumber }: Props) {
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);

  const requestRef = useRef<number>(0);
  const animationStart = useRef<number>(0);

  useEffect(() => {
    const index = numbers.indexOf(winningNumber);
    if (index === -1) return;

    const totalSpins = 6;
    const targetAngle = index * sectorAngle;
    const duration = 6000;

    const wheelStart = wheelRotation % 360;
    const ballStart = ballRotation % 360;

    animationStart.current = performance.now();

    const animate = (time: number) => {
      const elapsed = time - animationStart.current!;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // ease-out

      const newWheelRotation = wheelStart + ease * (360 * totalSpins + targetAngle);
      const newBallRotation = ballStart - ease * (360 * (totalSpins + 2) + targetAngle);

      setWheelRotation(newWheelRotation);
      setBallRotation(newBallRotation);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [winningNumber]);

  return (
    <div className="relative flex items-center justify-center w-[400px] h-[400px]">
      <svg
        width={400}
        height={400}
        viewBox="0 0 400 400"
        style={{ transform: `rotate(${wheelRotation}deg)` }}
        className="transition-transform duration-[6000ms] ease-out"
      >
        <circle cx="200" cy="200" r="190" fill="#0b6623" stroke="#FFD700" strokeWidth="5" />

        {numbers.map((num, i) => {
          const startAngle = i * sectorAngle;
          const endAngle = startAngle + sectorAngle;
          const largeArc = endAngle - startAngle > 180 ? 1 : 0;
          const x1 = 200 + 190 * Math.cos((Math.PI * startAngle) / 180);
          const y1 = 200 + 190 * Math.sin((Math.PI * startAngle) / 180);
          const x2 = 200 + 190 * Math.cos((Math.PI * endAngle) / 180);
          const y2 = 200 + 190 * Math.sin((Math.PI * endAngle) / 180);
          const color = num === 0 ? "green" : i % 2 === 0 ? "black" : "red";

          return (
            <path
              key={i}
              d={`M200,200 L${x1},${y1} A190,190 0 ${largeArc} 1 ${x2},${y2} Z`}
              fill={color}
              stroke="white"
              strokeWidth={1}
            />
          );
        })}

        {numbers.map((num, i) => {
          const angle = i * sectorAngle + sectorAngle / 2;
          const x = 200 + 150 * Math.cos((Math.PI * angle) / 180);
          const y = 200 + 150 * Math.sin((Math.PI * angle) / 180);
          return (
            <text
              key={"label-" + i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="14"
              transform={`rotate(${angle}, ${x}, ${y})`}
            >
              {num}
            </text>
          );
        })}
      </svg>

      <svg
        className="absolute pointer-events-none"
        width={400}
        height={400}
        viewBox="0 0 400 400"
      >
        <circle
          cx={200 + 160 * Math.cos((Math.PI * ballRotation) / 180)}
          cy={200 + 160 * Math.sin((Math.PI * ballRotation) / 180)}
          r={8}
          fill="white"
        />
      </svg>
    </div>
  );
}
