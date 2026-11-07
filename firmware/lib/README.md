# Firmware Custom Hardware Libraries

Place custom hardware drivers and peripheral libraries inside this directory:

- `imu_fusion/`: Dual 6-DOF IMU quaternion filtering and joint angle solver (femur vs. tibia)
- `fsr_matrix/`: Force-sensing resistor calibration, polynomial curve fit, and contact pressure calculator
- `tinyml_runtime/`: TensorFlow Lite for Microcontrollers (TFLite Micro) runtime wrapper for ESP32-S3 NN acceleration
- `ble_mesh/`: Bluetooth Low Energy GATT service definitions for local real-time telemetry streaming
