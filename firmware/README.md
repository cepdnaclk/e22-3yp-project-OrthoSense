# OrthoSense Embedded Firmware Subsystem

The OrthoSense firmware subsystem runs on an **ESP32-S3** microcontroller (Xtensa dual-core 32-bit LX7, 240 MHz, with vector instructions for AI/TinyML acceleration, integrated 2.4 GHz Wi-Fi and Bluetooth 5 LE).

## Directory Structure

```plaintext
firmware/
├── include/            # C/C++ Header files (pin mappings, network credentials, sensor thresholds)
│   └── config.h
├── src/                # Firmware source files
│   └── main.cpp        # Sensor sampling loop, sensor fusion, TinyML & telemetry dispatcher
├── lib/                # Reusable sensor drivers (IMU, FSR matrix, BLE/MQTT)
└── platformio.ini      # PlatformIO build & toolchain configuration
```

## Hardware Architecture

- **Microcontroller**: ESP32-S3-WROOM-1 (16MB Flash, 8MB PSRAM)
- **Kinematic Sensing**: Dual 6-Axis IMUs (MPU6050 / ICM-42688) placed above and below the knee joint for relative flexion/extension angle tracking.
- **Biomechanical Load**: Multi-point Force Sensing Resistors (FSR 402) on medial, lateral, and patellar contact regions.
- **Edge AI**: Quantized 8-bit TinyML neural network running on ESP32-S3 via TensorFlow Lite Micro.

## Build and Flashing Instructions

### Prerequisites
- [VS Code](https://code.visualstudio.com/) with the [PlatformIO IDE Extension](https://platformio.org/) installed, OR
- [PlatformIO Core CLI](https://docs.platformio.org/page/core.html).

### Commands

```bash
# Navigate to firmware directory
cd firmware

# Compile the firmware
pio run

# Upload to connected ESP32-S3 board
pio run --target upload

# Open the serial monitor (115200 baud)
pio device monitor
```
