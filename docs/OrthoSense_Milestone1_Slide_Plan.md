# OrthoSense: Project Proposal Presentation Master Slide Plan (15-Minute Edition)
**Course:** CO3060 – Computer Systems Design Project (Milestone 1: Project Proposal)  
**Department:** Department of Computer Engineering, University of Peradeniya  
**Project:** OrthoSense – Multimodal Sensing Framework for Orthopedic Rehab Monitoring  
**Target Duration:** **Strictly 15 Minutes Total (14:00 Presentation + 1:00 Buffer / Transition to Q&A)**  
**Document Status:** Complete Slide-by-Slide Blueprint, Timing Schedule & Calibrated Defense Scripts

---

## 1. 15-Minute Timing Strategy & Speaker Schedule

To strictly adhere to the **15-minute presentation time limit** without rushing or being cut off by the evaluation panel, the presentation is structured into **13 high-impact content slides + 1 permanent Q&A slide**. 

Workload and speaking time are divided evenly across all four team members (~3.5 minutes per member):

```
+---------------------------------------------------------------------------------------------------+
| 15-MINUTE MASTER PRESENTATION TIMELINE                                                            |
+-------------------+--------------------+--------------------+--------------------+----------------+
| [0:00 - 3:30]     | [3:30 - 7:00]      | [7:00 - 10:30]     | [10:30 - 14:00]    | [14:00 - 15:00]|
| M.F.M. Minhaj Ali | H.C.V. Perera      | K.D. Ashen         | W.M.S. Manujitha   | Team Wrap-up   |
| (Team Leader)     | (DSP & Algorithms) | (Hardware & Power) | (Cloud & Logistics)| (Minhaj / All) |
| Slides 1, 2, 3    | Slides 4, 5        | Slides 6, 7, 8     | Slides 9, 10, 11   | Slides 12, 13  |
+-------------------+--------------------+--------------------+--------------------+----------------+
```

### Speaker Breakdown & Time Budget
| Speaker | Member Role & Reg No. | Assigned Slides | Allotted Time | Cumulative Window |
| :--- | :--- | :---: | :---: | :---: |
| **M.F.M. Minhaj Ali** | Team Leader (`E/22/237`) | Slides 1, 2, 3 | 3.5 min | `00:00 – 03:30` |
| **H.C.V. Perera** | Algorithms & DSP (`E/22/280`) | Slides 4, 5 | 3.5 min | `03:30 – 07:00` |
| **K.D. Ashen** | Hardware & Power (`E/22/032`) | Slides 6, 7, 8 | 3.5 min | `07:00 – 10:30` |
| **W.M.S. Manujitha** | Cloud & Full-Stack (`E/22/228`) | Slides 9, 10, 11 | 3.5 min | `10:30 – 14:00` |
| **Team Wrap-Up / Minhaj** | All Members | Slides 12, 13, 14 | 1.0 min | `14:00 – 15:00` |

---

## 2. 15-Minute Master Slide Overview

| # | Slide Title | Allotted Time | Primary Topic / Rubric Area | Speaker |
| :-: | :--- | :---: | :--- | :--- |
| **1** | Title & Project Identification | **0.5 min** | Project Identity, University Credentials & Team Roster | M. Ali |
| **2** | Motivation & Clinical Background (The Real Problem) | **1.5 min** | Post-Op Blind Spot, Vascularization Window, Recall Error | M. Ali |
| **3** | The OrthoSense Paradigm & Viability Benchmark | **1.5 min** | Multimodal Triad vs Standard Care & Commercial Braces | M. Ali |
| **4** | End-to-End Architecture: System Organization & Data Pipeline | **1.5 min** | 4-Layer Hierarchy, 50Hz Sampling, Filtering & DB Tiers | H. Perera |
| **5** | Distributed Control Decisions & Dynamic Fault Tolerance | **2.0 min** | <500ms Edge Trip & Rolling Variance Re-Weighting Matrix | H. Perera |
| **6** | Wearable Hardware Node & Multi-Sensor Suite | **1.5 min** | ESP32-S3 Node, IMU, FSRs, NTCs, Multiplexing & 16-Bit ADC | K. Ashen |
| **7** | Engineering Reasoning Behind Key Technical Design Choices | **1.0 min** | Trade-Off Analysis (Controller, Edge-AI, Sensing, BLE) | K.D. Ashen |
| **8** | Power Architecture, Energy Budget & Rough Bill of Materials | **1.0 min** | >18h Battery Life, Memory Bounds & ~Rs. 8,970 LKR BoM | K.D. Ashen |
| **9** | Technology Stack, Security, Privacy & Clinician Dashboard | **1.5 min** | FreeRTOS, Django/FastAPI, React Portal, HIPAA/GDPR | W. Manujitha |
| **10** | 13-Week Project Timeline & Implementation Roadmap | **1.0 min** | 4 Development Phases & 4 Course Evaluation Milestones | W. Manujitha |
| **11** | Experimental Demonstration & Validation Plan | **1.0 min** | 3-Stage Verification (M2 Benchtop, M3 Faults, M4 Rehab) | W. Manujitha |
| **12** | Team Organization, Work Breakdown & Live Deliverables | **0.5 min** | Member Task Matrix, Live GitHub, Docs Site & ePortfolios | M. Ali |
| **13** | Project Impact & Viability Conclusion | **0.5 min** | Summary of Core Contributions & Engineering Rigor | M. Ali |
| **14** | Q&A, Acknowledgments & Discussion | **--** | Permanent Defense Screen (Contact, GitHub QR, Links) | All Members |

---

## 3. Exhaustive Slide-by-Slide Content & Script Specifications

