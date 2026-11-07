import type { FC } from 'react';
import type { TelemetryAlert } from '../services/telemetryApi';

interface AlertBannerProps {
  alerts?: TelemetryAlert[];
}

export const AlertBanner: FC<AlertBannerProps> = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div style={{
        padding: '10px 16px',
        backgroundColor: '#e6f4ea',
        color: '#137333',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>●</span> All sensor readings within safe clinical rehabilitation thresholds
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {alerts.map((alert, idx) => {
        const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
        return (
          <div
            key={idx}
            style={{
              padding: '12px 16px',
              backgroundColor: isCritical ? '#fce8e6' : '#fef7e0',
              color: isCritical ? '#c5221f' : '#b06000',
              borderLeft: `4px solid ${isCritical ? '#d93025' : '#f9ab00'}`,
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>[{alert.severity}]</strong> {alert.message}
            </div>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
        );
      })}
    </div>
  );
};
