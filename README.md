# OrthoSense: Multimodal Sensing Framework for Orthopedic Rehab Monitoring

[![Department](https://img.shields.io/badge/Department-Computer%20Engineering%20%7C%20UoP-00529B.svg)](http://www.ce.pdn.ac.lk/)
[![Course](https://img.shields.io/badge/Course-CO3060%203rd%20Year%20Project-orange.svg)](https://projects.ce.pdn.ac.lk/)
[![Platform](https://img.shields.io/badge/Hardware-ESP32--S3%20Xtensa%20Dual--Core-red.svg)](https://www.espressif.com/en/products/socs/esp32-s3)
[![Edge AI](https://img.shields.io/badge/Edge--AI-TensorFlow%20Lite%20Micro-FF6F00.svg)](https://www.tensorflow.org/lite/microcontrollers)
[![Backend](https://img.shields.io/badge/Backend-Django%20%7C%20PostgreSQL-092E20.svg)](https://www.djangoproject.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB.svg)](https://react.dev/)
[![Prototype Cost](https://img.shields.io/badge/Prototype%20Cost-%3CRs.%208%2C870%20LKR%20%28~%2425%20USD%29-brightgreen.svg)](#detailed-budget--bill-of-materials)

<p align="center">
  <img src="./docs/images/orthosense-hero.png" alt="OrthoSense Project Banner" width="550" />
</p>

<p align="center">
  <strong>An Edge-AI & IoT Healthcare Platform for Real-Time Knee Rehabilitation and Fault-Tolerant Biomechanical Assessment</strong>
</p>

<p align="center">
  <a href="https://cepdnaclk.github.io/e22-3yp-project-OrthoSense/"><strong>Explore the Project Documentation &raquo;</strong></a>
  <br />
  <a href="#clinical-background--the-real-world-problem">Clinical Problem</a> &bull;
  <a href="#the-orthosense-paradigm">Proposed Solution</a> &bull;
  <a href="#solution-architecture">System Architecture</a> &bull;
  <a href="#dependability--fault-tolerance-strategy">Fault-Tolerance</a> &bull;
  <a href="#detailed-budget--bill-of-materials">BOM & Budget</a> &bull;
  <a href="#team-organization--work-breakdown-structure">Team 12</a>
</p>

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Clinical Background & The Real-World Problem](#clinical-background--the-real-world-problem)
3. [The OrthoSense Paradigm & Viability Benchmark](#the-orthosense-paradigm--viability-benchmark)
4. [Solution Architecture](#solution-architecture)
   - [High-Level Data and Control Flow](#high-level-data-and-control-flow)
   - [Layered System Organization](#layered-system-organization)
   - [Closed-Loop Control & Decision Hierarchy](#closed-loop-control--decision-hierarchy)
5. [Hardware & Software Design](#hardware--software-design)
   - [Wearable Sensor Suite](#wearable-sensor-suite)
   - [Edge Processing & TinyML (ESP32-S3)](#edge-processing--tinyml-esp32-s3)
   - [Cloud Backend & Clinician Dashboard](#cloud-backend--clinician-dashboard)
6. [Dependability & Fault-Tolerance Strategy](#dependability--fault-tolerance-strategy)
7. [Security, Privacy & Ethical Compliance](#security-privacy--ethical-compliance)
8. [Testing & Demonstration Plan](#testing--demonstration-plan)
9. [Detailed Budget & Bill of Materials](#detailed-budget--bill-of-materials)
10. [13-Week Implementation Roadmap](#13-week-implementation-roadmap)
11. [Team Organization & Work Breakdown Structure](#team-organization--work-breakdown-structure)
12. [Repository Structure & Getting Started](#repository-structure--getting-started)
13. [Links & Acknowledgments](#links--acknowledgments)

---

## Executive Summary

Orthopedic recovery following major knee surgery (such as Anterior Cruciate Ligament reconstruction, meniscus repair, and total knee arthroplasty) requires 6–12 months of structured rehabilitation. During the critical **2 to 4 weeks post-surgery**, soft-tissue graft vascularization occurs, making the joint exceptionally susceptible to permanent structural damage or re-rupture from uncontrolled strain, hyperextension, or improper exercise execution.

Today, **over 95% of recovery exercises occur unmonitored at home**, while clinical assessments take place only once every 2–4 weeks. Orthopedic surgeons and physical therapists must rely on subjective patient self-reporting, which suffers from an error rate exceeding 60%. Meanwhile, existing research braces and commercial systems remain cost-prohibitive ($600–$2,500), track only single-axis joint angle, crash when sensors disconnect, and introduce hazardous 2–5 second cloud latency before alerting the patient.

**OrthoSense** solves this clinical blind spot by introducing an ultra-low-cost (~Rs. 8,870 LKR / ~$25 USD), multimodal smart knee rehabilitation brace. Powered by an **ESP32-S3** dual-core edge processor, OrthoSense concurrently tracks the complete clinical triad: **kinematic joint angle (IMU)**, **quadriceps loading / contact pressure (FSR matrix)**, and **localized joint temperature (NTC thermistors)** alongside high-frequency impact detection. With an **on-device TinyML inference engine delivering deterministic <500ms acoustic/tactile safety trips** and a **mathematical fault-tolerant sensor re-weighting matrix**, OrthoSense protects patient grafts in real time without cloud reliance.

---

## Clinical Background & The Real-World Problem

Post-operative knee rehabilitation faces three fundamental challenges in current clinical care:

1. **The Critical 4–6 Week Vascularization Window:** Following ACL reconstruction or knee arthroplasty, neovascularization occurs within the new tendon graft. Excessive mechanical shear or sudden hyperextension (>30° in Week 1) stretches or permanently ruptures the graft before it can anchor into the bone tunnels.
2. **The 2–4 Week Unmonitored Blind Spot:** Patients leave the hospital with passive rigid braces and paper exercise sheets. They attend clinical physiotherapy sessions only once every 2 to 4 weeks. Any compensatory limping, joint effusion (swelling), or improper loading between visits goes unnoticed until irreversible damage or joint stiffness sets in.
3. **Surgeon Reliance on Subjective Self-Recall:** More than 60% of patient self-reports regarding exercise compliance, range of motion (ROM) achievement, and pain thresholds are inaccurate or exaggerated, depriving clinicians of objective biofeedback needed to adjust rehab protocols.

---

## The OrthoSense Paradigm & Viability Benchmark

OrthoSense bridges this gap through four core engineering innovations:
- **Clinically Appropriate Triad:** Simultaneous tracking of Range of Motion (6-axis IMU), Patellar/Contact Pressure (FSR matrix), and Thermal Swelling Index (NTC thermistor array).
- **Deterministic Edge Safety Cut-Off:** Instant (<500ms) on-brace buzzer and vibration alerts trip whenever prescribed limits are breached—completely offline with zero cloud dependency.
- **Graceful Fault Tolerance:** Dynamic mathematical sensor re-weighting isolates disconnected, slipping, or saturated sensors in real time without firmware crashes or reboots.
- **Extreme Cost-Effectiveness:** Fully fabricated prototype built for **Rs. 8,870 LKR (~$25 USD)** compared to $600–$2,500 commercial alternatives.

<p align="center">
  <img src="./docs/images/viability-benchmark.png" alt="OrthoSense Solution Viability Benchmark" width="600" />
</p>

| Parameter | Standard Care | Commercial Braces | OrthoSense (Team 12) |
| :--- | :--- | :--- | :--- |
| **Monitoring Type** | Intermittent (clinic visits every 2–4 wks) | Angle only (single IMU or potentiometer) | **Continuous Triad** (Kinematics + Pressure + Temperature) |
| **Safety Trip Latency** | None (Post-injury assessment) | 2–5 seconds (Cloud-dependent roundtrip) | **<500 ms Deterministic On-Brace Safety Cut-Off** |
| **Sensor Redundancy** | None | Fragile (Firmware freezes upon sensor fault) | **Dynamic Fault-Tolerant Re-Weighting Matrix** |
| **Hardware Prototype Cost**| Free (Subjective recall only) | $600 – $2,500 USD | **< Rs. 8,870 LKR (~$25 USD)** |

---

## Solution Architecture

### High-Level Data and Control Flow

<p align="center">
  <img src="./docs/images/system-architecture.png" alt="OrthoSense End-to-End Data and Control Flow" width="850" />
</p>

The OrthoSense platform operates across an interconnected, closed-loop pipeline:
1. **Multimodal Sensing:** FSR sensors, flex strips, 6-axis IMU, NTC thermistors, and piezo impact sensors continuously capture biomechanical parameters at 1Hz to 100Hz.
2. **Edge Processing (ESP32-S3):** Signals pass through digital Butterworth noise filtering, kinematic complementary sensor fusion, dynamic fault-tolerance evaluation, and quantized TinyML movement classification.
3. **Deterministic Safety Intervention:** If an unsafe kinematic state, excessive patellar pressure (>80N), or hyperextension is detected, the on-brace active buzzer and vibration motor fire within <500ms.
4. **Wireless Telemetry Uplink:** Validated exercise metrics and summarized events are transmitted over BLE 5.0 (with Wi-Fi fallback) to a local mobile gateway/cache.
5. **Cloud Analytics & Storage:** Ingested into a Django/FastAPI backend backed by a PostgreSQL / Timescale time-series database.
6. **Clinician Web Dashboard:** Physical therapists and orthopedic surgeons review objective ROM curves, repetition quality, swelling trends, and automated compliance reports in a React interface.

### Layered System Organization

<p align="center">
  <img src="./docs/images/tech-stack-infrastructure.png" alt="OrthoSense Layered Technology Stack" width="850" />
</p>

The architecture is partitioned into four distinct layers:

```
+-----------------------------------------------------------------------------------+
| LAYER 1: WEARABLE HARDWARE LAYER                                                  |
| - MPU6050 (6-Axis IMU)      - FSR402 Pressure Array (3x)   - NTC Thermistors (4x) |
| - Flex / Strain Strips       - Piezo Vibration / Impact     - 16-Bit Precision ADC |
| - CD74HC4067 Multiplexer     - Neoprene Knee Sleeve          - 18650 Li-ion + BMS   |
+-----------------------------------------+-----------------------------------------+
                                          | Analog / I2C / SPI
+-----------------------------------------v-----------------------------------------+
| LAYER 2: EDGE PROCESSING LAYER (ESP32-S3 @ 240MHz Xtensa LX7)                     |
| - Core 0: 50Hz Sensor Acquisition, 15Hz Butterworth Filter, IMU Kinematic Fusion  |
| - Core 1: Dynamic Fault Re-Weighting, INT8 TFLite Micro Classifier (<40KB SRAM),  |
|           Circular Ring Buffer (500 samples), On-Brace Acoustic/Tactile Trip     |
+-----------------------------------------+-----------------------------------------+
                                          | BLE 5.0 GATT (24-byte packets) / Wi-Fi
+-----------------------------------------v-----------------------------------------+
| LAYER 3: COMMUNICATION & GATEWAY LAYER                                            |
| - BLE 5.0 2M PHY Uplink      - Mobile App / Gateway Node    - SQLite Local Cache  |
| - 72-Hour Offline Storage    - AES-128 Pairing Encryption   - Wi-Fi 802.11 Fallback|
+-----------------------------------------+-----------------------------------------+
                                          | TLS 1.3 HTTPS / WSS WebSockets
+-----------------------------------------v-----------------------------------------+
| LAYER 4: CLOUD BACKEND & CLINICIAN DASHBOARD                                      |
| - Django / FastAPI REST & WebSocket Ingestion Engine                              |
| - PostgreSQL / TimescaleDB Encrypted Time-Series Storage (AES-256 at rest)        |
| - React 18 / Vite Responsive Web Dashboard with Chart.js / Recharts Telemetry     |
| - Automated Weekly Compliance Scoring, Swelling Index, & PDF Clinical Reports     |
+-----------------------------------------------------------------------------------+
```

### Closed-Loop Control & Decision Hierarchy

| Decision Level | Execution Location | Latency | Clinical Function |
| :--- | :--- | :--- | :--- |
| **Level 1: Ultra-Fast Safety Trip** | ESP32-S3 Edge Node | **< 500 ms** | Triggers buzzer & tactile cut-off if knee angle exceeds prescribed weekly ROM (e.g., >30° in Week 1) or contact force > 80N. Prevents graft failure. |
| **Level 2: Adaptive Fault Tolerance** | ESP32-S3 Edge Node | **< 100 ms** | Detects open circuits, disconnections, or sensor saturation. Re-weights healthy sensor matrix dynamically and notifies patient on OLED. |
| **Level 3: Exercise Repetition Validation** | Mobile Gateway App | **< 1 s** | Evaluates exercise cadence, angular velocity, and peak extension. Increments valid reps and delivers real-time voice coaching prompts. |
| **Level 4: Protocol Progression** | Cloud Backend | **Batch / Weekly** | Computes multi-day adherence and joint swelling trends. Recommends stage progression (e.g., Stage 1 passive ROM &rarr; Stage 2 active flexion). |

---

## Hardware & Software Design

### Wearable Sensor Suite

- **Joint Kinematics (GY-521 / MPU6050 6-Axis IMU):** Sampled at 50Hz; captures 3-axis angular rates and accelerations along femur and tibia segments to calculate flexion/extension angles with <3° accuracy after complementary filtering.
- **Quadriceps Loading & Contact Pressure (FSR402):** 3 thin-film force-sensing resistors sampled at 20Hz across the patellar tendon, medial joint line, and lateral joint line (100g to 10kg force range).
- **Localized Joint Swelling Index (NTC MF52 10kΩ Thermistors):** 4 thermistors (1% precision) sampled at 1Hz comparing bilateral knee temperature against ambient temperature to detect inflammatory flare-ups.
- **High-Frequency Shock & Clicking (Piezo Vibration Sensor):** 100Hz burst sampling to identify mechanical joint clicking, subluxation, or abrupt stumble impacts.
- **Signal Conditioning & Multiplexing:** CD74HC4067 16-channel analog multiplexer combined with a 16-bit high-precision ADC to achieve ultra-low analog noise.
- **Power Management:** 18650 rechargeable Li-ion cells with integrated TP4056/BMS protection circuitry, delivering >18 hours of continuous operation on BLE 5.0.

### Edge Processing & TinyML (ESP32-S3)

- **Compute Core:** ESP32-S3 microcontroller operating at 240MHz featuring Xtensa Vector Instructions (PIE), accelerating INT8 quantized neural network operations by 4–5x compared to standard microcontrollers.
- **FreeRTOS Dual-Core Scheduling:** Core 0 is dedicated to high-frequency deterministic sensor sampling (50Hz) and digital filtering; Core 1 handles BLE communication, fault re-weighting, and TinyML inference.
- **Digital Butterworth Filter:** 2nd-order 15Hz low-pass filter eliminates baseline tremor, movement artifacts, and 50Hz mains power hum.
- **Kinematic Complementary Fusion:** Fuses accelerometer gravity vectors with gyroscope angular rates, achieving drift-free angle tracking validated against manual goniometer benchmarks.
- **TensorFlow Lite for Microcontrollers (TFLite Micro):** INT8 quantized model consuming <40KB SRAM footprint, classifying movement into:
  1. *Normal Daily Activity* (walking, standing)
  2. *Controlled Rehabilitation Exercise* (straight leg raises, seated heel slides)
  3. *Hazardous Strain / Dangerous Hyperextension* (compensatory torque, abnormal shearing force)

### Cloud Backend & Clinician Dashboard

- **REST & WebSocket API:** Built on Python (Django / FastAPI) providing secure endpoints for session upload and real-time live telemetry streaming.
- **Time-Series Storage:** PostgreSQL with TimescaleDB extension, partitioning kinematic angles, repetition timestamps, and temperature time-series with millisecond fidelity.
- **Clinician Web Portal:** React frontend offering interactive angle trend graphs, 4-week rehabilitation progression tracking, patient compliance heatmaps, and one-click PDF clinical report generation.

---

## Dependability & Fault-Tolerance Strategy

A critical weakness of existing research prototypes is fragility: if a single sensor detaches, breaks, or saturates due to brace slippage, the firmware encounters divide-by-zero or NaN states, freezing the system. OrthoSense integrates an on-chip **Dynamic Sensor Health & Re-Weighting Algorithm**:

<p align="center">
  <img src="./docs/images/fault-tolerance-strategy.png" alt="OrthoSense Dynamic Fault-Tolerant Re-Weighting Decision Flow" width="750" />
</p>

### Decision Flow Formulation
1. **Variance & Health Inspection:** Over a rolling sliding window of $N = 50$ samples, the edge node computes the variance $\sigma_i^2$ and bounds for each sensor $S_i$:
   $$\sigma_i^2 = \frac{1}{N} \sum_{k=1}^{N} (x_{i}[k] - \mu_i)^2$$
2. **Anomaly Classification:**
   - If $\sigma_i^2 < \epsilon_{min}$ (flatline/open circuit) OR $x_i > V_{sat}$ (saturation/short circuit), mark sensor $S_i$ as **UNHEALTHY**.
   - If IMU angular acceleration does not correlate with FSR pressure shifts over 10 consecutive cycles, mark sensor as **SLIPPED**.
3. **Dynamic Re-Weighting:** 
   The unhealthy sensor weight is immediately set to zero ($W_i = 0$). The system redistributes full mathematical weight across the remaining $N_{active}$ operational sensors:
   $$W_k = \frac{100\%}{N_{active}} \quad \forall k \in \text{Healthy Sensors}$$
4. **Seamless Telemetry Continuity:** The rehabilitation session continues uninterrupted without requiring a system reboot or MCU reset. An alert is logged locally and mirrored to the clinician dashboard.

---

## Security, Privacy & Ethical Compliance

Medical telemetry demands stringent security and patient privacy safeguards:

- **Hardware & Firmware Security:** ESP32-S3 hardware Secure Boot and Flash Encryption prevent firmware reverse-engineering or memory tampering.
- **Zero Plaintext PII on Brace:** The wearable brace processes and transmits only raw anonymous sensor floats and event tokens—never patient names, national IDs, or demographic records.
- **BLE Transmission Privacy:** AES-128 encryption key exchange during Bluetooth bonding blocks air-sniffing. Randomized BLE private MAC addresses prevent tracking patient movements via external BLE beacons.
- **Transport & Storage Encryption:** TLS 1.3 encryption with certificate pinning for all REST and WebSocket connections. Database tables utilize AES-256 encryption at rest with GUID pseudonyms aligned with HIPAA and GDPR guidelines.
- **Role-Based Access Control (RBAC):** JWT authentication partitions clinician and patient portals; surgeons can adjust ROM safety thresholds, while patients access guided exercise coaching.
- **Immutable Audit Logging:** Every clinician modification to prescribed limits and every raw data export is permanently recorded with microsecond timestamps.

---

## Testing & Demonstration Plan

The OrthoSense validation plan spans three rigorous evaluation stages:

<p align="center">
  <img src="./docs/images/clinical-problem-3.png" alt="Clinical Validation and Rehabilitation Exercises" width="600" />
</p>

| Stage | Benchmark Target | Verification Method |
| :--- | :--- | :--- |
| **Milestone 2: Benchtop Sensor Precision** | Joint Angle Error $< 3.0^\circ$ <br> FSR Linearity $R^2 > 0.95$ | Static weight calibration on FSRs (100g–10kg); NTC thermal calibration against medical-grade infrared thermometer; IMU joint angle validation against physical manual goniometer. |
| **Milestone 3: Fault Stress & Safety Latency** | Zero MCU Crashes <br> Buzzer Trip $< 500 \text{ ms}$ | Simulated open-circuit and disconnected sensor stress tests; dynamic re-weighting matrix verification without MCU reset; oscilloscope-timed emergency trip latency upon joint hyperextension. |
| **Milestone 4: End-to-End Rehab Emulation** | 100% Packet Delivery <br> Automated PDF Export | Full guided rehabilitation workout sessions on physical wearable knee brace; real-time BLE 5.0 telemetry ingestion into PostgreSQL; clinician report generation and alert dispatch. |

---

## Detailed Budget & Bill of Materials

The entire prototype has been designed to strictly respect student project budget guidelines, maintaining total out-of-pocket costs well below the $35 USD (~10,000 LKR) limit:

| # | Component Description | Qty | Source / Inventory Status | Unit Price (LKR) | Subtotal (LKR) |
| :-: | :--- | :-: | :--- | :-: | -: |
| 1 | **ESP32-S3 Nano Dev Board** (Waveshare 8MB PSRAM) | 1 | Tronic.lk (Procured) | Rs. 4,400.00 | Rs. 4,400.00 |
| 2 | **FSR402 Thin-Film Pressure Sensors** (100g–10kg) | 3 | Tronic.lk (Procured) | Rs. 950.00 | Rs. 2,850.00 |
| 3 | **NTC MF52 10kΩ Thermistors** (1% Precision) | 4 | Tronic.lk (Procured) | Rs. 30.00 | Rs. 120.00 |
| 4 | **GY-521 / MPU6050 6-Axis IMU Module** | 3 | Department Inventory (Item #73) | Free (Dept Stock) | Rs. 0.00 |
| 5 | **16-Bit High-Precision ADC Board** | 1 | Department Inventory (Item #10) | Free (Dept Stock) | Rs. 0.00 |
| 6 | **0.96-inch OLED Display** (I2C 128&times;64) | 4 | Department Inventory (Item #71) | Free (Dept Stock) | Rs. 0.00 |
| 7 | **18650 Li-ion Battery Cells + BMS Board** | 2+1 | Department Inventory (Items #117, #99) | Free (Dept Stock) | Rs. 0.00 |
| 8 | **Active Buzzer + Piezo Sensor Modules** | 1+1 | Department Inventory (Items #31, #21) | Free (Dept Stock) | Rs. 0.00 |
| 9 | **Knee Brace Sleeve Fabric + Velcro Straps** | 1 | Local Market (Procured) | Rs. 1,500.00 | Rs. 1,500.00 |
| | **TOTAL ELECTRONICS OUTLAY** | | | | **Rs. 7,370.00** |
| | **GRAND TOTAL (WITH WEARABLE SLEEVE)** | | | | **Rs. 8,870.00 (~$25 USD)** |

---

## 13-Week Implementation Roadmap

<p align="center">
  <img src="./docs/images/implementation-roadmap.png" alt="OrthoSense 13-Week Implementation Roadmap" width="850" />
</p>

The project progresses systematically across four development phases and four major milestones:

- **Phase 1: Hardware Procurement & Circuit Design (Weeks 1–4) &rarr; `Milestone 1`**
  - Component acquisition from Tronic.lk and department inventory.
  - Sensor signal conditioning, analog multiplexing, and breadboard prototype fabrication.
  - Initial sensor calibration and static benchtop load testing.
- **Phase 2: Firmware & Baseline Calibration (Weeks 4–7) &rarr; `Milestone 2`**
  - Multi-core FreeRTOS firmware implementation on ESP32-S3.
  - 15Hz digital Butterworth noise filter and complementary IMU kinematic fusion.
  - Baseline BLE 5.0 GATT telemetry streaming.
- **Phase 3: TinyML & Fault-Tolerance (Weeks 7–10) &rarr; `Milestone 3`**
  - Movement dataset collection and quantized TensorFlow Lite Micro model training.
  - Implementation and stress testing of dynamic fault-tolerant sensor re-weighting.
  - Benchmarking of emergency safety buzzer trip latency (<500ms).
- **Phase 4: Cloud, Dashboard & Testing (Weeks 10–13) &rarr; `Milestone 4`**
  - Django / FastAPI cloud backend and PostgreSQL time-series schema deployment.
  - React clinician web dashboard with interactive charts and automated alert feeds.
  - Full end-to-end rehabilitation emulation across a 4-week protocol.

---

## Team Organization & Work Breakdown Structure

OrthoSense is developed by **Team 12** from the Department of Computer Engineering, University of Peradeniya:

| Member | Role | Core Technical Focus & WBS Areas | ePortfolio |
| :--- | :--- | :--- | :---: |
| **M.F.M. Minhaj Ali**<br>`E/22/237`<br>[e22237@eng.pdn.ac.lk](mailto:e22237@eng.pdn.ac.lk) | **Team Leader** | &bull; TinyML INT8 quantization & deployment (<40KB SRAM)<br>&bull; ESP32-S3 FreeRTOS dual-core task scheduling<br>&bull; System integration & edge safety trip control loop | [ePortfolio](https://www.thecn.com/MM4918) |
| **K.D. Ashen**<br>`E/22/032`<br>[e22032@eng.pdn.ac.lk](mailto:e22032@eng.pdn.ac.lk) | **Product Owner** | &bull; Analog circuit design (16-bit ADC & CD74HC4067 multiplexer)<br>&bull; Power architecture (18650 Li-ion, BMS & TP4056)<br>&bull; Mechanical fabrication of neoprene sleeve & sensor mounts | [ePortfolio](https://www.thecn.com/DA1139) |
| **W.M.S. Manujitha**<br>`E/22/228`<br>[e22228@eng.pdn.ac.lk](mailto:e22228@eng.pdn.ac.lk) | **Developer** | &bull; Django / FastAPI REST & WebSocket backend services<br>&bull; PostgreSQL / TimescaleDB time-series database design<br>&bull; React clinician web dashboard with live ROM trend analytics | [ePortfolio](https://www.thecn.com/WM443) |
| **H.C.V. Perera**<br>`E/22/280`<br>[e22280@eng.pdn.ac.lk](mailto:e22280@eng.pdn.ac.lk) | **Developer** | &bull; Kinematic IMU sensor fusion (complementary filter / EKF)<br>&bull; 2nd-order 15Hz Butterworth digital noise filter<br>&bull; Dynamic sensor variance tracker & re-weighting matrix | [ePortfolio](https://www.thecn.com/HP638) |

---

## Repository Structure & Getting Started

```
e22-3yp-project-OrthoSense/
├── README.md                  # Main repository technical overview
├── code/                      # Firmware, backend, and dashboard source files
│   ├── firmware/              # ESP32-S3 FreeRTOS & TinyML C++ firmware
│   ├── backend/               # Django / FastAPI cloud telemetry service
│   └── dashboard/             # React / Vite clinician web dashboard
└── docs/                      # GitHub Pages documentation & Jekyll website
    ├── README.md              # Project documentation home page
    ├── _config.yml            # Jekyll configuration file
    ├── data/
    │   └── index.json         # Department project catalog metadata
    └── images/                # Architecture diagrams, flowcharts, and media assets
        ├── orthosense-hero.png
        ├── system-architecture.png
        ├── tech-stack-infrastructure.png
        ├── fault-tolerance-strategy.png
        ├── implementation-roadmap.png
        └── viability-benchmark.png
```

### Quick Start Instructions

1. **Firmware (ESP32-S3):**
   - Built with [ESP-IDF v5.x](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/) or [PlatformIO](https://platformio.org/).
   - Connect the ESP32-S3 board via USB-C and run:
     ```bash
     cd code/firmware
     pio run -t upload
     ```
2. **Cloud Backend:**
   - Requires Python 3.10+ and PostgreSQL.
   - Run migrations and start development server:
     ```bash
     cd code/backend
     python -m venv venv && source venv/bin/activate
     pip install -r requirements.txt
     python manage.py migrate
     python manage.py runserver
     ```
3. **Clinician Dashboard:**
   - Node.js 18+ required:
     ```bash
     cd code/dashboard
     npm install
     npm run dev
     ```

---

## Links & Acknowledgments

- **Project Repository:** [https://github.com/cepdnaclk/e22-3yp-project-OrthoSense](https://github.com/cepdnaclk/e22-3yp-project-OrthoSense)
- **Project Documentation Page:** [https://cepdnaclk.github.io/e22-3yp-project-OrthoSense/](https://cepdnaclk.github.io/e22-3yp-project-OrthoSense/)
- **Department Project Portal:** [https://projects.ce.pdn.ac.lk/](https://projects.ce.pdn.ac.lk/)
- **Department of Computer Engineering:** [http://www.ce.pdn.ac.lk/](http://www.ce.pdn.ac.lk/)
- **Faculty of Engineering, University of Peradeniya:** [https://eng.pdn.ac.lk/](https://eng.pdn.ac.lk/)

---
*OrthoSense &copy; 2026 Team 12 &bull; Department of Computer Engineering, University of Peradeniya.*
