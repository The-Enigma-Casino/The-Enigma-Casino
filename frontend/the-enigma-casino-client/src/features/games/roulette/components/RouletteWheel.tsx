// RouletteWheel.tsx
import { useEffect, useRef, useState } from "react";

interface RouletteWheelProps {
  resultNumber: number; // número donde debe caer la bola
}

const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6,
  27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16,
  33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28,
  12, 35, 3, 26,
];

const sectorAngle = 360 / numbers.length;

export default function RouletteWheel({ resultNumber }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const wheelRef = useRef<SVGSVGElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);

  const spinTo = (number: number) => {
    const index = numbers.indexOf(number);
    if (index === -1) return;

    const randomOffset = Math.random() * sectorAngle;
    const spinRounds = 5;
    const targetRotation = 360 * spinRounds + (360 - index * sectorAngle - randomOffset);

    setRotation(targetRotation);
    setBallAngle(index * sectorAngle + randomOffset);
  };

  useEffect(() => {
    spinTo(resultNumber);
  }, [resultNumber]);

  return (
    <div className="flex flex-col items-center justify-center p-10">
      <svg
        ref={wheelRef}
        width={400}
        height={400}
        viewBox="0 0 400 400"
        className="transition-all duration-[4000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <circle cx="200" cy="200" r="190" fill="#0b6623" />

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
        className="absolute"
        width={400}
        height={400}
        viewBox="0 0 400 400"
      >
        <circle
          ref={ballRef}
          cx={200 + 160 * Math.cos((Math.PI * ballAngle) / 180)}
          cy={200 + 160 * Math.sin((Math.PI * ballAngle) / 180)}
          r={10}
          fill="#f5f5f5"
          className="transition-all duration-[4000ms] ease-out"
        />
      </svg>
    </div>
  );
}
