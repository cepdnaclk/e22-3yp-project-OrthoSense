/**
 * Telemetry Data Model Representation
 * Defines the standard JSON schema for multimodal sensor packets transmitted
 * from the ESP32-S3 wearable node to the OrthoSense backend.
 */

class TelemetryRecord {
  /**
   * @param {Object} data
   * @param {string} data.deviceId - Unique device MAC or identifier
   * @param {number} data.timestamp - Epoch timestamp (ms)
   * @param {number} data.flexionAngle - Joint angle in degrees (0 - 150)
   * @param {number} data.pressureKPa - Force/pressure sensor value (kPa)
   * @param {Object} data.imu - 6-axis IMU readings
   * @param {number} data.imu.ax - Accelerometer X (g)
   * @param {number} data.imu.ay - Accelerometer Y (g)
   * @param {number} data.imu.az - Accelerometer Z (g)
   * @param {number} data.imu.gx - Gyroscope X (deg/s)
   * @param {number} data.imu.gy - Gyroscope Y (deg/s)
   * @param {number} data.imu.gz - Gyroscope Z (deg/s)
   * @param {string} [data.predictedState] - TinyML state: 'NORMAL_GAIT', 'FLEXION', 'EXTENSION', 'ANOMALY'
   * @param {number} [data.batteryLevel] - Battery percentage (0 - 100)
   */
  constructor({
    deviceId,
    timestamp = Date.now(),
    flexionAngle = 0,
    pressureKPa = 0,
    imu = { ax: 0, ay: 0, az: 1, gx: 0, gy: 0, gz: 0 },
    predictedState = 'NORMAL_GAIT',
    batteryLevel = 100,
  }) {
    this.deviceId = deviceId || 'ESP32S3-DEFAULT';
    this.timestamp = Number(timestamp);
    this.flexionAngle = Number(flexionAngle);
    this.pressureKPa = Number(pressureKPa);
    this.imu = {
      ax: Number(imu?.ax ?? 0),
      ay: Number(imu?.ay ?? 0),
      az: Number(imu?.az ?? 1),
      gx: Number(imu?.gx ?? 0),
      gy: Number(imu?.gy ?? 0),
      gz: Number(imu?.gz ?? 0),
    };
    this.predictedState = String(predictedState);
    this.batteryLevel = Number(batteryLevel);
  }

  toJSON() {
    return {
      deviceId: this.deviceId,
      timestamp: this.timestamp,
      flexionAngle: this.flexionAngle,
      pressureKPa: this.pressureKPa,
      imu: this.imu,
      predictedState: this.predictedState,
      batteryLevel: this.batteryLevel,
    };
  }
}

module.exports = { TelemetryRecord };

