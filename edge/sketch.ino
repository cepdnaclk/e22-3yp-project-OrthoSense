#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "health.h"

// ESP32-S3 GPIO assignments.
constexpr int SDA_PIN = 8;
constexpr int SCL_PIN = 9;
constexpr int FSR_SIM_PIN = 1;
constexpr int NTC_PIN = 2;
constexpr int HEALTH_LED_PIN = 4;

// Sampling and reporting intervals.
constexpr uint32_t IMU_MS = 20;
constexpr uint32_t FSR_MS = 50;
constexpr uint32_t TEMP_MS = 1000;
constexpr uint32_t REPORT_MS = 250;
constexpr uint32_t RETRY_MS = 2000;

// Engineering freshness defaults, not clinical thresholds.
constexpr uint32_t IMU_STALE_MS = 500;
constexpr uint32_t FSR_STALE_MS = 500;
constexpr uint32_t TEMP_STALE_MS = 3000;

constexpr uint8_t OLED_ADDRESS = 0x3C;

Adafruit_SSD1306 screen(128, 64, &Wire, -1);

bool oledReady = false;

struct Imu {
  Adafruit_MPU6050 driver;

  uint8_t address;
  bool ready = false;

  ChannelHealth health;

  float accel[3] = {};
  float gyro[3] = {};

  explicit Imu(uint8_t addr) : address(addr) {}
};

// Explicit declarations for Arduino's sketch preprocessor.
void initializeImu(Imu& imu);
void sampleImu(Imu& imu);
void printImu(const char* name, const Imu& imu, uint32_t now);

Imu imu1(0x68);
Imu imu2(0x69);

ChannelHealth fsrHealth;
ChannelHealth tempHealth;

int fsrRaw = 0;
int tempRaw = 0;

float temperature = NAN;

uint32_t lastImu = 0;
uint32_t lastFsr = 0;
uint32_t lastTemp = 0;
uint32_t lastReport = 0;
uint32_t lastRetry = 0;
uint32_t sequence = 0;

bool present(uint8_t address) {
  Wire.beginTransmission(address);

  return Wire.endTransmission() == 0;
}

void initializeImu(Imu& imu) {
  if (
    !present(imu.address) ||
    !imu.driver.begin(imu.address, &Wire)
  ) {
    imu.ready = false;
    imu.health.quality = Quality::NoResponse;
    return;
  }

  imu.driver.setAccelerometerRange(MPU6050_RANGE_2_G);
  imu.driver.setGyroRange(MPU6050_RANGE_250_DEG);
  imu.driver.setFilterBandwidth(MPU6050_BAND_21_HZ);

  imu.ready = true;

  // Recovered sensors must provide a new measurement.
  imu.health = ChannelHealth{};
}

int16_t signedWord(const uint8_t* bytes) {
  return int16_t(
    (uint16_t(bytes[0]) << 8) |
    bytes[1]
  );
}

void sampleImu(Imu& imu) {
  if (!imu.ready) {
    return;
  }

  // Start at ACCEL_XOUT_H.
  Wire.beginTransmission(imu.address);
  Wire.write(uint8_t(0x3B));

  // Verify both the register selection and full data transfer.
  if (
    Wire.endTransmission(false) != 0 ||
    Wire.requestFrom(imu.address, size_t(14), true) != 14
  ) {
    imu.ready = false;
    imu.health.quality = Quality::NoResponse;
    return;
  }

  uint8_t bytes[14];

  for (int i = 0; i < 14; ++i) {
    bytes[i] = Wire.read();
  }

  for (int i = 0; i < 3; ++i) {
    // Configured range: +/-2 g.
    // Convert to metres per second squared.
    imu.accel[i] =
      signedWord(bytes + i * 2) *
      (9.80665f / 16384.0f);

    // Configured range: +/-250 degrees per second.
    imu.gyro[i] =
      signedWord(bytes + 8 + i * 2) / 131.0f;

    if (
      !isfinite(imu.accel[i]) ||
      !isfinite(imu.gyro[i])
    ) {
      imu.health.quality = Quality::Invalid;
      return;
    }
  }

  imu.health.accept(millis(), Quality::ReadOk);
}

void sampleFsr() {
  // A potentiometer represents this input in the simulation.
  // Counts are not calibrated force or pressure.
  fsrRaw = analogRead(FSR_SIM_PIN);

  fsrHealth.accept(
    millis(),
    atRail(fsrRaw)
      ? Quality::Rail
      : Quality::Unverified
  );
}

void sampleTemperature() {
  tempRaw = analogRead(NTC_PIN);

  if (atRail(tempRaw)) {
    tempHealth.quality = Quality::Rail;
    return;
  }

  float converted;

  if (!ntcCelsius(tempRaw, converted)) {
    tempHealth.quality = Quality::Invalid;
    return;
  }

  temperature = converted;

  // A plausible analog value cannot prove connection health.
  tempHealth.accept(millis(), Quality::Unverified);
}

void printVector(const float* values, bool valid) {
  if (!valid) {
    Serial.print("null");
    return;
  }

  Serial.printf(
    "[%.4f,%.4f,%.4f]",
    values[0],
    values[1],
    values[2]
  );
}

void printImu(
  const char* name,
  const Imu& imu,
  uint32_t now
) {
  Quality quality =
    imu.health.current(now, IMU_STALE_MS);

  Serial.printf(
    "\"%s\":{\"quality\":\"%s\",\"last_success_ms\":",
    name,
    qualityName(quality)
  );

  if (imu.health.hasValue) {
    Serial.print(imu.health.lastGood);
  } else {
    Serial.print("null");
  }

  Serial.print(",\"accel_m_s2\":");
  printVector(imu.accel, displayValue(quality));

  Serial.print(",\"gyro_deg_s\":");
  printVector(imu.gyro, displayValue(quality));

  Serial.print("}");
}

