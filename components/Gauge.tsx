"use client";

interface GaugeProps {
  rate: number;
  size?: number;
}

export function Gauge({ rate, size = 120 }: GaugeProps) {
  const radius = size / 2 - 10;
  const circumference = Math.PI * radius;
  const angle = (rate / 100) * 180;
  const strokeDasharray = (angle / 180) * circumference;

  // Color based on verdict
  let color = "#ef4444"; // PASS - red
  if (rate >= 50) {
    color = "#10b981"; // BUY - green
  } else if (rate >= 20) {
    color = "#f59e0b"; // RISKY - amber
  }

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size / 2 + 10 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          className="gauge-arc"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
        <span className="text-2xl font-bold" style={{ color }}>
          {rate}%
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
          sell-through
        </span>
      </div>
    </div>
  );
}
