'use client';

import { useState, useMemo } from 'react';
import type { SellThroughResult } from '@/lib/sellthrough';
import { estimateDaysToSell } from '@/lib/sellthrough';

interface PriceSpeedSliderProps {
  result: SellThroughResult;
  isPro: boolean;
  embedded?: boolean;
}

export default function PriceSpeedSlider({ result, isPro, embedded = false }: PriceSpeedSliderProps) {
  const { priceLow, priceHigh, medianSoldPrice, sellThroughRate } = result;

  const sliderMin = Math.max(1, Math.floor(priceLow * 0.8));
  const sliderMax = Math.ceil(priceHigh * 1.1);

  const [price, setPrice] = useState(Math.round(medianSoldPrice));

  const estDays = useMemo(
    () => estimateDaysToSell(price, medianSoldPrice, sellThroughRate),
    [price, medianSoldPrice, sellThroughRate]
  );

  const medianDays = useMemo(
    () => estimateDaysToSell(medianSoldPrice, medianSoldPrice, sellThroughRate),
    [medianSoldPrice, sellThroughRate]
  );

  const getSpeedInfo = (days: number) => {
    if (days <= 7) return { label: 'Fast', color: 'text-green-600', barColor: 'bg-green-500', barWidth: 85 };
    if (days <= 14) return { label: 'Moderate', color: 'text-yellow-600', barColor: 'bg-yellow-500', barWidth: 55 };
    if (days <= 30) return { label: 'Slow', color: 'text-orange-600', barColor: 'bg-orange-400', barWidth: 35 };
    return { label: 'Very slow', color: 'text-red-600', barColor: 'bg-red-400', barWidth: 18 };
  };

  const displayPrice = isPro ? price : Math.round(medianSoldPrice);
  const displayDays = isPro ? estDays : medianDays;
  const speed = getSpeedInfo(displayDays);

  // Percentages for positioning elements on the track
  const range = sliderMax - sliderMin;
  const medianPercent = range > 0 ? ((medianSoldPrice - sliderMin) / range) * 100 : 50;
  const handlePercent = range > 0 ? ((displayPrice - sliderMin) / range) * 100 : 50;
  const gradientLeft = range > 0 ? ((priceLow - sliderMin) / range) * 100 : 0;
  const gradientRight = range > 0 ? ((priceHigh - sliderMin) / range) * 100 : 100;
  const gradientWidth = gradientRight - gradientLeft;

  const handlePriceInput = (val: string) => {
    const num = Number(val);
    if (!isNaN(num) && num >= sliderMin && num <= sliderMax) {
      setPrice(num);
    }
  };

  const content = (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>📊</span> Price vs. Speed
          {!isPro && (
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
              PRO
            </span>
          )}
        </h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {isPro
          ? 'Drag the slider or type a price — see how it affects speed of sale'
          : 'Adjust your listing price to see how fast it\u2019ll sell'}
      </p>

      {/* Big price + days display */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-3xl font-bold text-gray-900">
            ${displayPrice.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">list price</div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${speed.color}`}>
            ~{displayDays}d
          </div>
          <div className="text-xs text-gray-500">est. time to sell</div>
        </div>
      </div>

      {/* Speed bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${speed.color}`}>{speed.label}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${speed.barColor} rounded-full transition-all duration-300`}
            style={{ width: `${speed.barWidth}%` }}
          />
        </div>
      </div>

      {/* Merged Price Range + Slider */}
      <div className="relative">
        {isPro ? (
          <div className="relative">
            {/* Gradient track (the price range bar) */}
            <div className="relative h-5 sm:h-4 bg-gray-200 rounded-full">
              {/* Green gradient fill showing actual price range */}
              <div
                className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                style={{
                  left: `${gradientLeft}%`,
                  width: `${gradientWidth}%`,
                }}
              />
              {/* Median marker (small white dot) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-green-800 rounded-full z-10"
                style={{ left: `${medianPercent}%`, marginLeft: '-4px' }}
              />
            </div>
            {/* Custom visual handle */}
            <div
              className="absolute top-0 w-7 h-7 sm:w-5 sm:h-5 bg-white border-2 border-green-600 rounded-full shadow-lg z-10 pointer-events-none transition-all duration-100"
              style={{
                left: `calc(${handlePercent}% - 14px)`,
                top: '-5px',
              }}
            />
            {/* Hidden native range input for drag + keyboard accessibility */}
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="absolute inset-0 w-full h-5 sm:h-4 opacity-0 cursor-pointer z-20"
            />
          </div>
        ) : (
          /* Locked slider for free users */
          <div className="relative">
            <div className="relative h-4 bg-gray-200 rounded-full">
              <div
                className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                style={{
                  left: `${gradientLeft}%`,
                  width: `${gradientWidth}%`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-green-800 rounded-full z-10"
                style={{ left: `${medianPercent}%`, marginLeft: '-4px' }}
              />
            </div>
            {/* Handle at median */}
            <div
              className="absolute top-0 w-6 h-6 bg-gray-300 border-2 border-white rounded-full shadow-md flex items-center justify-center"
              style={{
                left: `calc(${medianPercent}% - 12px)`,
                top: '-3px',
              }}
            >
              <span className="text-[8px] text-gray-500 leading-none">&#x27F7;</span>
            </div>
            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: '-3px', height: 'calc(100% + 6px)' }}>
              <div className="absolute inset-0 bg-white/60 rounded-lg" />
              <a
                href="/pricing"
                className="relative z-10 inline-flex items-center gap-1 text-xs sm:text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full hover:bg-green-100 transition min-h-[36px]"
              >
                <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Unlock with Pro
              </a>
            </div>
          </div>
        )}

        {/* Price labels */}
        <div className="flex justify-between mt-2 text-[11px] sm:text-xs text-gray-400">
          <span>${sliderMin}</span>
          <span className="font-medium text-gray-600">Median: ${medianSoldPrice.toFixed(0)}</span>
          <span>${sliderMax}</span>
        </div>
      </div>

      {/* Manual price input (Pro only) */}
      {isPro && (
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-gray-500">Or enter price:</label>
          <div className="relative w-28 sm:w-24">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
            <input
              type="number"
              min={sliderMin}
              max={sliderMax}
              step={1}
              value={price}
              onChange={(e) => handlePriceInput(e.target.value)}
              className="w-full pl-5 pr-2 py-2 sm:py-1.5 rounded-lg border border-gray-200 text-sm sm:text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        </div>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <div className="mt-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>📊</span> Price vs. Speed
            {!isPro && (
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                PRO
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isPro
              ? 'Drag the slider or type a price — see how it affects speed of sale'
              : 'Adjust your listing price to see how fast it\u2019ll sell'}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {/* Big price + days display */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${displayPrice.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">list price</div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${speed.color}`}>
                ~{displayDays}d
              </div>
              <div className="text-xs text-gray-500">est. time to sell</div>
            </div>
          </div>

          {/* Speed bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${speed.color}`}>{speed.label}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${speed.barColor} rounded-full transition-all duration-300`}
                style={{ width: `${speed.barWidth}%` }}
              />
            </div>
          </div>

          {/* Merged Price Range + Slider */}
          <div className="relative">
            {isPro ? (
              <div className="relative">
                <div className="relative h-5 sm:h-4 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    style={{
                      left: `${gradientLeft}%`,
                      width: `${gradientWidth}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-green-800 rounded-full z-10"
                    style={{ left: `${medianPercent}%`, marginLeft: '-4px' }}
                  />
                </div>
                <div
                  className="absolute top-0 w-7 h-7 sm:w-5 sm:h-5 bg-white border-2 border-green-600 rounded-full shadow-lg z-10 pointer-events-none transition-all duration-100"
                  style={{
                    left: `calc(${handlePercent}% - 14px)`,
                    top: '-5px',
                  }}
                />
                <input
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="absolute inset-0 w-full h-5 sm:h-4 opacity-0 cursor-pointer z-20"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="relative h-5 sm:h-4 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    style={{
                      left: `${gradientLeft}%`,
                      width: `${gradientWidth}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-green-800 rounded-full z-10"
                    style={{ left: `${medianPercent}%`, marginLeft: '-4px' }}
                  />
                </div>
                <div
                  className="absolute top-0 w-4 h-4 bg-gray-400 border-2 border-white rounded-full shadow"
                  style={{
                    left: `calc(${medianPercent}% - 8px)`,
                    top: '-2px',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/60 rounded-lg" />
                  <a
                    href="/pricing"
                    className="relative z-10 inline-flex items-center gap-1 text-xs sm:text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full hover:bg-green-100 transition min-h-[36px]"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Unlock with Pro
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-2 text-[11px] sm:text-xs text-gray-400">
              <span>${sliderMin}</span>
              <span className="font-medium text-gray-600">Median: ${medianSoldPrice.toFixed(0)}</span>
              <span>${sliderMax}</span>
            </div>
          </div>

          {/* Manual price input (Pro only) */}
          {isPro && (
            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-gray-500">Or enter price:</label>
              <div className="relative w-28 sm:w-24">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input
                  type="number"
                  min={sliderMin}
                  max={sliderMax}
                  step={1}
                  value={price}
                  onChange={(e) => handlePriceInput(e.target.value)}
                  className="w-full pl-5 pr-2 py-2 sm:py-1.5 rounded-lg border border-gray-200 text-sm sm:text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