void report(uint32_t now) {
  Quality fsrQuality =
    fsrHealth.current(now, FSR_STALE_MS);

  Quality tempQuality =
    tempHealth.current(now, TEMP_STALE_MS);

  // Local debugging format, not a backend API contract.
  Serial.printf(
    "{\"source\":\"simulation\","
    "\"sequence\":%lu,"
    "\"elapsed_ms\":%lu,"
    "\"oled\":\"%s\",",
    (unsigned long)sequence++,
    (unsigned long)now,
    oledReady ? "RESPONDING" : "NO RESPONSE"
  );

  printImu("imu1", imu1, now);
  Serial.print(",");
  printImu("imu2", imu2, now);

  Serial.printf(
    ",\"fsr_pot_sim\":{"
    "\"quality\":\"%s\","
    "\"unit\":\"ADC counts\","
    "\"value\":",
    qualityName(fsrQuality)
  );

  if (displayValue(fsrQuality)) {
    Serial.print(fsrRaw);
  } else {
    Serial.print("null");
  }

  Serial.print(",\"last_success_ms\":");

  if (fsrHealth.hasValue) {
    Serial.print(fsrHealth.lastGood);
  } else {
    Serial.print("null");
  }

  Serial.printf(
    "},\"temperature\":{"
    "\"quality\":\"%s\","
    "\"unit\":\"degC\","
    "\"value\":",
    qualityName(tempQuality)
  );

  if (displayValue(tempQuality)) {
    Serial.print(temperature, 2);
  } else {
    Serial.print("null");
  }

  Serial.print(",\"last_success_ms\":");

  if (tempHealth.hasValue) {
    Serial.print(tempHealth.lastGood);
  } else {
    Serial.print("null");
  }

  Serial.println("}}");

  if (!oledReady) {
    return;
  }

  screen.clearDisplay();
  screen.setCursor(0, 0);

  screen.println("ORTHOSENSE SIM");

  screen.print("IMU1: ");
  screen.println(
    qualityName(imu1.health.current(now, IMU_STALE_MS))
  );

  screen.print("IMU2: ");
  screen.println(
    qualityName(imu2.health.current(now, IMU_STALE_MS))
  );

  screen.print("FSR*: ");

  if (displayValue(fsrQuality)) {
    screen.print(fsrRaw);
    screen.println(" UNVERIF");
  } else {
    screen.print("-- ");
    screen.println(qualityName(fsrQuality));
  }

  screen.print("TEMP: ");

  if (displayValue(tempQuality)) {
    screen.print(temperature, 1);
    screen.println(" C UNV");
  } else {
    screen.print("-- ");
    screen.println(qualityName(tempQuality));
  }

  screen.println("*POT SIM / UNVERIFIED");
  screen.display();
}

void setup() {
  Serial.begin(115200);

  pinMode(HEALTH_LED_PIN, OUTPUT);
  digitalWrite(HEALTH_LED_PIN, LOW);

  analogReadResolution(12);

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setTimeOut(50);

  Serial.println(
    "OrthoSense simulation started; "
    "synthetic inputs, no clinical interpretation."
  );

  oledReady =
    present(OLED_ADDRESS) &&
    screen.begin(
      SSD1306_SWITCHCAPVCC,
      OLED_ADDRESS,
      false,
      false
    );

  if (oledReady) {
    screen.setTextSize(1);
    screen.setTextColor(SSD1306_WHITE);
    screen.setTextWrap(false);
  }

  initializeImu(imu1);
  initializeImu(imu2);

  sampleFsr();
  sampleTemperature();
}

void loop() {
  uint32_t now = millis();

  if (uint32_t(now - lastImu) >= IMU_MS) {
    lastImu = now;

    sampleImu(imu1);
    sampleImu(imu2);
  }

  if (uint32_t(now - lastFsr) >= FSR_MS) {
    lastFsr = now;
    sampleFsr();
  }

  if (uint32_t(now - lastTemp) >= TEMP_MS) {
    lastTemp = now;
    sampleTemperature();
  }

  if (uint32_t(now - lastRetry) >= RETRY_MS) {
    lastRetry = now;

    if (!imu1.ready) {
      initializeImu(imu1);
    }

    if (!imu2.ready) {
      initializeImu(imu2);
    }

    if (!oledReady && present(OLED_ADDRESS)) {
      oledReady = screen.begin(
        SSD1306_SWITCHCAPVCC,
        OLED_ADDRESS,
        false,
        false
      );

      if (oledReady) {
        screen.setTextSize(1);
        screen.setTextColor(SSD1306_WHITE);
        screen.setTextWrap(false);
      }
    }
  }

  now = millis();

  if (uint32_t(now - lastReport) >= REPORT_MS) {
    lastReport = now;

    if (oledReady && !present(OLED_ADDRESS)) {
      oledReady = false;
    }

    report(now);
  }

  bool fault =
    !oledReady ||
    warning(imu1.health.current(now, IMU_STALE_MS)) ||
    warning(imu2.health.current(now, IMU_STALE_MS)) ||
    warning(fsrHealth.current(now, FSR_STALE_MS)) ||
    warning(tempHealth.current(now, TEMP_STALE_MS));

  // Blink on detectable faults.
  digitalWrite(
    HEALTH_LED_PIN,
    fault && ((now / 250) % 2) ? HIGH : LOW
  );
}