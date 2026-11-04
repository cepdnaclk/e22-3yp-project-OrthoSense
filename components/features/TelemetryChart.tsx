"use client";

import * as React from "react";
import { TelemetryPoint } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Table, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TelemetryChartProps {
  data: TelemetryPoint[];
  title?: string;
  className?: string;
}

export function TelemetryChart({
  data,
  title = "Synchronized Multi-Sensor Telemetry",
  className,
}: TelemetryChartProps) {
  const [activeTab, setActiveTab] = React.useState<"chart" | "table">("chart");
  const [activeChannel, setActiveChannel] = React.useState<"all" | "angle" | "fsr" | "temp">("all");
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
        No telemetry packets recorded for this session.
      </div>
    );
  }

  // Calculate bounds
  const maxAngle = 120;
  const minAngle = 0;
  const maxFsr = 800;
  const maxTemp = 40;
  const minTemp = 25;

  const width = 800;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const pointsCount = data.length;
  const getX = (index: number) => padding.left + (index / (pointsCount - 1)) * plotWidth;

  const getAngleY = (val: number | null) => {
    if (val === null) return null;
    const clamped = Math.max(minAngle, Math.min(maxAngle, val));
    return padding.top + plotHeight - ((clamped - minAngle) / (maxAngle - minAngle)) * plotHeight;
  };

  const getFsrY = (val: number | null) => {
    if (val === null) return null;
    const clamped = Math.max(0, Math.min(maxFsr, val));
    return padding.top + plotHeight - (clamped / maxFsr) * plotHeight;
  };

  const getTempY = (val: number | null) => {
    if (val === null) return null;
    const clamped = Math.max(minTemp, Math.min(maxTemp, val));
    return padding.top + plotHeight - ((clamped - minTemp) / (maxTemp - minTemp)) * plotHeight;
  };

  // Generate SVG path strings
  const anglePath = data
    .map((d, i) => {
      const y = getAngleY(d.kneeAngleDeg);
      return y !== null ? `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${y.toFixed(1)}` : "";
    })
    .filter(Boolean)
    .join(" ");

  const fsrHeelPath = data
    .map((d, i) => {
      const y = getFsrY(d.fsrHeelRaw);
      return y !== null ? `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${y.toFixed(1)}` : "";
    })
    .filter(Boolean)
    .join(" ");

  const tempPath = data
    .map((d, i) => {
      const y = getTempY(d.skinTemperatureC);
      return y !== null ? `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${y.toFixed(1)}` : "";
    })
    .filter(Boolean)
    .join(" ");

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs", className)}>
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#0F766E]"></span> Knee Joint Angle (°)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#1D4ED8]"></span> FSR Heel (Raw ADC)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#E11D48]"></span> Skin Temp (°C)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel selector */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveChannel("all")}
              className={cn("px-2.5 py-1 rounded-md font-medium transition-colors", activeChannel === "all" ? "bg-white shadow-xs text-slate-900" : "text-slate-600")}
            >
              All
            </button>
            <button
              onClick={() => setActiveChannel("angle")}
              className={cn("px-2.5 py-1 rounded-md font-medium transition-colors", activeChannel === "angle" ? "bg-white shadow-xs text-[#0F766E]" : "text-slate-600")}
            >
              Angle
            </button>
            <button
              onClick={() => setActiveChannel("fsr")}
              className={cn("px-2.5 py-1 rounded-md font-medium transition-colors", activeChannel === "fsr" ? "bg-white shadow-xs text-[#1D4ED8]" : "text-slate-600")}
            >
              FSR
            </button>
            <button
              onClick={() => setActiveChannel("temp")}
              className={cn("px-2.5 py-1 rounded-md font-medium transition-colors", activeChannel === "temp" ? "bg-white shadow-xs text-[#E11D48]" : "text-slate-600")}
            >
              Temp
            </button>
          </div>

          {/* View toggle (Chart vs Tabular) */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("chart")}
              aria-label="View Chart"
              className={cn("p-1.5 rounded-md transition-colors", activeTab === "chart" ? "bg-white shadow-xs text-slate-900" : "text-slate-600")}
            >
              <LineChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab("table")}
              aria-label="View Accessible Tabular Data"
              className={cn("p-1.5 rounded-md transition-colors", activeTab === "table" ? "bg-white shadow-xs text-slate-900" : "text-slate-600")}
            >
              <Table className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Display */}
      {activeTab === "chart" ? (
        <div className="p-4 relative select-none">
          {hoveredPoint && (
            <div className="absolute top-6 right-6 bg-slate-900/90 text-white text-xs p-2.5 rounded-lg shadow-lg pointer-events-none z-10 space-y-1">
              <p className="font-mono text-slate-400">Time: {(hoveredPoint.timestampMs / 1000).toFixed(1)}s</p>
              <p className="text-teal-300 font-semibold">Angle: {hoveredPoint.kneeAngleDeg ?? "N/A"}°</p>
              <p className="text-blue-300 font-semibold">FSR Heel: {hoveredPoint.fsrHeelRaw ?? "N/A"}</p>
              <p className="text-rose-300 font-semibold">Skin Temp: {hoveredPoint.skinTemperatureC ?? "N/A"}°C</p>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[300px]"
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Grid Lines */}
              {[0, 30, 60, 90, 120].map((deg) => {
                const y = getAngleY(deg) || 0;
                return (
                  <g key={deg}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748B"
                      fontFamily="monospace"
                    >
                      {deg}°
                    </text>
                  </g>
                );
              })}

              {/* Angle Line */}
              {(activeChannel === "all" || activeChannel === "angle") && (
                <path
                  d={anglePath}
                  fill="none"
                  stroke="#0F766E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* FSR Heel Line */}
              {(activeChannel === "all" || activeChannel === "fsr") && (
                <path
                  d={fsrHeelPath}
                  fill="none"
                  stroke="#1D4ED8"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />
              )}

              {/* Skin Temp Line */}
              {(activeChannel === "all" || activeChannel === "temp") && (
                <path
                  d={tempPath}
                  fill="none"
                  stroke="#E11D48"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive Scrub Rectangles */}
              {data.map((d, i) => (
                <rect
                  key={i}
                  x={getX(i) - plotWidth / (pointsCount * 2)}
                  y={padding.top}
                  width={plotWidth / pointsCount}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              ))}

              {/* Hover Indicator Line */}
              {hoverIndex !== null && (
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={height - padding.bottom}
                  stroke="#0F172A"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}
            </svg>
          </div>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2">Time (s)</th>
                <th className="px-4 py-2">Knee Angle (°)</th>
                <th className="px-4 py-2">FSR Heel (Counts)</th>
                <th className="px-4 py-2">FSR Toe (Counts)</th>
                <th className="px-4 py-2">Skin Temp (°C)</th>
                <th className="px-4 py-2">Channel Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-1.5">{(row.timestampMs / 1000).toFixed(1)}s</td>
                  <td className="px-4 py-1.5 font-bold text-[#0F766E]">{row.kneeAngleDeg}°</td>
                  <td className="px-4 py-1.5 text-blue-700">{row.fsrHeelRaw}</td>
                  <td className="px-4 py-1.5 text-blue-700">{row.fsrToeRaw}</td>
                  <td className="px-4 py-1.5 text-rose-700">{row.skinTemperatureC}°C</td>
                  <td className="px-4 py-1.5 text-emerald-700 font-sans font-semibold">
                    {row.channelHealth.angle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

