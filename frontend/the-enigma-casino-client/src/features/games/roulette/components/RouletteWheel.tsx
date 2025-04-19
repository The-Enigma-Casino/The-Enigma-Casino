import { useEffect, useState } from "react";

interface CasinoRouletteProps {
  resultNumber: number;
}

const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6,
  27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16,
  33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28,
  12, 35, 3, 26,
];

const sectorAngle = 360 / numbers.length;

export default function CasinoRoulette({ resultNumber }: CasinoRouletteProps) {
  const [rotation, setRotation] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);

  const spinTo = (number: number) => {
    const index = numbers.indexOf(number);
    if (index === -1) return;

    const randomOffset = Math.random() * sectorAngle;
    const spinRounds = 8;
    const finalAngle = 360 - index * sectorAngle - randomOffset;

    setRotation(360 * spinRounds + finalAngle);
    setBallAngle(index * sectorAngle + randomOffset);
  };

  useEffect(() => {
    if (resultNumber !== null) {
      const timeout = setTimeout(() => {
        spinTo(resultNumber);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [resultNumber]);

  return (
    <div className="relative w-[400px] h-[400px]">
      <svg
        viewBox="0 0 400 400"
        className="transition-transform duration-[4000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <circle cx="200" cy="200" r="190" fill="#8b4513" stroke="#daa520" strokeWidth="10" />

        {numbers.map((num, i) => {
          const start = i * sectorAngle;
          const end = start + sectorAngle;
          const largeArc = end - start > 180 ? 1 : 0;
          const x1 = 200 + 190 * Math.cos((Math.PI * start) / 180);
          const y1 = 200 + 190 * Math.sin((Math.PI * start) / 180);
          const x2 = 200 + 190 * Math.cos((Math.PI * end) / 180);
          const y2 = 200 + 190 * Math.sin((Math.PI * end) / 180);

          const fillColor =
            num === 0 ? "#0f0" : i % 2 === 0 ? "#000" : "#c00";
          const textColor = num === 0 ? "#000" : "#fff";

          return (
            <g key={i}>
              <path
                d={`M200,200 L${x1},${y1} A190,190 0 ${largeArc} 1 ${x2},${y2} Z`}
                fill={fillColor}
                stroke="white"
                strokeWidth="1"
              />
              <text
                x={200 + 160 * Math.cos((Math.PI * (start + sectorAngle / 2)) / 180)}
                y={200 + 160 * Math.sin((Math.PI * (start + sectorAngle / 2)) / 180)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontSize="14"
                transform={`rotate(${start + sectorAngle / 2}, ${200 + 160 * Math.cos((Math.PI * (start + sectorAngle / 2)) / 180)}, ${200 + 160 * Math.sin((Math.PI * (start + sectorAngle / 2)) / 180)})`}
              >
                {num}
              </text>
            </g>
          );
        })}


        <circle cx="200" cy="200" r="30" fill="#999" />
        <circle cx="200" cy="200" r="15" fill="#ccc" />
      </svg>

      <svg className="absolute top-0 left-0" viewBox="0 0 400 400">
        <circle
          cx={200 + 160 * Math.cos((Math.PI * ballAngle) / 180)}
          cy={200 + 160 * Math.sin((Math.PI * ballAngle) / 180)}
          r="8"
          fill="#fff"
          className="transition-all duration-[4000ms] ease-out"
        />
      </svg>
    </div>
  );
}
