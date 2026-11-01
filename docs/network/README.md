# OrthoSense — Network Development Specification & Working Plan

> **Document Status**: Draft / Working Plan  
> **Author**: Network Development Sub-Team  
> **Target Audience**: OrthoSense Project Team (Team 12), Academic Supervisors  
> **Repository Branch**: `network-development`  
> **Date**: November 2026  

---

## 1. Network Development Role and Responsibilities

### 1.1 Mission & Scope
The Network Development responsibility encompasses the architectural design, implementation, and verification of **Layer 3 (Communication & Gateway Layer)** within the OrthoSense platform, as well as the wireless transmission hooks bridging **Layer 2 (Edge Firmware)** and **Layer 4 (Cloud & Ingestion Services)**.

The primary objective is to guarantee the timely, secure, and resilient transfer of multi-modal rehabilitation telemetry from the wearable knee brace to clinicians, whether operating in real-time clinic assessments or unmonitored home rehabilitation environments.

```
+-------------------------------------------------------------------------------+
| LAYER 1: Wearable Hardware (Sensors, Multiplexer, ADC, Battery [Proposed])     |
+-------------------------------------------------------------------------------+
                                       | Analog / I2C
+-------------------------------------------------------------------------------+
| LAYER 2: Edge Processing                                                      |
|   - Current: Arduino loop(), sensor sampling, filtering, health tracking      |
|   - Proposed Future Architecture: FreeRTOS dual-core task pinning, TinyML,     |
|     safety cut-off trip logic                                                 |
+-------------------------------------------------------------------------------+
                                       |
    ===================================v===================================
    >>> LAYER 3: COMMUNICATION & GATEWAY (Network Development Scope)   <<<
    * Wireless Connectivity (Wi-Fi STA / SoftAP Provisioning / BLE)        *
    * Telemetry Packaging, Serialization, and Uplink Protocol               *
    * Network Fault Tolerance (Offline Buffering & Re-connection Engine)   *
    * Transport Encryption (TLS / Secure BLE) & Patient Data Anonymization  *
    ===================================+===================================
                                       |
+-------------------------------------------------------------------------------+
| LAYER 4: Cloud Ingestion, Storage, and Clinician Dashboard [Proposed]         |
+-------------------------------------------------------------------------------+
```

*Note on Edge Architecture*: While project conceptual specifications describe FreeRTOS dual-core task scheduling (Core 0 for sampling, Core 1 for communication/TinyML), the current firmware executes single-threaded within the standard Arduino `setup()` and `loop()`. Multi-core task pinning and TinyML integration remain proposed future architecture elements that require firmware-level refactoring.

### 1.2 Core Responsibilities
- **Connectivity Management**: Implementing reliable wireless connectivity routines (Station mode, SoftAP provisioning, or BLE GATT server) with deterministic auto-reconnect and recovery.
- **Data Serialization & Framing**: Designing efficient payload structures (binary packing or optimized JSON) that encapsulate multi-axis kinematics, contact pressure, localized thermal swelling, and sensor health flags.
- **Offline Telemetry Resilience**: Designing buffering and catch-up mechanisms to preserve rehabilitation data across wireless dropouts and transient disconnections.
- **Security & Privacy Implementation**: Enforcing medical-grade transport encryption and strict decoupling of personal identification from raw bio-telemetry.
- **Cross-Team Integration Contracts**:
  - *With Firmware*: Providing non-blocking communication hooks so network activity never blocks or degrades high-frequency sensor acquisition (50 Hz) or the proposed on-brace safety cut-off target (<500 ms, specified in project requirements as a target to be verified on hardware).
  - *With Backend & Dashboard*: Establishing schemas, protocol specifications, and validation suites for cloud ingestion endpoints and real-time live telemetry feeds.

---

## 2. Current Project Networking Status

### 2.1 Codebase Inspection Findings `[Implemented & Verified]`
An empirical audit of the existing codebase on the `network-development` branch (`edge/sketch.ino`, `edge/health.h`, `edge/libraries.txt`, and `app/`) confirms:

- **Zero Networking Logic in Firmware**:
  - `edge/sketch.ino` (448 lines) contains **no networking code whatsoever**.
  - No Wi-Fi headers (`<WiFi.h>`, `<esp_wifi.h>`) or Bluetooth headers (`<BLEDevice.h>`, `<NimBLEDevice.h>`) are included.
  - No IoT protocol libraries (`<PubSubClient.h>`, `<AsyncMqttClient.h>`) or HTTP/WebSocket clients are referenced.
  - `edge/libraries.txt` lists exclusively hardware driver libraries:
    ```
    Adafruit MPU6050
    Adafruit Unified Sensor
    Adafruit GFX Library
    Adafruit SSD1306
    Adafruit BusIO
    ```
