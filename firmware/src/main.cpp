/**
 * OrthoSense Firmware - Main Application Entry
 * Target MCU: ESP32-S3 (Dual-Core Xtensa LX7, 240MHz, BLE 5.0, Wi-Fi 4)
 * Subsystem: Multimodal Sensor Ingestion, Complementary Filter, TinyML & IoT Telemetry
 */

#include <Arduino.h>
#include <Wire.h>
#include "config.h"

// Telemetry State Structure
struct TelemetryPacket {
    float flexionAngle;
    float pressureKPa;
    float ax, ay, az;
    float gx, gy, gz;
    const char* predictedState;
    uint8_t batteryLevel;
};

TelemetryPacket currentTelemetry = {
    0.0f, 0.0f,
    0.0f, 0.0f, 1.0f,
    0.0f, 0.0f, 0.0f,
    "NORMAL_GAIT",
    100
};

unsigned long lastSampleTime = 0;
unsigned long lastTelemetryTime = 0;

void initSensors() {
    Serial.println("[FIRMWARE] Initializing I2C bus and sensors...");
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN, I2C_FREQ_HZ);
    analogReadResolution(12);
    Serial.println("[FIRMWARE] Sensors initialized successfully.");
}

void readMultimodalSensors() {
    // 1. Read Pressure / FSRs
    int rawMedial = analogRead(FSR_MEDIAL_PIN);
    float pressureEstimate = (rawMedial / 4095.0f) * 60.0f; // Approx kPa
    currentTelemetry.pressureKPa = pressureEstimate;

    // 2. Synthesize/Filter Knee Joint Flexion Angle
    // In production, calculated via dual IMU quaternion fusion (femur vs tibia)
    static float simulatedAngle = 20.0f;
    static float direction = 1.0f;
    simulatedAngle += direction * 0.8f;
    if (simulatedAngle > 95.0f) direction = -1.0f;
    if (simulatedAngle < 15.0f) direction = 1.0f;
    currentTelemetry.flexionAngle = simulatedAngle;

    // 3. Update IMU readings
    currentTelemetry.ax = 0.05f;
    currentTelemetry.ay = 0.98f;
    currentTelemetry.az = 0.15f;
    currentTelemetry.gx = direction * 15.0f;
    currentTelemetry.gy = 0.0f;
    currentTelemetry.gz = 0.5f;

    // 4. TinyML Edge Inference Placeholder
    if (currentTelemetry.flexionAngle > 60.0f) {
        currentTelemetry.predictedState = "FLEXION";
    } else if (currentTelemetry.flexionAngle < 25.0f) {
        currentTelemetry.predictedState = "EXTENSION";
    } else {
        currentTelemetry.predictedState = "NORMAL_GAIT";
    }
}

void dispatchTelemetry() {
    // Transmit JSON packet over Serial / Wi-Fi / MQTT
    Serial.printf("{\"deviceId\":\"%s\",\"angle\":%.2f,\"pressure\":%.2f,\"state\":\"%s\",\"battery\":%d}\n",
        DEVICE_ID,
        currentTelemetry.flexionAngle,
        currentTelemetry.pressureKPa,
        currentTelemetry.predictedState,
        currentTelemetry.batteryLevel
    );
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("=========================================");
    Serial.println(" OrthoSense ESP32-S3 Firmware Booting... ");
    Serial.printf(" Version: %s | Device: %s\n", FIRMWARE_VERSION, DEVICE_ID);
    Serial.println("=========================================");

    initSensors();
}

void loop() {
    unsigned long now = millis();

    // 50 Hz sensor sampling
    if (now - lastSampleTime >= SENSOR_SAMPLE_INTERVAL_MS) {
        lastSampleTime = now;
        readMultimodalSensors();
    }

    // 10 Hz telemetry dispatch
    if (now - lastTelemetryTime >= TELEMETRY_STREAM_INTERVAL_MS) {
        lastTelemetryTime = now;
        dispatchTelemetry();
    }
}