---

### Slide 1: Title Slide & Project Identification
* **Presenter:** M.F.M. Minhaj Ali (`E/22/237`) – Team Leader
* **Time Allotment:** **0:30** `[00:00 – 00:30]`
* **Objective:** Establish academic professionalism, declare project identity, and introduce team members.
* **Layout & Visuals:**
  * Dark navy/slate theme, University & Department crests in top header.
  * Render of the OrthoSense smart knee brace on right.
  * Badges: `CO3060 3rd Year Project`, `ESP32-S3 Xtensa LX7`, `FreeRTOS`, `Edge-AI`, `BLE 5.0`.
* **Slide Content Elements:**
  * **Main Title:** OrthoSense
  * **Subtitle:** Multimodal Sensing Framework for Orthopedic Rehab Monitoring & Fault-Tolerant Biomechanical Assessment
  * **Course & Department:** CO3060: Computer Systems Design Project | Department of Computer Engineering, University of Peradeniya
  * **Team Designation:** Team 12 (*Team BioKinetics*)
  * **Team Roster:**
    * **M.F.M. Minhaj Ali** (`E/22/237`) – *Team Leader | Embedded AI & Systems Integration*
    * **K.D. Ashen** (`E/22/032`) – *Product Owner | Analog Hardware & Power Architecture*
    * **W.M.S. Manujitha** (`E/22/228`) – *Developer | Cloud Telemetry & Clinician Dashboard*
    * **H.C.V. Perera** (`E/22/280`) – *Developer | Digital Signal Processing & Fault Tolerance*
* **🎤 Presenter Speech (Exact Timing: ~45 words / ~25 sec):**
  > *"Good morning respected evaluators and colleagues. Today, Team 12 presents OrthoSense—an ultra-low-cost, Edge-AI powered multimodal smart knee brace designed to eliminate the critical post-operative rehabilitation blind spot through deterministic real-time safety trips and mathematical fault tolerance."*

---

### Slide 2: Motivation & Clinical Background (The Real-World Problem)
* **Presenter:** M.F.M. Minhaj Ali (`E/22/237`)
* **Time Allotment:** **1:30** `[00:30 – 02:00]`
* **Objective:** Establish clinical urgency and demonstrate deep research into post-operative knee recovery.
* **Layout & Visuals:**
  * Three structured clinical pain-point cards:
    1. *Neovascularization curve* (Graft vulnerability timeline).
    2. *Home recovery vs. clinic calendar* (95% unmonitored blind spot).
    3. *Subjective recall error bar chart* (>60% error rate).
* **Slide Content Elements:**
  * **1. The Critical 2–4 Week Vascularization Window:**
    * Following ACL reconstruction or knee arthroplasty, tendon grafts undergo cellular necrosis followed by neovascularization.
    * Weeks 2 to 4 represent the graft's weakest structural state.
    * Sudden hyperextension (>30° in Week 1) or uncontrolled joint shear permanently stretches or ruptures the graft before bone-tunnel osteointegration occurs.
  * **2. The 2–4 Week Unmonitored Blind Spot:**
    * Patients are discharged with passive mechanical braces and printed exercise sheets.
    * **Over 95% of recovery exercises occur unmonitored at home**; clinical check-ups take place only once every 2–4 weeks.
    * Compensatory limping and joint effusion (swelling) go unnoticed until irreversible joint stiffness sets in.
  * **3. Surgeon Reliance on Subjective Recall:**
    * Surgeons adjust protocols based on patient verbal self-reporting (*"I did 3 sets of 15 reps"*).
    * Clinical studies demonstrate that **>60% of patient self-reports are inaccurate or exaggerated**, blinding surgeons to true biomechanical progress.
* **🎤 Presenter Speech (Exact Timing: ~150 words / ~1 min 15 sec):**
  > *"Every year, thousands of patients undergo major knee surgeries like ACL reconstruction. The first month post-surgery is critical: the transplanted tendon graft is actively vascularizing, meaning it has virtually zero mechanical tensile strength. If a patient hyperextends their knee past 30 degrees during Week 1, the graft permanently stretches. Because local nerves are severed during surgery, the patient feels no pain at the moment of injury.*
  > 
  > *Today, over 95% of rehabilitation occurs unmonitored at home. Patients visit their physical therapist only once every 2 to 4 weeks. When the surgeon asks how exercises are going, more than 60% of patient self-reports are inaccurate. Orthopedic surgeons are forced to make high-stakes medical decisions based on subjective guesswork. This clinical blind spot is what OrthoSense solves."*

---

### Slide 3: The OrthoSense Paradigm & Viability Benchmark
* **Presenter:** M.F.M. Minhaj Ali (`E/22/237`)
* **Time Allotment:** **1:30** `[02:00 – 03:30]`
* **Objective:** Present the solution concept and prove technical & economic viability against commercial competitors.
* **Layout & Visuals:**
  * Benchmark comparison matrix table with bold green indicators for OrthoSense advantages.
* **Slide Content Elements:**
  * **The OrthoSense Innovation:**
    * **Continuous Multimodal Triad:** Simultaneous monitoring of **Range of Motion (IMU)**, **Patellar/Joint Pressure (FSRs)**, and **Inflammation Swelling (NTC Thermistors)**.
    * **Deterministic Edge Safety Cut-Off:** Instant on-brace acoustic/haptic alert triggered in **<500ms** if prescribed limits are breached—completely offline with zero cloud latency.
    * **Graceful Fault Tolerance:** Mathematical sensor re-weighting isolates broken or slipping sensors without firmware crashes.
    * **Extreme Cost Efficiency:** Prototype fabricated for **~Rs. 8,970 LKR (~$25–$30 USD)**.
  * **Solution Viability Benchmark:**