- **Serial-Only Telemetry Output**:
  - The firmware outputs structured JSON strictly through the physical USB-UART serial interface (`Serial.println()`) at a fixed 4 Hz cadence via the `report()` function.
- **Downstream Infrastructure Status**:
  - **Backend (`code/backend/`)**: Completely uninitialized in the working branch. No Django or FastAPI ingestion services exist.
  - **Dashboard (`app/`)**: The repository contains a default Next.js 16 template generated via `create-next-app` (`page.tsx`, `layout.tsx`). No custom telemetry interfaces, WebSocket listeners, or API consumers have been implemented yet.

---

## 3. Existing Sensor-to-ESP32 Data Flow `[Implemented & Verified]`

### 3.1 Hardware Sampling & Cadence
The edge firmware currently samples three distinct physical sensor categories using non-blocking, interval-driven timers:

| Sensor Modality | Hardware / Pin Assignment | Bus / Interface | Sampling Rate | Implementation Status in Firmware |
| :--- | :--- | :--- | :--- | :--- |
| **Dual 6-Axis IMUs** | GY-521 (MPU6050) at `0x68` & `0x69` | I2C (`SDA=8`, `SCL=9`) | 50 Hz (`IMU_MS = 20`) | Initialized & read via Adafruit MPU6050 driver |
| **Contact Pressure (FSR)** | Potentiometer simulation on `GPIO 1` | 12-bit ADC (`FSR_SIM_PIN`) | 20 Hz (`FSR_MS = 50`) | Sampled via `analogRead()`; rail-checked |
| **Joint Temperature (NTC)** | NTC thermistor module on `GPIO 2` | 12-bit ADC (`NTC_PIN`) | 1 Hz (`TEMP_MS = 1000`) | Sampled via `analogRead()`; converted via Beta formula |
| **Status Display** | SSD1306 0.96" OLED at `0x3C` | I2C (`SDA=8`, `SCL=9`) | 4 Hz (`REPORT_MS = 250`) | Screen re-drawn with sensor channel health flags |
| **Health Indicator LED** | LED on `GPIO 4` | Digital Output | Dynamic blink (250 ms) | Blinks when any sensor flag exhibits a warning |

### 3.2 Sensor Health & Quality Tracking (`health.h`)
The firmware integrates a channel quality tracking mechanism (`ChannelHealth` struct) that evaluates the integrity of every incoming sample:
- **Quality States**: `Init`, `ReadOk`, `NoResponse`, `Stale`, `Invalid`, `Rail`, `Unverified`.
- **Staleness Thresholds**:
  - `IMU_STALE_MS = 500 ms`
  - `FSR_STALE_MS = 500 ms`
  - `TEMP_STALE_MS = 3000 ms`
- **Rail Detection**: `atRail(raw)` flags values within 8 counts of GND ($0$) or $V_{DD}$ ($4095$), signaling disconnected or shorted lines.

### 3.3 Existing Telemetry Assembly (`report()` in `sketch.ino`)
Every 250 ms (4 Hz), the firmware formats a JSON record printed to `Serial`:

```json
{
  "source": "simulation",
  "sequence": 142,
  "elapsed_ms": 35500,
  "oled": "RESPONDING",
  "imu1": {
    "quality": "READ OK",
    "last_success_ms": 35480,
    "accel_m_s2": [0.0421, 9.8102, -0.1542],
    "gyro_deg_s": [0.012, -0.045, 0.089]
  },
  "imu2": {
    "quality": "READ OK",
    "last_success_ms": 35480,
    "accel_m_s2": [-0.0125, 9.7954, 0.2014],
    "gyro_deg_s": [-0.005, 0.012, -0.034]
  },
  "fsr_pot_sim": {
    "quality": "UNVERIFIED",
    "unit": "ADC counts",
    "value": 1845,
    "last_success_ms": 35450
  },
  "temperature": {
    "quality": "UNVERIFIED",
    "unit": "degC",
    "value": 24.85,
    "last_success_ms": 35000
  }
}
```

> **Firmware-to-Network Interface Notice**: The fields printed by `report()` illustrate the raw data categories available in memory. However, the network development module **must not assume it will parse the printed serial JSON string directly**. The actual in-firmware software interface (e.g., exposing an internal C++ telemetry data struct, a shared ring-buffer pointer, or a FreeRTOS event queue) must be formally coordinated and agreed upon with the firmware team.

