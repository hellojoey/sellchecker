import { type Verdict, getVerdictColor, getVerdictLabel } from '@/lib/sellthrough';

interface VerdictBadgeProps {
  verdict: Verdict;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerdictBadge({ verdict, showLabel = false, size = 'md' }: VerdictBadgeProps) {
  const color = getVerdictColor(verdict);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center font-bold rounded-full text-white ${sizeClasses[size]}`}
        style={{ backgroundColor: color }}
      >
        {verdict === 'BUY' && '💰 '}
        {verdict === 'MAYBE' && '🤷 '}
        {verdict === 'PASS' && '👎 '}
        {verdict}
      </span>
      {showLabel && (
        <span className="text-sm text-gray-500">{getVerdictLabel(verdict)}</span>
      )}
    </div>
  );
}