| Evaluation Metric | Standard Clinical Care | Existing Commercial Braces | **OrthoSense (Our Solution)** |
| :--- | :--- | :--- | :--- |
| **Monitoring Window** | Intermittent (every 2–4 wks) | Angle-only (isolated sessions) | **Continuous Multimodal Triad** |
| **Sensory Modalities** | Manual goniometer / Visual | Single IMU or rotary dial | **IMU + FSRs + Thermistors + Piezo** |
| **Safety Trip Latency** | None (Post-injury diagnosis) | 2–5 seconds (Cloud roundtrip) | **< 500 ms (Deterministic on-device)** |
| **System Resilience** | N/A | Fragile (Sensor disconnect crashes MCU) | **Dynamic Variance Re-Weighting Matrix** |
| **Feedback Mechanism** | Subjective recall sheets | Mobile screen alerts only | **Dual On-Brace (Buzzer/Haptic) + Mobile** |
| **System Cost** | Free (Subjective recall only) | $600 – $2,500 USD | **~$25 – $30 USD (~Rs. 8,970 LKR)** |

* **🎤 Presenter Speech (Exact Timing: ~155 words / ~1 min 20 sec):**
  > *"OrthoSense bridges this gap through four core engineering breakthroughs. First, we capture the complete clinical triad: joint angle via a 6-axis IMU, patellar contact pressure via thin-film FSRs, and joint swelling via NTC thermistors.*
  > 
  > *Second, we implement a deterministic, sub-500 millisecond safety cut-off. If a patient exceeds their weekly prescribed flexion angle, on-brace buzzers and vibration motors trip instantly—locally on the hardware, with zero cloud dependency.*
  > 
  > *As shown in our benchmark, commercial systems like Breg or DonJoy cost between $600 and $2,500, track only single-axis rotation, and crash when a sensor detaches. OrthoSense provides continuous multimodal sensing, mathematical fault tolerance, and deterministic safety trips at an estimated prototype outlay of under 9,000 rupees. I will now hand over to Perera to detail our architecture."*

---

### Slide 4: End-to-End Architecture: System Organization & Data Pipeline
* **Presenter:** H.C.V. Perera (`E/22/280`) – Algorithms & DSP
* **Time Allotment:** **1:30** `[03:30 – 05:00]`
* **Objective:** Fulfill CO3060 criteria on system organization, data generation frequencies, filtering, and storage tiers.
* **Layout & Visuals:**
  * Integrated pipeline diagram: **Wearable Sleeve $\rightarrow$ Edge Node $\rightarrow$ Gateway Cache $\rightarrow$ Cloud Backend**.
* **Slide Content Elements:**
  * **High-Level System Organization (4 Layers):**
    * *Layer 1 (Wearable Sleeve):* 6-axis IMU, 3x FSR402 sensors, 4x NTC thermistors, and piezo shock sensor routed via CD74HC4067 multiplexer into a 16-bit ADC.
    * *Layer 2 (Edge Node - ESP32-S3):* Core 0 executes 50Hz sensor acquisition and Butterworth filtering; Core 1 executes TinyML inference and safety trips.
    * *Layer 3 (Gateway Node):* BLE 5.0 GATT connection streaming 24-byte binary telemetry into an encrypted SQLite local cache (72-hour offline buffer).
    * *Layer 4 (Cloud & Dashboard):* Django/FastAPI ingestion microservice, PostgreSQL + TimescaleDB time-series storage, and React clinician web portal.
  * **Data Generation & Sampling Frequencies:**
    * *Joint Kinematics (MPU6050):* **50 Hz** (3-axis angular rates & accelerations).
    * *Patellar/Quadriceps Load (FSR402):* **20 Hz** across medial, lateral, and patellar points.
    * *Joint Swelling Index (NTC MF52):* **1 Hz** differential skin temperature vs. ambient baseline.
    * *Acoustic Joint Clicking (Piezo):* **100 Hz burst** for crepitus and mechanical shock.
  * **Preprocessing & Multi-Tier Storage:**
    * 2nd-order 15Hz digital Butterworth low-pass filter eliminates tremor and 50Hz power hum.
    * Complementary filter fuses gyroscope and accelerometer for drift-free angle tracking.
    * 500-sample circular ring buffer in edge SRAM $\rightarrow$ 72-hour mobile SQLite $\rightarrow$ TimescaleDB hypertables.
* **🎤 Presenter Speech (Exact Timing: ~155 words / ~1 min 20 sec):**
  > *"Thank you, Minhaj. Looking at our system architecture, OrthoSense is organized into four decoupled layers. On the patient's knee, our wearable sleeve captures biomechanical data across dedicated frequencies: joint kinematics are sampled at 50Hz for smooth angular reconstruction, contact pressure at 20Hz, and thermal swelling at 1Hz.*
  > 
  > *These raw signals pass through a 2nd-order 15Hz digital Butterworth filter on the ESP32-S3 to strip away physiological tremor and electrical noise. We fuse accelerometer gravity vectors with gyroscope rates to achieve drift-free joint angles.*
  > 
  > *Our storage architecture uses three tiers: an active 500-sample circular ring buffer in edge SRAM, an encrypted SQLite database on the mobile gateway caching up to 72 hours of offline exercise, and permanent hypertable storage in TimescaleDB. Most importantly, the wearable and edge nodes form an autonomous closed loop—even if the patient's phone disconnects, on-brace safety remains 100% operational."*

---