---

## 4. Proposed Network Architecture Options `[Proposed Design & Pending Team Decisions]`

Two primary architectural paths are under consideration. Neither option has been finalized; both require team evaluation regarding battery limitations, hardware complexity, and application development requirements.

```
========================================================================================
OPTION A: BLE 5.0 + Smartphone Gateway Architecture
+------------+   BLE 5.0 GATT    +-------------------+   HTTPS / WSS   +---------------+
| Wearable   | ----------------> | Smartphone App    | --------------> | Cloud Backend |
| (ESP32-S3) |                   | (Gateway / Cache) |                 | & Database    |
+------------+                   +-------------------+                 +---------------+

OPTION B: Direct ESP32-to-Cloud via Wi-Fi Architecture
+------------+                 802.11 b/g/n Wi-Fi                      +---------------+
| Wearable   | ------------------------------------------------------> | Ingestion     |
| (ESP32-S3) |          (MQTT over TLS / HTTPS / WSS)                  | Broker/Server |
+------------+                                                         +---------------+
========================================================================================
```

### 4.1 Comparative Evaluation

| Architectural Factor | Option A: BLE 5.0 + Mobile Gateway | Option B: Direct ESP32 Wi-Fi |
| :--- | :--- | :--- |
| **Wearable Power Draw** | Significantly lower average draw; illustrative estimates from generic ESP32 datasheets suggest ~5–15 mA during active BLE connection, but empirical profiling on the actual hardware is required. | Higher current peaks during RF transmission; illustrative estimates from generic ESP32 datasheets suggest ~80–180 mA during TX bursts, requiring empirical profiling on the actual hardware. |
| **Power Source Consideration** | Proposed specifications suggest 18650 Li-ion cells, but total battery capacity and operating duration under continuous streaming remain subject to hardware team confirmation. | Higher transmission peaks place greater demand on battery capacity and voltage regulation under continuous streaming. |
| **Network Provisioning** | Not required on brace. Smartphone manages its own cellular/Wi-Fi connection. | Requires on-brace Wi-Fi provisioning (SoftAP captive portal) for home networks. |
| **Client Software Dependency** | **High**: Requires creating and maintaining a dedicated mobile application (iOS/Android). | **Zero**: Brace communicates directly with cloud endpoints without a middle app. |
| **Range & Mobility** | Constrained to within short-range radio distance (~10 meters) of the patient's smartphone. | Operates anywhere within coverage of the patient's home Wi-Fi network. |
| **Offline Buffering Location** | Proposed conceptual designs suggest offloading buffering (e.g. up to 72 hours) to smartphone local storage (such as SQLite), subject to mobile gateway implementation. | Buffering must be handled directly on the wearable hardware (PSRAM / SPIFFS Flash). |

### 4.2 Candidate Uplink Protocols `[Pending Decision with Backend Team]`
For data transit between the edge node (or mobile gateway) and the cloud, three protocols are under evaluation:

1. **MQTT (Message Queuing Telemetry Transport)**:
   - *Strengths*: Minimal packet header overhead (2 bytes), lightweight pub/sub topology, configurable Quality of Service (QoS 0/1/2), integrated keep-alive heartbeats.
   - *Considerations*: Requires running and maintaining an MQTT broker (e.g., Eclipse Mosquitto) adjacent to the backend.
2. **REST over HTTPS**:
   - *Strengths*: Stateless, universally supported by standard web backends (Django / FastAPI), simple batch ingestion (`POST /api/v1/telemetry`).
   - *Considerations*: Significant HTTP header overhead per packet; not optimized for sub-second continuous streaming.
3. **WebSockets (WSS)**:
   - *Strengths*: Full-duplex bidirectional stream over a persistent single TCP connection; immediate propagation to clinician dashboard.
   - *Considerations*: Greater memory overhead per active connection on both client and server; sensitive to transient network disconnections.

### 4.3 Packet Structure & Sizing `[Pending Technical Design]`
While project conceptual documentation mentions an illustrative 24-byte telemetry packet, **the exact binary or text framing has not been finalized or implemented**.

- *Design Task*: The network sub-team must formulate a formal serialization specification. Options include:
  - **Packed Binary Struct**: Fixed-point integer representations (e.g., scaling acceleration floats by $1000$ into `int16_t`) to minimize airtime and comply with standard BLE ATT MTU constraints without fragmentation.
  - **Lightweight JSON**: Retains human-readability and schema evolution at the cost of larger payload size and parsing overhead.

---

## 5. Proposed ESP32 Wi-Fi Provisioning (SoftAP & Captive Portal) `[Proposed Design]`

