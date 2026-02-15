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
  const clampedRate = Math.min(rate, 100);
  const progress = (clampedRate / 100) * circumference;
  const center = size / 2;

  // Zone boundaries as fractions of the semicircle
  const passEnd = 0.25;     // 0-25% = PASS zone
  const maybeEnd = 0.50;    // 25-50% = MAYBE zone
  const buyEnd = 0.75;      // 50-75% = BUY zone
  // 75-100% = STRONG BUY zone

  const passArc = passEnd * circumference;
  const maybeArc = (maybeEnd - passEnd) * circumference;
  const buyArc = (buyEnd - maybeEnd) * circumference;
  const strongBuyArc = (1 - buyEnd) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Zone background arcs */}
        {/* PASS zone: 0-25% (light red) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#fecaca"
          strokeWidth="16"
          strokeDasharray={`${passArc} ${circumference}`}
        />
        {/* MAYBE zone: 25-50% (light yellow) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#fef3c7"
          strokeWidth="16"
          strokeDasharray={`0 ${passArc} ${maybeArc} ${circumference}`}
        />
        {/* BUY zone: 50-75% (light green) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#dcfce7"
          strokeWidth="16"
          strokeDasharray={`0 ${passArc + maybeArc} ${buyArc} ${circumference}`}
        />
        {/* STRONG BUY zone: 75-100% (brighter green) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#bbf7d0"
          strokeWidth="16"
          strokeDasharray={`0 ${passArc + maybeArc + buyArc} ${strongBuyArc} ${circumference}`}
        />
        {/* Progress arc (bold color overlay) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Rate text — shows actual rate even if > 100% */}
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