### Slide 5: Distributed Control Decisions & Dynamic Fault Tolerance
* **Presenter:** H.C.V. Perera (`E/22/280`)
* **Time Allotment:** **2:00** `[05:00 – 07:00]`
* **Objective:** Detail the 4-tier control decision hierarchy and showcase the dynamic sensor fault-tolerance algorithm.
* **Layout & Visuals:**
  * Two-part visual:
    * Left: 4-Tier Control Decision Hierarchy with latency badges.
    * Right: Dynamic Fault-Tolerance flowchart ($\sigma^2$ calculation $\rightarrow$ re-weighting matrix).
* **Slide Content Elements:**
  * **4-Tier Distributed Control Decision Hierarchy:**
    * **Tier 1 (Safety Cut-Off | Edge | < 500 ms):** Evaluates instantaneous angle & load; trips buzzer and vibration motor if angle exceeds weekly limit (e.g. >30° in Wk 1) or contact force > 80N.
    * **Tier 2 (Fault Tolerance | Edge | < 100 ms):** Computes sensor variance $\sigma_i^2$; isolates detached or saturated sensors and redistributes mathematical weights.
    * **Tier 3 (Repetition Coaching | Gateway | < 1 s):** Validates exercise tempo, peak flexion, and hold duration; increments valid reps and delivers audio prompts.
    * **Tier 4 (Protocol Progression | Cloud | Weekly):** Analyzes compliance trends and swelling index; flags clinician dashboard when patient is ready to advance protocol stages.
  * **Dynamic Sensor Fault-Tolerance Algorithm:**
    * **Sliding Window Variance ($\mathbf{N = 50}$ samples):**
      $$\sigma_i^2 = \frac{1}{N} \sum_{k=1}^{N} (x_i[k] - \mu_i)^2$$
    * **Anomaly Classification:**
      * *Flatline ($\sigma_i^2 < \epsilon_{min}$):* Identifies open-circuit or detached wire.
      * *Saturation ($x_i > V_{sat}$):* Identifies short-circuit or physical sensor crushing.
      * *Kinematic De-correlation:* Flags sensor slippage if IMU acceleration does not correlate with FSR pressure cycles.
    * **Dynamic Mathematical Re-Weighting:**
      $$W_{faulty} = 0, \quad W_k = \frac{100\%}{N_{active}} \quad \forall k \in \text{Healthy Sensors}$$
    * **Outcome:** System continues running smoothly without MCU panic or reboot. Error is logged locally and mirrored to clinician portal.
* **🎤 Presenter Speech (Exact Timing: ~180 words / ~1 min 45 sec):**
  > *"Control decisions are strictly partitioned by latency requirements. Emergency safety trips must happen in under 500 milliseconds, so they execute entirely on the ESP32-S3 edge node without touching the cloud. Repetition coaching runs on the mobile gateway within 1 second, while weekly protocol progressions are evaluated in the cloud.*
  > 
  > *Now, consider what happens when a patient exercises: wires pull, sweat accumulates, and sensors shift. In existing research prototypes, if an IMU or pressure wire detaches, the firmware hits a divide-by-zero or NaN state, crashing the microcontroller.*
  > 
  > *OrthoSense eliminates this fragility through our on-chip Dynamic Fault-Tolerance Algorithm. Over a rolling window of 50 samples, we continuously track the variance of each sensor. If a wire breaks, the signal flatlines, dropping variance to near zero. Within 100 milliseconds, our algorithm detects this anomaly, drops that sensor's weight to zero, and redistributes 100% of mathematical weight across the remaining healthy sensors. The patient finishes their session uninterrupted with zero system reboots. I will now hand over to Ashen for the hardware architecture."*

---

### Slide 6: Wearable Hardware Node & Multi-Sensor Suite
* **Presenter:** K.D. Ashen (`E/22/032`) – Product Owner & Hardware
* **Time Allotment:** **1:30** `[07:00 – 08:30]`
* **Objective:** Detail embedded hardware schematics, sensor placement, signal conditioning, and wearable sleeve integration.
* **Layout & Visuals:**
  * Labeled circuit block diagram showing ESP32-S3, multiplexer, external 16-bit ADC, sensor suite, and battery subsystem.
* **Slide Content Elements:**
  * **Core Processing Node:**
    * **ESP32-S3 Nano Development Board:** 240MHz dual-core Xtensa LX7, 512KB SRAM, 8MB PSRAM, native BLE 5.0 and Wi-Fi.
  * **Multimodal Sensor Suite:**
    * *GY-521 (MPU6050):* 6-axis IMU measuring 3D angular velocities and accelerations along femur and tibia segments to calculate flexion/extension.
    * *FSR402 Matrix (3x):* Thin-film force sensors placed over the patellar tendon, medial joint line, and lateral joint line (100g to 10kg force range).
    * *NTC MF52 10kΩ Thermistors (4x):* 1% precision probes measuring localized joint skin temperature vs. ambient baseline.
    * *Piezo Vibration Sensor:* Burst acoustic detection for joint clicking, crepitus, and stumbling shocks.
  * **Signal Conditioning & Multiplexing:**
    * CD74HC4067 16-channel analog multiplexer routes analog sensor lines into a single dedicated external **16-bit precision ADC** over I2C, bypassing electrical noise.
  * **Actuators & Local Biofeedback:**
    * Active 5V acoustic buzzer + miniature ERM tactile vibration motor for immediate safety alerts.
    * 0.96-inch I2C OLED display (128x64) showing live joint angle and battery state.
