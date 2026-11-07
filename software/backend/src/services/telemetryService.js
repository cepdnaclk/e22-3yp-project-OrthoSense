/**
 * Telemetry Ingestion and Processing Service
 * Handles ingestion, validation, safety threshold verification,
 * and caching of wearable sensor telemetry streams.
 */

const { TelemetryRecord } = require('../models/telemetryModel');

// In-memory sliding buffer for real-time visualization & fast dashboard access
const MAX_BUFFER_SIZE = 500;
const telemetryBuffer = [];

// Safety limits configured from environment or defaults
const MAX_ANGLE = Number(process.env.MAX_KNEE_FLEXION_ANGLE || 140);
const MIN_ANGLE = Number(process.env.MIN_KNEE_EXTENSION_ANGLE || 0);
const MAX_PRESSURE = Number(process.env.MAX_CONTACT_PRESSURE_KPA || 50);

/**
 * Validate incoming raw packet from ESP32-S3
 * @param {Object} rawData
 */
function validatePacket(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid telemetry payload: must be a non-null object');
  }
  if (!rawData.deviceId) {
    throw new Error('Invalid telemetry payload: deviceId is required');
  }
}

/**
 * Check safety thresholds and generate alerts if necessary
 * @param {TelemetryRecord} record
 * @returns {Array<Object>} alerts
 */
function evaluateAlerts(record) {
  const alerts = [];

  if (record.flexionAngle > MAX_ANGLE) {
    alerts.push({
      type: 'HYPERFLEXION_WARNING',
      severity: 'HIGH',
      message: `Knee flexion exceeded safety threshold (${record.flexionAngle}° > ${MAX_ANGLE}°)`,
      timestamp: record.timestamp,
    });
  } else if (record.flexionAngle < MIN_ANGLE) {
    alerts.push({
      type: 'HYPEREXTENSION_WARNING',
      severity: 'CRITICAL',
      message: `Hyperextension detected (${record.flexionAngle}° < ${MIN_ANGLE}°)`,
      timestamp: record.timestamp,
    });
  }

  if (record.pressureKPa > MAX_PRESSURE) {
    alerts.push({
      type: 'EXCESSIVE_PRESSURE_WARNING',
      severity: 'MEDIUM',
      message: `Contact pressure exceeds recommended limit (${record.pressureKPa} kPa > ${MAX_PRESSURE} kPa)`,
      timestamp: record.timestamp,
    });
  }

  return alerts;
}

/**
 * Ingest and process a new telemetry packet
 * @param {Object} rawPacket
 * @returns {Object} processed result with record and any active alerts
 */
function ingestTelemetry(rawPacket) {
  validatePacket(rawPacket);

  const record = new TelemetryRecord(rawPacket);
  const alerts = evaluateAlerts(record);

  const entry = {
    ...record.toJSON(),
    alerts,
  };

  telemetryBuffer.push(entry);
  if (telemetryBuffer.length > MAX_BUFFER_SIZE) {
    telemetryBuffer.shift();
  }

  return entry;
}

/**
 * Get latest telemetry packet
 * @returns {Object|null}
 */
function getLatestTelemetry() {
  if (telemetryBuffer.length === 0) {
    // Return a mock default if buffer is currently empty
    return {
      deviceId: 'ESP32S3-DEMO',
      timestamp: Date.now(),
      flexionAngle: 42.5,
      pressureKPa: 18.2,
      imu: { ax: 0.05, ay: 0.98, az: 0.12, gx: 1.2, gy: -0.4, gz: 0.1 },
      predictedState: 'NORMAL_GAIT',
      batteryLevel: 94,
      alerts: [],
    };
  }
  return telemetryBuffer[telemetryBuffer.length - 1];
}

/**
 * Get historical telemetry buffer
 * @param {number} limit
 * @returns {Array<Object>}
 */
function getTelemetryHistory(limit = 50) {
  const count = Math.min(Number(limit) || 50, telemetryBuffer.length);
  return telemetryBuffer.slice(-count);
}

/**
 * Calculate rehab session summary statistics
 * @returns {Object}
 */
function getTelemetryStats() {
  if (telemetryBuffer.length === 0) {
    return {
      sampleCount: 0,
      peakFlexionAngle: 0,
      minFlexionAngle: 0,
      avgFlexionAngle: 0,
      avgPressureKPa: 0,
      totalAlerts: 0,
    };
  }

  let sumAngle = 0;
  let sumPressure = 0;
  let peakAngle = -Infinity;
  let minAngle = Infinity;
  let totalAlerts = 0;

  for (const item of telemetryBuffer) {
    sumAngle += item.flexionAngle;
    sumPressure += item.pressureKPa;
    if (item.flexionAngle > peakAngle) peakAngle = item.flexionAngle;
    if (item.flexionAngle < minAngle) minAngle = item.flexionAngle;
    if (item.alerts && item.alerts.length > 0) totalAlerts += item.alerts.length;
  }

  return {
    sampleCount: telemetryBuffer.length,
    peakFlexionAngle: Number(peakAngle.toFixed(2)),
    minFlexionAngle: Number(minAngle.toFixed(2)),
    avgFlexionAngle: Number((sumAngle / telemetryBuffer.length).toFixed(2)),
    avgPressureKPa: Number((sumPressure / telemetryBuffer.length).toFixed(2)),
    totalAlerts,
  };
}

module.exports = {
  ingestTelemetry,
  getLatestTelemetry,
  getTelemetryHistory,
  getTelemetryStats,
};