If Option B (Direct Wi-Fi) or a hybrid dual-mode system is adopted, the wearable brace must provide a user-friendly mechanism for patients to configure their home Wi-Fi credentials without requiring a physical keyboard, display input, or hard-coded source code modifications.

### 5.1 Provisioning Workflow
```
[Power On / Reboot]
        |
        v
[Check Stored Credentials in NVS]
        |
   +----+--------------------------+
   | Valid Credentials Exist?      |
   +----+--------------------------+
        | YES                      | NO / Failed Reconnects (>N attempts [proposed])
        v                          v
[Station (STA) Mode]        [Activate SoftAP Mode]
  Connect to Home Wi-Fi       SSID: e.g., "OrthoSense-Setup-XXXX" [proposed]
        |                     IP: e.g., 192.168.4.1 (Captive Portal) [proposed]
        |                          |
        |                   [Patient Connects Smartphone]
        |                          |
        |                   [Phone Opens Browser / Setup Page]
        |                     Lists scanned SSIDs + Password input
        |                          |
        |                   [Patient Submits Credentials]
        |                          |
        |                   [Save Credentials to NVS / Flash]
        |                          |
        |                   [SoftAP Closes -> Transition to STA Mode]
        v                          v
[Begin Cloud Telemetry Ingestion Pipeline]
```

### 5.2 Key Functional Modules
1. **Credential Persistence**: Utilizes the ESP32 Non-Volatile Storage (`Preferences` / `nvs_flash` partition) to retain SSID and passphrase across power cycles.
2. **Lightweight Web Server & DNS Redirection**: An onboard asynchronous HTTP server that intercepts standard captive portal probe URLs (such as `connectivitycheck.gstatic.com`) to automatically redirect the patient's mobile browser to the setup portal.
   - *Illustrative Parameters*: Values such as SoftAP SSID format (e.g., `OrthoSense-Setup-XXXX`), local gateway IP (e.g., `192.168.4.1`), reconnection attempt limits (e.g., 5 attempts), and recovery button hold times (e.g., 5 seconds) are proposed illustrative defaults that must be configured and tested with the team.
3. **Network Recovery Trigger**: If the patient changes their home router or moves locations, triggering a dedicated hardware button or combination clears stored credentials and forces the brace back into SoftAP provisioning mode.

---

## 6. Security and Patient-Data Requirements `[Proposed Requirements]`

*The following security safeguards represent critical design requirements that must be verified and implemented prior to clinical deployment.*

### 6.1 Over-the-Air Transport Security
- **Wi-Fi Transmissions**: Mandatory TLS 1.2 or TLS 1.3 encryption across all cloud communications (HTTPS, WSS, or MQTT over TLS port 8883).
  - *Broker/Server Verification*: Firmware must validate backend server identity against a trusted CA root certificate embedded in firmware.
- **Bluetooth / BLE Transmissions** (if Option A is selected):
  - Mandatory AES-128 link-layer encryption.
  - Secure pairing and bonding utilizing numeric comparison or dynamic passkeys displayed on the on-brace OLED to prevent unauthorized Man-In-The-Middle (MITM) snooping.
  - Enforcement of BLE Resolvable Private Addresses (RPA) that rotate MAC addresses periodically to prevent external BLE beacons from tracking patient physical movement.

### 6.2 Credential Protection on Wearable Hardware
- Storage of local Wi-Fi passwords and private keys inside protected NVS partitions.
- Production recommendation: Enable ESP32-S3 hardware **Flash Encryption** and **Secure Boot** to prevent physical memory extraction via JTAG or serial bootloader dumps.

### 6.3 Privacy by Design (PII Decoupling) & Regulatory Review
- **Zero Plaintext PII on Wearable**: The brace firmware and wireless payloads must never transmit or store patient names, national identity numbers, contact details, or demographic data.
- **Pseudonymous Identifiers**: Payloads transmit strictly an anonymized device identifier (`device_id`), dynamic rehabilitation session token (`session_id`), monotonic sequence counter, timestamp, and numerical floating-point vectors.
- **Regulatory & Privacy Review**: Association between device IDs and patient medical records occurs exclusively within the access-controlled cloud database. Applicable healthcare privacy regulations and data protection requirements (e.g., institutional ethics standards, local health authority rules, or international standards) must be formally identified, documented, and reviewed by the project team.

---

## 7. Planned Development Phases `[Proposed Roadmap]`

