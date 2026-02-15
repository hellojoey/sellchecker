'use client';

export type ConditionValue = '' | 'NEW' | 'USED';

interface ConditionFilterProps {
  value: ConditionValue;
  onChange: (condition: ConditionValue) => void;
  disabled?: boolean;
}

const OPTIONS: { label: string; value: ConditionValue }[] = [
  { label: 'All', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Used', value: 'USED' },
];

export default function ConditionFilter({ value, onChange, disabled = false }: ConditionFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Condition:</span>
      <div className="flex gap-1">
        {OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => !disabled && onChange(opt.value)}
              disabled={disabled}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border-2 transition ${
                isActive
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
