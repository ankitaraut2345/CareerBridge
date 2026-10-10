import React from 'react';

/**
 * Modern SVG Doughnut Chart with legend & empty state
 */
export const DoughnutChart = ({
  data = [],
  title = 'Distribution',
  size = 180,
  strokeWidth = 24,
}) => {
  const validData = data.filter((item) => Number(item.value) > 0);
  const total = validData.reduce((acc, cur) => acc + Number(cur.value), 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-48">
        <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-2">
          <span className="text-xs font-semibold text-slate-400">0%</span>
        </div>
        <p className="text-xs font-semibold text-slate-600">No data recorded</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Records will display here when active</p>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      {/* SVG Donut */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {validData.map((item, idx) => {
            const fraction = item.value / total;
            const strokeDasharray = `${circumference * fraction} ${circumference * (1 - fraction)}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += circumference * fraction;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color || '#4F46E5'}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-[#172033] leading-none">{total}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-2 max-w-xs">
        {data.map((item, idx) => {
          const count = Number(item.value) || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color || '#4F46E5' }}
                />
                <span className="text-slate-600 font-medium truncate max-w-[120px]">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-[#172033]">
                <span>{count}</span>
                <span className="text-[10px] text-slate-400 w-8 text-right font-normal">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Clean SVG Trend Line Chart with Area Gradient
 */
export const TrendChart = ({ data = [], height = 160, color = '#4F46E5' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-xs text-slate-400">
        No trend activity recorded
      </div>
    );
  }

  const values = data.map((d) => d.count || 0);
  const maxVal = Math.max(...values, 4);
  const width = 500;
  const paddingX = 30;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.count / maxVal) * (height - paddingY * 2);
    return { x, y, count: d.count, label: d.label };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${
    height - paddingY
  } Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = height - paddingY - ratio * (height - paddingY * 2);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#F1F5F9"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Filled Area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Path line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="group">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#FFFFFF"
              stroke={color}
              strokeWidth="2"
              className="hover:r-6 transition-all"
            />
            {p.count > 0 && (
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#172033"
              >
                {p.count}
              </text>
            )}
            <text
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="500"
              fill="#94A3B8"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

/**
 * Horizontal Progress Bar Distribution
 */
export const HorizontalDistributionBar = ({ data = [] }) => {
  const max = Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const pct = Math.round(((item.value || 0) / max) * 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="font-bold text-[#172033]">{item.value || 0}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || '#4F46E5',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Metric Card
 */
export const StatCard = ({
  icon: Icon,
  title,
  value,
  subLabel,
  color = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'sky' | 'purple' | 'rose'
  onClick,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80',
      text: 'text-[#4F46E5]',
      border: 'border-indigo-100/80',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'border-emerald-100/80',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      border: 'border-amber-100/80',
    },
    sky: {
      bg: 'bg-sky-50/80',
      text: 'text-sky-600',
      border: 'border-sky-100/80',
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-600',
      border: 'border-purple-100/80',
    },
    rose: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      border: 'border-rose-100/80',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center ${scheme.bg} ${scheme.text} ${scheme.border}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          {value !== undefined ? value : '—'}
        </div>
        {subLabel && <p className="text-[11px] text-slate-400 mt-1 font-medium">{subLabel}</p>}
      </div>
    </div>
  );
};
