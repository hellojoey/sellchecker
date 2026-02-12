"use client";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isPrimary?: boolean;
  onButtonClick?: () => void;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  isPrimary = false,
  onButtonClick,
}: PricingCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 text-left relative ${
        isPrimary
          ? "border-2 border-emerald-500"
          : "border border-gray-200"
      }`}
    >
      {isPrimary && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </span>
      )}

      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-3xl font-extrabold text-gray-900 mt-2">
        {price}
        <span className="text-sm font-normal text-gray-400">/{period}</span>
      </p>
      <p className="text-sm text-gray-500 mt-1 mb-6">{description}</p>

      <ul className="space-y-3 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckIcon className="text-emerald-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onButtonClick}
        className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
          isPrimary
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "border border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}
