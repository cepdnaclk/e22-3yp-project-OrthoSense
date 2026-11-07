# OrthoSense TinyML Subsystem

The TinyML subsystem contains the model training, quantization, and evaluation pipelines for edge biomechanical analysis on the ESP32-S3 microcontroller.

## Architecture

```plaintext
ml_models/
├── datasets/           # CSV telemetry records from wearable sensors
│   ├── sample_gait_telemetry.csv
│   └── README.md
├── training/           # Model definitions, quantization & TFLite conversion
│   ├── train_rehab_classifier.py
│   └── requirements.txt
└── README.md
```

## Workflow

1. **Data Acquisition**: Sensor streams (6-axis IMU + Force Sensing Resistors) are collected via the wearable node and logged to `datasets/`.
2. **Feature Extraction & Normalization**: Temporal sliding windows (e.g., 500 ms windows at 50 Hz = 25 samples) compute mean, variance, and frequency metrics.
3. **Model Training**: A lightweight multi-layer perceptron (MLP) or 1D-CNN is trained to classify gait and rehabilitation exercise phases (`NORMAL_GAIT`, `FLEXION`, `EXTENSION`, `ABNORMAL_LOAD`).
4. **Quantization**: The floating-point model is post-training quantized to 8-bit integers (`INT8`) using TensorFlow Lite converter for low-latency integer inference on the ESP32-S3's vector instructions.
5. **C-Header Deployment**: Running `train_rehab_classifier.py` automatically converts the `.tflite` model into `firmware/include/model_data.h` for native linking in PlatformIO.

## Getting Started

```bash
cd ml_models/training
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_rehab_classifier.py
```
