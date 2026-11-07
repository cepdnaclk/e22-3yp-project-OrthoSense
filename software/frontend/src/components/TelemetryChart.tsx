import type { FC, CSSProperties } from 'react';
import type { TelemetryPacket } from '../services/telemetryApi';

interface TelemetryChartProps {
  history: TelemetryPacket[];
}

export const TelemetryChart: FC<TelemetryChartProps> = ({ history }) => {
  if (!history || history.length < 2) {
    return (
      <div style={containerStyle}>
        <h3 style={titleStyle}>Real-Time Flexion Angle Trajectory</h3>
        <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>
          Collecting telemetry data points...
        </p>
      </div>
    );
  }

  const angles = history.map((h) => h.flexionAngle);
  const minVal = 0;
  const maxVal = Math.max(140, Math.ceil(Math.max(...angles) / 10) * 10);

  const width = 600;
  const height = 200;
  const padding = 35;

  const getX = (idx: number) => padding + (idx / (history.length - 1)) * (width - 2 * padding);
  const getY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

  const points = angles.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={titleStyle}>Real-Time Flexion Angle Trajectory (° vs Time)</h3>
        <span style={{ fontSize: '12px', color: '#1a73e8', fontWeight: 600 }}>Live Feed (ESP32-S3)</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Y Gridlines & labels */}
        {[0, 35, 70, 105, 140].map((level) => {
          const y = getY(level);
          return (
            <g key={level}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f3f4" strokeWidth="1" />
              <text x={padding - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#80868b">
                {level}°
              </text>
            </g>
          );
        })}

        {/* Safety limit line at 130 */}
        <line
          x1={padding}
          y1={getY(130)}
          x2={width - padding}
          y2={getY(130)}
          stroke="#ea4335"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <text x={width - padding + 5} y={getY(130) + 3} fontSize="9" fill="#ea4335">
          Limit
        </text>

        {/* Trajectory line */}
        <polyline
          fill="none"
          stroke="#1a73e8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data points */}
        {angles.map((val, idx) => (
          <circle
            key={idx}
            cx={getX(idx)}
            cy={getY(val)}
            r={idx === angles.length - 1 ? 5 : 3}
            fill={idx === angles.length - 1 ? '#d93025' : '#1a73e8'}
          />
        ))}
      </svg>
    </div>
  );
};

const containerStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  marginBottom: '24px',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  fontWeight: 600,
  color: '#202124',
};
