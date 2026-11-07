# Multimodal Sensor Datasets

This directory stores sensor recording CSV datasets gathered from the OrthoSense wearable prototype for training and validating rehabilitation motion classification models.

## Dataset Format

Files are structured as CSV files with 50 Hz sampling rate:

- `timestamp`: Milliseconds epoch timestamp
- `ax, ay, az`: 3-axis accelerometer readings in gravity units (g)
- `gx, gy, gz`: 3-axis gyroscope angular velocities (deg/sec)
- `flexion_angle`: Knee joint angle in degrees
- `pressure_kpa`: Multi-point pressure estimate in kPa
- `label`: Movement / gait phase label:
  - `NORMAL_GAIT`: Standard forward walking phase
  - `FLEXION`: Controlled knee bending exercise phase
  - `EXTENSION`: Knee straightening exercise phase
  - `ABNORMAL_LOAD`: Uneven weight-bearing / abnormal gait detection
