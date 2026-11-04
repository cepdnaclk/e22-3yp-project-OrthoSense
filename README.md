# OrthoSense — References and External Resources

> **Document Purpose:** Consolidated register of all external references, official documentation, datasheets, and internal project documents used throughout the OrthoSense implementation plan.
>
> **Last Updated:** 2026-11-04

---

## Table of Contents

1. [Web Portal References](#1-web-portal-references)
2. [Backend References](#2-backend-references)
3. [Hardware References](#3-hardware-references)
4. [TinyML References](#4-tinyml-references)
5. [Data and Interoperability References](#5-data-and-interoperability-references)
6. [Project Documents (Internal)](#6-project-documents-internal)
7. [Source Register](#7-source-register)
8. [Important Warnings and Clarifications](#8-important-warnings-and-clarifications)

---

## 1. Web Portal References

These references cover the Next.js-based patient/clinician web portal, its styling system, accessibility standards, and testing frameworks.

| # | Resource | URL | Notes |
|---|----------|-----|-------|
| 1.1 | **Next.js App Router** | <https://nextjs.org/docs/app> | Primary routing paradigm for the portal; uses React Server Components, layouts, and loading states. |
| 1.2 | **Next.js Project Structure** | <https://nextjs.org/docs/app/getting-started/project-structure> | Canonical folder conventions (`app/`, `components/`, `lib/`, `public/`). Follow this for all portal code organization. |
| 1.3 | **Next.js Data Security** | <https://nextjs.org/docs/app/guides/data-security> | Guidance on protecting server-only code, environment variables, and preventing client data leaks. |
| 1.4 | **Tailwind CSS Documentation** | <https://tailwindcss.com/docs> | Utility-first CSS framework used for all portal styling. |
| 1.5 | **WCAG 2.2 Guidelines** | <https://www.w3.org/TR/WCAG22/> | Web Content Accessibility Guidelines — target AA conformance for all patient-facing views. |
| 1.6 | **NHS Design System** | <https://service-manual.nhs.uk/design-system> | Accessibility reference for healthcare UI patterns (colour contrast, typography, form design). Used as a design benchmark, not as a required compliance target. |
| 1.7 | **React Testing Library** | <https://testing-library.com/docs/react-testing-library/intro/> | Component-level testing framework for React; tests user-facing behaviour rather than implementation details. |
| 1.8 | **Playwright** | <https://playwright.dev/docs/intro> | End-to-end browser testing for critical user flows (login, dashboard load, report generation). |

---

## 2. Backend References

These references cover the Django REST Framework API backend, its database, and deployment practices.

| # | Resource | URL | Notes |
|---|----------|-----|-------|
| 2.1 | **Django 5.2 Documentation** | <https://docs.djangoproject.com/en/5.2/> | Core framework documentation for models, views, middleware, and admin. |
| 2.2 | **Django REST Framework** | <https://www.django-rest-framework.org/> | Serializers, viewsets, routers, authentication, and pagination for the REST API. |
| 2.3 | **DRF Permissions** | <https://www.django-rest-framework.org/api-guide/permissions/> | Role-based access control implementation (Patient, Clinician, Admin). |
| 2.4 | **Django Deployment Checklist** | <https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/> | Security and performance checklist — must be completed before any production deployment. |
| 2.5 | **drf-spectacular (OpenAPI)** | <https://drf-spectacular.readthedocs.io/> | Auto-generates OpenAPI 3.x schema from DRF views; used for API documentation and contract testing. |
| 2.6 | **pytest-django** | <https://pytest-django.readthedocs.io/> | Django-aware pytest plugin for model tests, view tests, and database fixtures. |
| 2.7 | **PostgreSQL 16 Documentation** | <https://www.postgresql.org/docs/16/> | Production database engine; reference for indexing, JSONB, partitioning, and performance tuning. |

---

## 3. Hardware References

These references cover the ESP32-S3 edge device, motion sensors, power regulation, and simulation tools.

| # | Resource | URL | Notes |
|---|----------|-----|-------|
| 3.1 | **ESP32-S3 Technical Reference Manual** | <https://www.espressif.com/sites/default/files/documentation/esp32-s3_technical_reference_manual_en.pdf> | Authoritative hardware reference: GPIO, ADC, I²C, SPI, memory map, power modes. |
| 3.2 | **ESP-IDF Programming Guide** | <https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/> | Official Espressif IoT Development Framework; covers FreeRTOS integration, BLE, Wi-Fi, OTA, and deep sleep. |
| 3.3 | **MPU6050 Datasheet** | <https://invensense.tdk.com/products/motion-tracking/6-axis/mpu-6050/> | 6-axis IMU (3-axis accelerometer + 3-axis gyroscope). Primary motion sensor for joint angle measurement. |
| 3.4 | **ADXL345 Datasheet** | <https://www.analog.com/en/products/adxl345.html> | 3-axis digital accelerometer. Supplementary sensor — **accelerometer only, no gyroscope** (see [warnings](#8-important-warnings-and-clarifications)). |
| 3.5 | **MP1584 Manufacturer Page** | <https://www.monolithicpower.com/en/products/power-management/switching-converters-controllers/step-down-buck/converters/mp1584.html> | Step-down (buck) DC-DC converter module. Regulates input voltage to a stable output for the ESP32-S3. |
| 3.6 | **LM2596 Manufacturer Page** | <https://www.ti.com/product/LM2596> | Step-down (buck) DC-DC converter IC. Alternative voltage regulator option for the power subsystem. |
| 3.7 | **Wokwi Simulator** | <https://wokwi.com/> | Browser-based hardware simulator for ESP32 firmware development and logic testing. |
| 3.8 | **Wokwi Analog Limitations** | <https://docs.wokwi.com/parts/wokwi-potentiometer> | Documents what Wokwi can and cannot simulate — analog behaviour and battery circuits are **not** accurately modelled. |
| 3.9 | **Arduino-ESP32 Core** | <https://docs.espressif.com/projects/arduino-esp32/en/latest/> | Arduino framework port for ESP32; used for rapid prototyping with `Wire.h`, `WiFi.h`, and sensor libraries. |

---

## 4. TinyML References

These references cover on-device machine learning inference for real-time posture and motion classification.

| # | Resource | URL | Notes |
|---|----------|-----|-------|
| 4.1 | **TensorFlow Lite for Microcontrollers** | <https://www.tensorflow.org/lite/microcontrollers> | Runtime for deploying quantized ML models on resource-constrained devices (ESP32-S3). |
| 4.2 | **esp-tflite-micro (Espressif Official)** | <https://github.com/espressif/esp-tflite-micro> | Espressif's maintained fork of TFLite Micro, optimized for ESP32-S3 with SIMD acceleration. |
| 4.3 | **TensorFlow Lite Converter** | <https://www.tensorflow.org/lite/convert> | Converts trained Keras/TF models to `.tflite` format for deployment. |
| 4.4 | **Post-Training Quantization** | <https://www.tensorflow.org/lite/performance/post_training_quantization> | INT8 quantization reduces model size and inference latency while maintaining acceptable accuracy. |

---

## 5. Data and Interoperability References

These references cover healthcare data standards and API specification formats for future integration readiness.

| # | Resource | URL | Notes |
|---|----------|-----|-------|
| 5.1 | **HL7 FHIR Observation (R5)** | <https://hl7.org/fhir/R5/observation-profiles.html> | Standard resource for representing clinical measurements. Target schema for ROM and angle data export. |
| 5.2 | **HL7 FHIR Device (R5)** | <https://hl7.org/fhir/R5/device.html> | Standard resource for representing medical devices. Maps to the OrthoSense edge hardware identity. |
| 5.3 | **OpenAPI Specification 3.1** | <https://spec.openapis.org/oas/v3.1.0> | API contract format; generated by drf-spectacular and consumed by the Next.js portal for type-safe API calls. |

> [!IMPORTANT]
> FHIR references (5.1, 5.2) are included for **future interoperability design** only. The current implementation does not claim FHIR compliance or clinical system integration.

---

## 6. Project Documents (Internal)

These are internal planning and specification documents produced during the OrthoSense project lifecycle.

| # | Document | Location | Description |
|---|----------|----------|-------------|
| 6.1 | **Phase 0 Product Specification** | [`PHASE_0_PRODUCT_SPEC.md`](file:///D:/3yp/planning_packages/docs/PHASE_0_PRODUCT_SPEC.md) | Original product vision, scope boundaries, user personas, and system-level requirements. |
| 6.2 | **Data Model and API Contracts** | [`DATA_MODEL_AND_API_CONTRACTS.md`](file:///D:/3yp/planning_packages/docs/DATA_MODEL_AND_API_CONTRACTS.md) | Database schema definitions, entity relationships, and REST API endpoint contracts. |
| 6.3 | **Routes and Permissions** | [`ROUTES_AND_PERMISSIONS.md`](file:///D:/3yp/planning_packages/docs/ROUTES_AND_PERMISSIONS.md) | URL route definitions and role-based permission matrix for all API endpoints and portal pages. |
| 6.4 | **Acceptance Criteria** | [`ACCEPTANCE_CRITERIA.md`](file:///D:/3yp/planning_packages/docs/ACCEPTANCE_CRITERIA.md) | Detailed acceptance criteria for all user stories, organized by feature area. |
| 6.5 | **Phase 1 Handoff** | [`PHASE_1_HANDOFF.md`](file:///D:/3yp/planning_packages/docs/PHASE_1_HANDOFF.md) | Handoff document summarizing Phase 1 deliverables, known issues, and Phase 2 prerequisites. |
| 6.6 | **Component Purchase Document** | *(Physical / photographic evidence)* | Photographs of purchased hardware components serve as procurement evidence. No standalone digital document. |
| 6.7 | **Existing Edge Firmware** | [`sketch.ino`](file:///D:/clone/pyqt/e22-3yp-project-OrthoSense/edge/sketch.ino) + [`health.h`](file:///D:/clone/pyqt/e22-3yp-project-OrthoSense/edge/health.h) | Current ESP32 firmware: sensor reading, BLE transmission, and device health monitoring. |

---

## 7. Source Register

Consolidated table of all referenced sources with classification and current status.

| # | Source | Type | Location | Purpose | Status |
|---|--------|------|----------|---------|--------|
| 1 | Next.js App Router Docs | Official Docs | External URL | Portal routing architecture | Active |
| 2 | Next.js Project Structure | Official Docs | External URL | Code organization standard | Active |
| 3 | Next.js Data Security Guide | Official Docs | External URL | Server-side data protection | Active |
| 4 | Tailwind CSS Docs | Framework | External URL | Portal UI styling | Active |
| 5 | WCAG 2.2 | Standard | External URL | Accessibility compliance target | Active |
| 6 | NHS Design System | Reference | External URL | Healthcare accessibility patterns | Reference Only |
| 7 | Django 5.2 Docs | Official Docs | External URL | Backend framework | Active |
| 8 | Django REST Framework | Framework | External URL | REST API implementation | Active |
| 9 | DRF Permissions Guide | Official Docs | External URL | Role-based access control | Active |
| 10 | Django Deployment Checklist | Official Docs | External URL | Production security review | Active |
| 11 | drf-spectacular | Tool | External URL | OpenAPI schema generation | Active |
| 12 | PostgreSQL 16 Docs | Official Docs | External URL | Database engine reference | Active |
| 13 | ESP32-S3 Technical Reference | Datasheet | External PDF | Microcontroller hardware spec | Active |
| 14 | ESP-IDF Programming Guide | Official Docs | External URL | Firmware development framework | Active |
| 15 | MPU6050 Product Page | Datasheet | External URL | Primary IMU sensor specification | Active |
| 16 | ADXL345 Product Page | Datasheet | External URL | Supplementary accelerometer spec | Active |
| 17 | MP1584 Manufacturer Page | Datasheet | External URL | DC-DC buck converter spec | Reference Only |
| 18 | LM2596 Manufacturer Page | Datasheet | External URL | DC-DC buck converter spec | Reference Only |
| 19 | Wokwi Simulator | Tool | External URL | Firmware logic simulation | Active |
| 20 | TensorFlow Lite Micro | Official Docs | External URL | On-device ML inference | Active |
| 21 | esp-tflite-micro | Framework | GitHub Repo | ESP32-optimized TFLite runtime | Active |
| 22 | TFLite Converter | Tool | External URL | Model format conversion | Active |
| 23 | Post-Training Quantization | Official Docs | External URL | Model size/latency optimization | Active |
| 24 | HL7 FHIR Observation (R5) | Standard | External URL | Future data interoperability | Reference Only |
| 25 | HL7 FHIR Device (R5) | Standard | External URL | Future device identification | Reference Only |
| 26 | OpenAPI Specification 3.1 | Standard | External URL | API contract format | Active |
| 27 | Phase 0 Product Spec | Internal Doc | Local filesystem | Project scope and requirements | Active |
| 28 | Data Model & API Contracts | Internal Doc | Local filesystem | Schema and endpoint definitions | Active |
| 29 | Routes and Permissions | Internal Doc | Local filesystem | Access control matrix | Active |
| 30 | Acceptance Criteria | Internal Doc | Local filesystem | Feature validation criteria | Active |
| 31 | Phase 1 Handoff | Internal Doc | Local filesystem | Phase transition deliverables | Active |
| 32 | Edge Firmware (sketch.ino) | Internal Doc | Main repo | Current device firmware | To Verify |

> [!NOTE]
> **Status Definitions:**
> - **Active** — Currently used in implementation; must stay up to date.
> - **Reference Only** — Consulted for design decisions but not a direct dependency.
> - **To Verify** — Requires review to confirm alignment with current implementation plan.

---

## 8. Important Warnings and Clarifications

> [!CAUTION]
> The following clarifications prevent common misunderstandings about hardware components, simulation accuracy, and standards compliance in this project.

### 8.1 Power Components Are NOT ADCs or Battery Chargers

The **MP1584** and **LM2596** are **step-down (buck) DC-DC converters**. Their sole function is to regulate a higher input voltage down to a stable lower output voltage for the ESP32-S3 and sensor modules.

- ❌ They are **not** analog-to-digital converters (ADCs)
- ❌ They are **not** battery charging ICs
- ❌ They do **not** provide battery level monitoring
- ✅ They **only** perform voltage step-down regulation

### 8.2 ADXL345 Cannot Replace MPU6050 in Fusion Algorithms

The **ADXL345** is a **3-axis accelerometer only**. It does **not** contain a gyroscope.

- Sensor fusion algorithms (complementary filter, Madgwick, Kalman) require **both** accelerometer and gyroscope data
- The ADXL345 **cannot** be used as a drop-in replacement for the MPU6050 in any algorithm that requires angular velocity measurements
- It may serve as a supplementary accelerometer for specific placement points where gyroscope data is not needed

### 8.3 Wokwi Validates Logic, NOT Analog Behaviour

The **Wokwi simulator** is used to validate firmware control flow, I²C communication sequences, and BLE state machines.

- ❌ Wokwi does **not** accurately model analog circuits, battery discharge curves, or voltage regulator behaviour
- ❌ Wokwi does **not** simulate real-world noise, EMI, or signal integrity issues
- ❌ Wokwi potentiometers approximate analog inputs but do **not** replicate NTC thermistor nonlinear response
- ✅ All analog and power-related behaviour **must** be validated on physical hardware

### 8.4 Simulated NTC Thermistor Beta Requires Physical Verification

The firmware uses a **beta constant of 3950** for NTC thermistor temperature calculations (Steinhart-Hart / B-parameter equation). This value:

- Is a common nominal value but varies between manufacturers and component lots
- **Must** be verified against the actual physical thermistor's datasheet and, ideally, a calibrated temperature reference
- Simulated temperature readings in Wokwi are approximations only

### 8.5 FHIR References Are for Future Interoperability

References to **HL7 FHIR R5** resources (Observation, Device) are included to:

- Guide data model design toward future healthcare system interoperability
- Inform field naming and structure conventions

They do **not** imply:

- ❌ Current FHIR compliance or conformance
- ❌ Integration with any existing clinical information system
- ❌ Certification or validation against FHIR Implementation Guides

### 8.6 No Claim of Clinical Validation or Regulatory Approval

OrthoSense is a **university research project**. The system:

- ❌ Has **not** undergone clinical validation trials
- ❌ Does **not** hold any medical device regulatory approval (FDA, CE marking, etc.)
- ❌ Should **not** be used for clinical decision-making without independent professional validation
- ✅ Is intended as a **research prototype** for exploring IoT-based rehabilitation monitoring

---

*This document is maintained as part of the OrthoSense implementation plan. All URLs were verified at the time of document creation. External links may change; verify against the source register if a link becomes unavailable.*