* **🎤 Presenter Speech (Exact Timing: ~150 words / ~1 min 15 sec):**
  > *"Thank you, Perera. Turning to the hardware design, our wearable sleeve is built around the ESP32-S3 microcontroller running at 240MHz with 8MB of PSRAM and integrated BLE 5.0.*
  > 
  > *Our sensor suite is purposefully positioned across critical anatomical landmarks: the 6-axis IMU spans the knee joint line to capture 3D angular kinematics, three FSR402 thin-film pressure sensors monitor patellar tendon loading and lateral joint contact, and four NTC thermistors measure localized thermal inflammation.*
  > 
  > *Crucially, rather than reading analog signals through the ESP32's internal converter, we route all analog channels through a CD74HC4067 multiplexer into an external 16-bit precision ADC. This shields our force and temperature measurements from high-frequency radio noise and non-linearities, providing medical-grade signal clarity. Immediate biofeedback is delivered right on the brace via an active buzzer, vibration motor, and a compact OLED display."*

---

### Slide 7: Engineering Reasoning Behind Key Technical Design Choices
* **Presenter:** K.D. Ashen (`E/22/032`)
* **Time Allotment:** **1:00** `[08:30 – 09:30]`
* **Objective:** Fulfill the CO3060 rubric requirement on *"Reasoning behind design choices made"* through rigorous trade-off analysis.
* **Layout & Visuals:**
  * 4 structured comparison cards displaying Selected Choice vs. Rejected Alternative with engineering justifications.
* **Slide Content Elements:**
  * **1. ESP32-S3 vs. Arduino Uno / RP2040:**
    * *Why Chosen:* ESP32-S3 features **Xtensa Vector Instructions (PIE)** accelerating INT8 TinyML matrix multiplications by 4–5x. Native dual-core and integrated BLE 5.0 eliminate external breakout boards, reducing PCB footprint.
  * **2. Edge-First Inference vs. Cloud-Only Processing:**
    * *Why Chosen:* Cloud roundtrips introduce 2–5 second network latency. For a patient experiencing sudden hyperextension or knee buckling, a 2-second delay causes injury. Edge execution guarantees deterministic <500ms safety response.
  * **3. Multimodal Triad vs. Single IMU Commercial Braces:**
    * *Why Chosen:* A single IMU suffers from cumulative integration drift and cannot detect soft-tissue swelling or internal joint loading forces. Multimodal sensing provides complete clinical visibility.
  * **4. BLE 5.0 vs. Classic Bluetooth / Continuous Wi-Fi:**
    * *Why Chosen:* Classic Bluetooth draws >40mA continuously. BLE 5.0 2M PHY transmits 24-byte compact packets in bursts with average active current <15mA, extending battery runtime to >18 hours.
* **🎤 Presenter Speech (Exact Timing: ~135 words / ~50 sec):**
  > *"Every hardware decision in OrthoSense is grounded in strict engineering trade-offs. We chose the ESP32-S3 over platforms like Arduino or RP2040 because its Xtensa Vector Instructions accelerate our INT8 TinyML neural network operations by 4 to 5 times, while providing native dual-core execution and onboard BLE.*
  > 
  > *We chose edge-first inference because a 3-second cloud roundtrip is clinically unacceptable when a healing knee is hyperextending. We chose a multimodal triad because a single IMU suffers from drift and cannot detect joint effusion or contact force. And we chose BLE 5.0 because its 2-megabit burst PHY cuts average radio current under 15 milliamps, enabling all-day battery life."*

---

### Slide 8: Power Architecture, Energy Budget & Rough Bill of Materials (BoM)
* **Presenter:** K.D. Ashen (`E/22/032`)
* **Time Allotment:** **1:00** `[09:30 – 10:30]`
* **Objective:** Present power feasibility, battery endurance, and a transparent rough Bill of Materials within the course budget.
* **Layout & Visuals:**
  * Left: Power budget waterfall breakdown & battery life calculation.
  * Right: Structured rough Bill of Materials table.
* **Slide Content Elements:**
  * **Power Architecture & Energy Budget:**
    * **Power Source:** 2x 18650 3.7V 2200mAh Li-ion cells in parallel + TP4056 charge management & BMS protection board.
    * Active Sensor Acquisition & Filtering: ~65 mA.
    * BLE 5.0 Burst Transmission (10Hz telemetry): ~15 mA average.
    * OLED Display & Peripheral Logic: ~12 mA.
    * **Total Average Current Draw: ~92 mA** $\rightarrow$ **>18 Hours Continuous Operation** (ample for full-day monitoring).
  * **Estimated Prototype Budget (Rough Placeholder Values):**

