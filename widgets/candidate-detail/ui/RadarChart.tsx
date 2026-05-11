"use client";

import { cn } from "@/shared/lib/cn";

/** Lightweight radar chart for the Pipeline & Review tab. Pure SVG —
 *  no chart-lib dependency. Pass either a single dataset or an array
 *  of overlaid datasets (used by the Comparison Hub). */
export function RadarChart({
  axes,
  datasets,
  size = 220,
  maxScore = 10,
  className,
}: {
  axes: string[];
  datasets: { label: string; values: number[]; color: string }[];
  size?: number;
  maxScore?: number;
  className?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const N = axes.length;
  const angleFor = (i: number) =>
    -Math.PI / 2 + (i / N) * Math.PI * 2;

  function point(i: number, value: number) {
    const a = angleFor(i);
    const r = (Math.max(0, Math.min(value, maxScore)) / maxScore) * radius;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  }

  // Concentric grid rings (4 levels)
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("h-auto w-full", className)}
      style={{ maxWidth: size }}
    >
      {/* Grid */}
      {rings.map((scale) => (
        <polygon
          key={scale}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
          points={axes
            .map((_, i) => {
              const a = angleFor(i);
              const r = scale * radius;
              return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
            })
            .join(" ")}
        />
      ))}
      {/* Spokes */}
      {axes.map((_, i) => {
        const a = angleFor(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * radius}
            y2={cy + Math.sin(a) * radius}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      })}
      {/* Datasets */}
      {datasets.map((ds, di) => {
        const pts = ds.values.map((v, i) => point(i, v));
        const path = pts.map((p) => p.join(",")).join(" ");
        return (
          <g key={di}>
            <polygon
              points={path}
              fill={ds.color}
              fillOpacity={0.25}
              stroke={ds.color}
              strokeWidth={1.5}
            />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2.5} fill={ds.color} />
            ))}
          </g>
        );
      })}
      {/* Axis labels */}
      {axes.map((label, i) => {
        const a = angleFor(i);
        const r = radius + 14;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        const anchor =
          Math.abs(Math.cos(a)) < 0.2
            ? "middle"
            : Math.cos(a) > 0
              ? "start"
              : "end";
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-gray-500"
            fontSize="9"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