```
+-------------------------------------------------------------------------------+
| PHASE 1: Connectivity Foundation & Provisioning                               |
| - Wi-Fi Station management with exponential backoff re-connection             |
| - SoftAP Captive Portal configuration page prototype                          |
| - Standalone BLE GATT server testbed (for comparative benchmarking)           |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
| PHASE 2: Ingestion Pipeline & Serialization                                   |
| - Formalize binary packed struct vs. JSON payload specifications              |
| - Implement candidate client stack (evaluating MQTT, REST, or WebSocket)       |
| - Deploy minimal test ingestion receiver in coordination with backend team    |
|   (backend framework selection between Django and FastAPI pending consensus)  |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
| PHASE 3: Resilience, Buffering & Transport Security                           |
| - Design offline data buffering engine with automatic catch-up flush          |
| - Resolve RAM vs. Flash persistence trade-off (benchmarking LittleFS/SPIFFS)  |
| - Implement TLS encryption (certificates, secure sockets)                     |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
| PHASE 4: End-to-End Validation & Live Streaming                               |
| - Real-time live telemetry bridge to clinician web dashboard                  |
| - Benchmark packet loss, transmission latency, and empirical battery draw     |
| - Fault injection testing (simulated router outages, packet drops)            |
+-------------------------------------------------------------------------------+
```

---

## 8. Open Technical Questions Requiring Team Agreement `[Pending Team Decisions]`

The following architectural and design decisions must be formally discussed and resolved with the full team before implementation locks in:

### 8.1 Primary Network Architecture Selection
- **Question**: Does the project commit to **Option A (BLE + Dedicated Smartphone App)**, **Option B (Direct ESP32-to-Cloud Wi-Fi)**, or a **Dual-Mode Architecture**?
- **Implication**: Option A requires mobile app development resources outside the current scope. Option B requires empirical battery profiling to verify that Wi-Fi current consumption is sustainable for prescribed daily rehabilitation sessions.

### 8.2 Ingestion Protocol Consensus
- **Question**: Which ingestion protocol will the backend team officially implement and support for wearable ingestion: **MQTT**, **REST (HTTPS)**, or **WebSockets (WSS)**?
- **Implication**: Influences client library footprint on the ESP32, broker infrastructure needs, and server-side connection concurrency models.

### 8.3 Offline Buffering: Volatile RAM vs. Persistent Non-Volatile Flash
- **Context & Dilemma**:
  - The ESP32-S3 module features 8 MB of external PSRAM. Allocating a circular ring buffer in PSRAM easily accommodates tens of thousands of telemetry samples during temporary Wi-Fi dropouts.
  - **However, PSRAM is volatile memory**: If the brace battery depletes completely, or if an unexpected hardware watchdog reset occurs, **all un-transmitted telemetry stored in PSRAM is permanently lost**.
  - Writing continuous telemetry to on-board SPIFFS / LittleFS Flash provides true persistence across power cuts, but introduces:
    1. Flash memory wear (limited erase cycles per sector).
    2. Write latency spikes that could block high-frequency sensor sampling routines.
- **Decision Needed**: Is an in-memory (RAM/PSRAM) circular buffer sufficient for the university prototype demonstration, or must the network layer implement a staged flash-commit strategy for un-transmitted rehabilitation records?

### 8.4 Telemetry Transmission Rate vs. Kinematic Resolution
- **Question**: Should the wireless uplink transmit every 50 Hz kinematic sample, or should edge firmware aggregate/downsample metrics to a lower cadence (e.g., 4 Hz – 10 Hz) for standard network upload, reserving burst transmission only for detected clinical safety violations?
- **Implication**: Directly determines network bandwidth utilization, cloud ingestion storage scaling, and wearable radio airtime.

### 8.5 Backend Framework Alignment
- **Question**: Will the cloud backend be implemented using **Django** or **FastAPI**?
- **Context**: The root `README.md` mentions both Django and FastAPI interchangeably, while the web directory currently contains a Next.js 16 structure. Clear alignment is required to ensure compatible client libraries and API schemas.

### 8.6 Firmware-to-Network In-Memory Interface
- **Question**: How will sensor metrics be handed off from the acquisition loop to the networking task inside the firmware?
- **Context**: Options include passing a pointer to an internal C++ struct, pushing into a FreeRTOS thread-safe queue, or reading from a shared ring buffer. This must be aligned with the firmware developer rather than assuming serial string parsing.

---

### Verification and Approval Notice
This document reflects the verified state of the codebase as of November 2026. Prior to commencing implementation of Phase 1, feedback and sign-off on Section 8 items will be coordinated with the Team Leader (Minhaj Ali) and Product Owner (K.D. Ashen).
