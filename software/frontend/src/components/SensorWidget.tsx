import type { FC, CSSProperties } from 'react';
import type { TelemetryPacket } from '../services/telemetryApi';

interface SensorWidgetProps {
  packet: TelemetryPacket | null;
}

export const SensorWidget: FC<SensorWidgetProps> = ({ packet }) => {
  if (!packet) {
    return <div style={{ color: '#888' }}>Waiting for incoming telemetry...</div>;
  }

  const { flexionAngle, pressureKPa, imu, predictedState, batteryLevel } = packet;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Knee Flexion Angle</div>
        <div style={{ ...valueStyle, color: flexionAngle > 130 ? '#d93025' : '#1a73e8' }}>
          {flexionAngle.toFixed(1)}°
        </div>
        <div style={subTextStyle}>Clinical Range: 0° - 140°</div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Contact Pressure</div>
        <div style={{ ...valueStyle, color: pressureKPa > 40 ? '#f9ab00' : '#137333' }}>
          {pressureKPa.toFixed(1)} <span style={{ fontSize: '16px' }}>kPa</span>
        </div>
        <div style={subTextStyle}>Safe limit &lt; 50 kPa</div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>TinyML Gait Classifier</div>
        <div style={{ ...valueStyle, fontSize: '20px', color: '#8430ce' }}>
          {predictedState}
        </div>
        <div style={subTextStyle}>Edge Inference on ESP32-S3</div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>IMU Dynamics</div>
        <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#3c4043' }}>
          <div>Acc: X: {imu.ax.toFixed(2)} Y: {imu.ay.toFixed(2)} Z: {imu.az.toFixed(2)}g</div>
          <div>Gyr: X: {imu.gx.toFixed(1)} Y: {imu.gy.toFixed(1)} Z: {imu.gz.toFixed(1)}°/s</div>
        </div>
        <div style={subTextStyle}>Battery: {batteryLevel}%</div>
      </div>
    </div>
  );
};

const cardStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '10px',
  padding: '16px 20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const labelStyle: CSSProperties = {
  fontSize: '13px',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: '#5f6368',
  letterSpacing: '0.5px',
  marginBottom: '8px',
};

const valueStyle: CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  marginBottom: '4px',
};

const subTextStyle: CSSProperties = {
  fontSize: '12px',
  color: '#80868b',
};