| Component Description | Qty | Procurement Source | Unit Cost (LKR) *(Rough)* | Subtotal (LKR) *(Rough)* |
| :--- | :---: | :--- | :---: | -: |
| **ESP32-S3 Dev Board** (8MB PSRAM) | 1 | Tronic.lk / Local Electronics | ~Rs. 4,500 | ~Rs. 4,500 |
| **FSR402 Pressure Sensors** (3x) | 3 | Tronic.lk / Online Electronics | ~Rs. 950 | ~Rs. 2,850 |
| **NTC 10kΩ Thermistors** (1%) | 4 | Tronic.lk / Local Electronics | ~Rs. 30 | ~Rs. 120 |
| **GY-521 / MPU6050 6-Axis IMU** | 2 | Department Inventory (Item #73) | Free (Dept Stock) | Rs. 0 |
| **16-Bit Precision ADC + Mux** | 1 | Department Inventory (Item #10) | Free (Dept Stock) | Rs. 0 |
| **OLED Display & Buzzer/Piezo** | 1+2 | Department Inventory (Items #71, 31, 21) | Free (Dept Stock) | Rs. 0 |
| **18650 Li-ion Battery Cells + BMS** | 2+1 | Department Inventory (Items #117, 99) | Free (Dept Stock) | Rs. 0 |
| **Neoprene Sleeve & Fastening Straps** | 1 | Local Fabric Market | ~Rs. 1,500 | ~Rs. 1,500 |
| **ESTIMATED TOTAL OUTLAY** | | | | **~Rs. 8,970 LKR (~$25–$30 USD)** |

  *(Note: All monetary figures are initial rough estimates and will be finalized with actual receipts for Milestone 2.)*
* **🎤 Presenter Speech (Exact Timing: ~140 words / ~50 sec):**
  > *"To ensure usability, our power architecture uses dual 18650 Li-ion cells paired with a TP4056 charge and BMS protection board. With the ESP32-S3, sensor suite, and BLE radio operating continuously, average current draw is approximately 92 milliamps—yielding over 18 hours of continuous operation on a single charge.*
  > 
  > *Financially, our prototype strictly respects student project guidelines. By sourcing the IMUs, ADC, displays, and battery cells directly from our department's free inventory, our estimated out-of-pocket procurement cost is approximately 8,970 rupees—well under the 35-dollar student project limit. I will now hand over to Manujitha for our cloud software and timeline."*

---

### Slide 9: Technology Stack, Security, Privacy & Clinician Dashboard
* **Presenter:** W.M.S. Manujitha (`E/22/228`) – Cloud & Full-Stack
* **Time Allotment:** **1:30** `[10:30 – 12:00]`
* **Objective:** Cover the cloud ingestion microservices, database, React portal, and medical data security/privacy standards.
* **Layout & Visuals:**
  * Split screen: Left shows Layered Technology Stack & Security Pillars; Right shows Clinician Web Portal UI mockup.
* **Slide Content Elements:**
  * **Full-Stack Software Architecture:**
    * *Embedded Firmware:* C++17, ESP-IDF v5.x, FreeRTOS dual-core task scheduling, TFLite Micro INT8 inference (<40KB SRAM footprint).
    * *Wireless Protocol:* BLE 5.0 GATT (24-byte packed binary structs), Wi-Fi fallback.
    * *Cloud Telemetry Backend:* Python 3.10+, Django REST Framework (RBAC & auth) + FastAPI (high-throughput WebSockets).
    * *Time-Series Storage:* PostgreSQL 15 + TimescaleDB partitioned hypertables.
    * *Clinician Web Portal:* React 18, Vite, TypeScript, Chart.js for live ROM curves and automated PDF clinical exports.
  * **Security & Ethical Compliance (HIPAA / GDPR Aligned):**
    * *Hardware Security:* ESP32-S3 Secure Boot & Flash Encryption prevent firmware reverse-engineering.
    * *Zero Plaintext PII on Brace:* Only raw numerical floats and randomized session UUIDs are stored on the device.
    * *In-Transit Privacy:* AES-128 BLE encryption during pairing; TLS 1.3 with certificate pinning for cloud traffic.
    * *Cloud Data Integrity:* PostgreSQL AES-256 encryption at rest, JWT Role-Based Access Control, and immutable audit logs.
* **🎤 Presenter Speech (Exact Timing: ~160 words / ~1 min 20 sec):**
  > *"Thank you, Ashen. Our cloud and dashboard infrastructure is built to deliver real-time clinical value while maintaining healthcare-grade data security. Telemetry flows via BLE 5.0 into our Django and FastAPI cloud service, where it is archived into PostgreSQL with TimescaleDB hypertables.*
  > 
  > *Orthopedic surgeons and physical therapists access a responsive React 18 web portal. Here, they can inspect live Range of Motion curves, evaluate repetition quality, track joint swelling trends, and generate automated weekly PDF progress reports.*
  > 
  > *Because medical telemetry demands strict security, OrthoSense is designed around HIPAA and GDPR compliance principles. We enforce hardware Secure Boot and Flash Encryption on the ESP32-S3. Zero patient-identifiable information is ever stored on the physical brace. All wireless transmissions use AES-128 encryption, all cloud connections use TLS 1.3, and all clinician threshold adjustments are permanently recorded in immutable audit logs."*

---

### Slide 10: 13-Week Project Timeline & Implementation Roadmap
* **Presenter:** W.M.S. Manujitha (`E/22/228`)
* **Time Allotment:** **1:00** `[12:00 – 13:00]`
* **Objective:** Present a structured Gantt timeline showing progress across the 4 course evaluation milestones.
* **Layout & Visuals:**
  * 13-Week Gantt chart (`implementation-roadmap.png`) divided into 4 development phases with milestone markers.
* **Slide Content Elements:**
  * **Phase 1: Hardware Procurement & Circuit Design (Weeks 1–4) &rarr; Milestone 1:**
    * Component acquisition from Tronic.lk and department stock.
    * Sensor signal conditioning, multiplexer verification, and breadboard prototype fabrication.
    * Initial benchtop calibration and static weight load tests.
  * **Phase 2: Firmware & Baseline Calibration (Weeks 4–7) &rarr; Milestone 2:**
    * Multi-core FreeRTOS firmware setup on ESP32-S3.
    * 15Hz digital Butterworth noise filter and complementary IMU kinematic fusion.
    * Baseline BLE 5.0 GATT telemetry streaming.
  * **Phase 3: TinyML & Fault-Tolerance (Weeks 7–10) &rarr; Milestone 3:**
    * Movement dataset collection and quantized TensorFlow Lite Micro model training.
    * Dynamic fault-tolerant sensor re-weighting implementation.
    * Benchmarking of emergency safety buzzer trip latency (<500ms).
  * **Phase 4: Cloud, Dashboard & Testing (Weeks 10–13) &rarr; Milestone 4:**
    * Django/FastAPI backend & PostgreSQL time-series schema deployment.
    * React clinician web dashboard with interactive charts and compliance scoring.
    * Full 4-week rehabilitation protocol emulation.
* **🎤 Presenter Speech (Exact Timing: ~140 words / ~50 sec):**
  > *"Our 13-week implementation roadmap is structured into four distinct development phases directly aligned with the course milestones. In Phase 1, we complete hardware procurement, sensor signal conditioning, and breadboard verification for Milestone 1.*
  > 
  > *Phase 2 focuses on embedded firmware: implementing FreeRTOS dual-core tasks, our digital Butterworth filter, and kinematic complementary fusion for Milestone 2. In Phase 3, we train and quantize our TinyML model and stress-test our dynamic fault-tolerance algorithm for Milestone 3.*
  > 
  > *Finally, Phase 4 delivers full cloud integration, our React clinician dashboard, and end-to-end 4-week rehab protocol emulation for Milestone 4. This sequential roadmap ensures every dependency is de-risked before integration."*

---

### Slide 11: Experimental Demonstration & Validation Plan
* **Presenter:** W.M.S. Manujitha (`E/22/228`)
* **Time Allotment:** **1:00** `[13:00 – 14:00]`
* **Objective:** Prove to evaluators that all engineering claims will be validated through measurable, quantitative experiments.
* **Layout & Visuals:**
  * 3-Stage validation roadmap table displaying target quantitative benchmarks and verification protocols.
* **Slide Content Elements:**
  * **Validation Benchmarks Across Milestones:**

| Evaluation Phase | Target Quantitative Benchmark | Experimental Verification Protocol |
| :--- | :--- | :--- |
| **Milestone 2: Benchtop Precision** | • Joint Angle Error $< 3.0^\circ$<br>• FSR Linearity $R^2 > 0.95$ | Static weight loading on FSRs (100g–10kg); NTC thermal calibration against medical IR thermometer; IMU angle benchmarked against manual goniometer. |
| **Milestone 3: Fault Stress & Latency** | • **Zero MCU Crashes**<br>• Safety Trip $< 500\text{ ms}$ | Physical disconnection/open-circuit stress tests during active motion; oscilloscope-timed emergency trip latency upon joint hyperextension (>30°). |
| **Milestone 4: End-to-End Emulation** | • 100% Packet Delivery<br>• Automated PDF Export | Full guided rehabilitation workout sessions on physical wearable knee brace; real-time BLE-to-PostgreSQL ingestion; clinician report generation and alert dispatch. |

* **🎤 Presenter Speech (Exact Timing: ~140 words / ~50 sec):**
  > *"To ensure scientific rigor, we have defined measurable engineering targets for each evaluation milestone. For Milestone 2, our benchtop goal is an angular error of less than 3 degrees verified against a manual clinical goniometer, and an FSR force linearity R-squared exceeding 0.95.*
  > 
  > *For Milestone 3, we validate dependability: achieving zero MCU crashes during physical wire disconnect stress tests, and confirming sub-500 millisecond trip latency via digital oscilloscope.*
  > 
  > *For Milestone 4, we conduct full end-to-end emulation on a wearable knee sleeve, validating 100% packet delivery over BLE and automated clinical PDF export. I will now hand back to Minhaj to conclude."*

---

### Slide 12: Team Organization, Work Breakdown & Live Deliverables
* **Presenter:** M.F.M. Minhaj Ali (`E/22/237`) – Team Leader
* **Time Allotment:** **0:30** `[14:00 – 14:30]`
* **Objective:** Prove balanced workload distribution, clear accountability, and verified live project deliverables.
* **Layout & Visuals:**
  * 4 Member profile cards with roles, assigned WBS tasks, and live screenshots/QR codes of GitHub, Documentation Site, and ePortfolios.
* **Slide Content Elements:**
  * **Team Role & WBS Distribution:**
    * **M.F.M. Minhaj Ali (`E/22/237`):** Team Leader – TinyML INT8 quantization (<40KB SRAM), FreeRTOS dual-core task scheduling, system integration & edge safety trip control loop.
    * **K.D. Ashen (`E/22/032`):** Product Owner – Analog circuitry (16-bit ADC, CD74HC4067 mux), power architecture (18650 Li-ion, BMS & TP4056), and neoprene brace fabrication.
    * **W.M.S. Manujitha (`E/22/228`):** Developer – Django/FastAPI REST & WebSocket cloud backend, PostgreSQL/TimescaleDB time-series schema, and React clinician dashboard.
    * **H.C.V. Perera (`E/22/280`):** Developer – Kinematic IMU sensor fusion, 2nd-order 15Hz Butterworth digital filter, and dynamic sensor variance tracking & re-weighting matrix.
  * **Verified Live Deliverables:**
    * *GitHub Repository:* Initialized at `cepdnaclk/e22-3yp-project-OrthoSense`.
    * *Documentation Website:* Live on GitHub Pages at `cepdnaclk.github.io/e22-3yp-project-OrthoSense/`.
    * *Student ePortfolios:* Active on CourseNetworking (TheCN) for all 4 team members.
* **🎤 Presenter Speech (Exact Timing: ~80 words / ~25 sec):**
  > *"Thank you, Manujitha. Our work breakdown structure distributes technical domains evenly across embedded AI, analog electronics, cloud databases, and digital signal processing.*
  > 
  > *Furthermore, all required academic deliverables are live today: our GitHub repository is structured, our technical documentation website is deployed on GitHub Pages, and all four individual student ePortfolios are fully initialized."*

---

### Slide 13: Project Impact & Viability Conclusion
* **Presenter:** M.F.M. Minhaj Ali (`E/22/237`)
* **Time Allotment:** **0:30** `[14:30 – 15:00]` *(Reaches the 15:00 Hard Stop)*
* **Objective:** Deliver a strong, memorable closing argument summarizing clinical impact, engineering dependability, and affordability.
* **Layout & Visuals:**
  * 3 Key Takeaway Cards highlighting **Clinical Impact**, **Engineering Dependability**, and **Economic Viability**.
* **Slide Content Elements:**
  * **The OrthoSense Value Proposition:**
    * **Eliminates the Post-Op Blind Spot:** Transforms subjective patient memory into continuous, objective biomechanical telemetry.
    * **Deterministic Real-Time Protection:** On-device edge intelligence guarantees <500ms safety trips, preventing graft stretching and re-rupture.
    * **Uncompromised Dependability:** Dynamic variance tracking and sensor re-weighting ensure the system never freezes during active patient movement.
    * **Affordable & Globally Scalable:** Fabricated for ~Rs. 8,970 LKR (~$25–$30 USD), making advanced orthopedic rehabilitation accessible in developing healthcare systems.
  * **Immediate Next Step:** Completion of Phase 1 breadboard assembly and static benchtop sensor calibration for Milestone 2.
* **🎤 Presenter Speech (Exact Timing: ~80 words / ~25 sec):**
  > *"In conclusion, OrthoSense provides an accessible, dependable, and clinically grounded platform that protects patient knee grafts during their most fragile recovery window. By combining multimodal sensing, deterministic edge safety trips, and graceful fault tolerance at under 9,000 rupees, we make clinical-grade rehabilitation available to everyone.*
  > 
  > *Thank you. We are now ready for your questions."*

---

### Slide 14: Q&A, Acknowledgments & Discussion
* **Presenters:** All Team Members
* **Duration:** Open Floor for Panel Q&A
* **Objective:** Remain visible during panel interrogation, displaying contact details, repository QR codes, and acknowledgments.
* **Layout & Visual Design:**
  * Professional closing screen with "Thank You", project repository QR code, contact emails, and academic supervisor acknowledgments.
* **Slide Content Elements:**
  * **Title:** OrthoSense – Team 12 (*Team BioKinetics*)
  * **Course:** CO3060 – Computer Systems Design Project
  * **GitHub Repository:** `github.com/cepdnaclk/e22-3yp-project-OrthoSense`
  * **Documentation Website:** `cepdnaclk.github.io/e22-3yp-project-OrthoSense/`
  * **Contact Email:** `e22237@eng.pdn.ac.lk`
  * **Acknowledgments:** Department of Computer Engineering, University of Peradeniya, course coordinators, and clinical physiotherapy advisors.
  * *“We now warmly welcome questions, critique, and feedback from the evaluation panel.”*

---

## 4. Evaluator Defense Cheat Sheet (Anticipated Questions & Winning Answers)

| # | Evaluator Question | Assigned Respondent | Recommended Technical Defense / Winning Answer |
| :-: | :--- | :---: | :--- |
| **Q1** | *"Why do you need an external 16-bit ADC when the ESP32-S3 already has internal ADCs?"* | **K.D. Ashen** | **Answer:** The ESP32-S3's internal SAR ADC exhibits significant non-linearity below 0.1V and above 2.8V, and experiences severe high-frequency noise spikes whenever the Wi-Fi/BLE radio transmits. Using an external 16-bit ADC over I2C isolates analog signals from RF noise and provides the sub-millivolt resolution necessary for reliable FSR force calibration. |
| **Q2** | *"How does your fault-tolerance algorithm distinguish between a disconnected sensor and a patient holding still?"* | **H.C.V. Perera** | **Answer:** We evaluate a rolling window of 50 samples ($N=50$) to calculate variance $\sigma^2$. A stationary patient holding their leg still produces a baseline physiological micro-tremor with low but non-zero variance ($\sigma^2 > \epsilon$). A broken or disconnected wire flatlines to an exact electrical pull-down value with mathematical zero variance ($\sigma^2 \approx 0$), cleanly distinguishing resting states from open circuits. |
| **Q3** | *"Is a 500ms safety trip latency really fast enough to prevent knee graft re-rupture?"* | **M.F.M. Minhaj Ali** | **Answer:** Yes. Human knee flexion during rehabilitation exercises occurs at angular velocities between 30°/s and 60°/s. Hyperextension through the danger zone takes 600ms to 1200ms. An edge trip executing under 500ms (experimentally clocked at ~180ms) triggers acoustic and tactile biofeedback before the patient can complete the traumatic extension. |
| **Q4** | *"Why did you choose Django and FastAPI together rather than a single framework?"* | **W.M.S. Manujitha** | **Answer:** We utilize Django for administrative features, schema migrations, and user authentication with PostgreSQL, while leveraging FastAPI's asynchronous event loop specifically for high-concurrency WebSocket telemetry streaming from mobile gateways. |
| **Q5** | *"How do you justify claiming the prototype costs only ~Rs. 8,970 LKR when commercial units cost $1,500?"* | **K.D. Ashen** | **Answer:** Commercial braces package expensive custom mechanical carbon fiber frames, proprietary load cells, and heavy regulatory certification markups. By utilizing standard industrial IMUs, thin-film FSRs, and commodity ESP32-S3 microcontrollers with a reusable fabric sleeve, our raw electronic Bill of Materials is strictly kept under Rs. 9,000 LKR. |
