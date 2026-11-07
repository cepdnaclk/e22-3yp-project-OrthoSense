import type { FC, CSSProperties } from 'react';
import { useTelemetry } from '../hooks/useTelemetry';
import { SensorWidget } from '../components/SensorWidget';
import { TelemetryChart } from '../components/TelemetryChart';
import { AlertBanner } from '../components/AlertBanner';

export const DashboardPage: FC = () => {
  const { latest, history, stats, connected, error, refresh } = useTelemetry(2000);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>OrthoSense Rehabilitation Dashboard</h1>
          <p style={subtitleStyle}>
            Intelligent Knee Rehabilitation Monitoring &amp; Biomechanical Gait Assessment
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '16px',
            backgroundColor: connected ? '#e6f4ea' : '#fce8e6',
            color: connected ? '#137333' : '#c5221f',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connected ? '#1e8e3e' : '#d93025'
            }} />
            {connected ? 'Device Connected' : 'Disconnected'}
          </div>
          <button onClick={refresh} style={refreshButtonStyle}>
            Refresh
          </button>
        </div>
      </header>

      {error && !connected && (
        <div style={errorBannerStyle}>
          <strong>Connection Notice:</strong> {error}. Ensure the Node.js backend is running on port 5000 (`npm run dev` in `software/backend`).
        </div>
      )}

      {/* Safety & Threshold Alerts */}
      <AlertBanner alerts={latest?.alerts} />

      {/* Live Sensors Grid */}
      <SensorWidget packet={latest} />

      {/* Trajectory Chart */}
      <TelemetryChart history={history} />

      {/* Session Analytics */}
      {stats && (
        <div style={statsContainerStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#3c4043' }}>
            Current Rehab Session Summary
          </h3>
          <div style={statsGridStyle}>
            <div>
              <div style={statsLabel}>Total Samples</div>
              <div style={statsValue}>{stats.sampleCount}</div>
            </div>
            <div>
              <div style={statsLabel}>Peak Flexion</div>
              <div style={statsValue}>{stats.peakFlexionAngle}°</div>
            </div>
            <div>
              <div style={statsLabel}>Min Flexion</div>
              <div style={statsValue}>{stats.minFlexionAngle}°</div>
            </div>
            <div>
              <div style={statsLabel}>Average Flexion</div>
              <div style={statsValue}>{stats.avgFlexionAngle}°</div>
            </div>
            <div>
              <div style={statsLabel}>Average Pressure</div>
              <div style={statsValue}>{stats.avgPressureKPa} kPa</div>
            </div>
            <div>
              <div style={statsLabel}>Threshold Alerts</div>
              <div style={{ ...statsValue, color: stats.totalAlerts > 0 ? '#d93025' : '#137333' }}>
                {stats.totalAlerts}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '24px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: '#202124',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #e0e0e0',
  flexWrap: 'wrap',
  gap: '12px',
};

const titleStyle: CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  margin: '0 0 4px 0',
  color: '#1a73e8',
};

const subtitleStyle: CSSProperties = {
  fontSize: '14px',
  color: '#5f6368',
  margin: 0,
};

const refreshButtonStyle: CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#1a73e8',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const errorBannerStyle: CSSProperties = {
  padding: '12px 16px',
  backgroundColor: '#fff3cd',
  color: '#856404',
  border: '1px solid #ffeeba',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '13px',
};

const statsContainerStyle: CSSProperties = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e0e0e0',
  borderRadius: '10px',
  padding: '16px 20px',
};

const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '16px',
};

const statsLabel: CSSProperties = {
  fontSize: '12px',
  color: '#5f6368',
  marginBottom: '4px',
};

const statsValue: CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#202124',
};
