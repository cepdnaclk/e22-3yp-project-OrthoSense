#ifndef CONFIG_H
#define CONFIG_H

// ========================================================
// OrthoSense ESP32-S3 Hardware Pin & Parameter Config
// ========================================================

// System Identity
#define DEVICE_ID "ESP32S3-ORTHOSENSE-01"
#define FIRMWARE_VERSION "1.0.0"

// I2C Bus for IMUs (MPU6050 / ICM-42688)
#define I2C_SDA_PIN 8
#define I2C_SCL_PIN 9
#define I2C_FREQ_HZ 400000

// Analog Sensor Inputs (Force Sensing Resistors / Pressure)
#define FSR_MEDIAL_PIN 4
#define FSR_LATERAL_PIN 5
#define FSR_PATELLAR_PIN 6
#define BATTERY_ADC_PIN 1

// Sampling & Telemetry Frequencies
#define SENSOR_SAMPLE_INTERVAL_MS 20   // 50 Hz IMU acquisition
#define TELEMETRY_STREAM_INTERVAL_MS 100 // 10 Hz IoT dashboard stream

// Clinical Rehab Safety Thresholds
#define THRESHOLD_MAX_FLEXION_DEG 140.0f
#define THRESHOLD_MIN_EXTENSION_DEG 0.0f
#define THRESHOLD_MAX_PRESSURE_KPA 50.0f

#endif // CONFIG_H
