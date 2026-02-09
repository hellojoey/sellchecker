'use client';

import { type Verdict, getVerdictColor } from '@/lib/sellthrough';

interface GaugeProps {
  rate: number;
  verdict: Verdict;
  size?: number;
}

export default function SellThroughGauge({ rate, verdict, size = 200 }: GaugeProps) {
  const color = getVerdictColor(verdict);
  const radius = 80;
  const circumference = Math.PI * radius;
  const progress = (rate / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Rate text */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className="text-3xl font-bold"
          fill={color}
        >
          {rate.toFixed(1)}%
        </text>
        {/* Label */}
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          className="text-xs"
          fill="#9ca3af"
        >
          sell-through rate
        </text>
      </svg>
    </div>
  );
}
