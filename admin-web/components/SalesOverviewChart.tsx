'use client';

import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { formatNaira } from '../lib/utils';
import { SalesDataPoint } from '../types';

interface SalesOverviewChartProps {
  data: SalesDataPoint[];
  period: 7 | 30 | 90;
  onPeriodChange: (p: 7 | 30 | 90) => void;
}

export default function SalesOverviewChart({
  data,
  period,
  onPeriodChange,
}: SalesOverviewChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxY = 1000000; // 1M ceiling
  const yTicks = [
    { label: '1M', value: 1000000 },
    { label: '750k', value: 750000 },
    { label: '500k', value: 500000 },
    { label: '250k', value: 250000 },
    { label: '0', value: 0 },
  ];

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
    const yRatio = Math.min(Math.max(d.amount, 0) / maxY, 1);
    const y = paddingTop + (1 - yRatio) * chartHeight;
    return { x, y, ...d };
  });

  // Generate smooth SVG curve using cubic bezier
  const createSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="text-[#6515D5]">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-base font-black text-[#171428]">Sales Overview</h3>
        </div>

        {/* Filter pills: 7 Days, 30 Days, 90 Days */}
        <div className="flex items-center bg-[#F7F5FC] p-1 rounded-xl space-x-1 border border-[#EAE6F3]">
          {([7, 30, 90] as const).map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#6515D5] text-white shadow-sm'
                    : 'text-[#77738A] hover:text-[#171428]'
                }`}
              >
                {p} Days
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6515D5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6515D5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis ticks */}
          {yTicks.map((tick) => {
            const y = paddingTop + (1 - tick.value / maxY) * chartHeight;
            return (
              <g key={tick.label}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#F3EFFC"
                  strokeDasharray={tick.value === 0 ? '0' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#77738A"
                  fontSize="11"
                  fontWeight="600"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Filled Gradient Area */}
          <path d={areaPath} fill="url(#purpleAreaGrad)" />

          {/* Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#6515D5"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points and X labels */}
          {points.map((pt, idx) => (
            <g key={idx} onMouseEnter={() => setHoverIndex(idx)} onMouseLeave={() => setHoverIndex(null)}>
              {/* Invisible touch target */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" className="cursor-pointer" />

              {/* Visible dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === idx ? '6' : '4.5'}
                fill="#6515D5"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="transition-all duration-200"
              />

              {/* X-axis label */}
              <text
                x={pt.x}
                y={paddingTop + chartHeight + 20}
                textAnchor="middle"
                fill="#77738A"
                fontSize="11"
                fontWeight="600"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute bg-[#171428] text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoverIndex].x / svgWidth) * 100}%`,
              top: `${(points[hoverIndex].y / svgHeight) * 100}%`,
              marginTop: '-12px',
            }}
          >
            <div>{formatNaira(points[hoverIndex].amount)}</div>
            <div className="text-[10px] text-purple-200/80">{points[hoverIndex].orders} orders</div>
          </div>
        )}
      </div>
    </div>
  );
}
