#pragma once

#include <stdint.h>
#include <math.h>

enum class Quality {
  Init,
  ReadOk,
  NoResponse,
  Stale,
  Invalid,
  Rail,
  Unverified
};

struct ChannelHealth {
  Quality quality = Quality::Init;
  uint32_t lastGood = 0;
  bool hasValue = false;

  void accept(uint32_t now, Quality next) {
    lastGood = now;
    hasValue = true;
    quality = next;
  }

  Quality current(uint32_t now, uint32_t timeout) const {
    if (
      hasValue &&
      (quality == Quality::ReadOk ||
       quality == Quality::Unverified) &&
      uint32_t(now - lastGood) > timeout
    ) {
      return Quality::Stale;
    }

    return quality;
  }
};

inline const char* qualityName(Quality quality) {
  switch (quality) {
    case Quality::Init:
      return "INIT";

    case Quality::ReadOk:
      return "READ OK";

    case Quality::NoResponse:
      return "NO RESPONSE";

    case Quality::Stale:
      return "STALE";

    case Quality::Invalid:
      return "INVALID";

    case Quality::Rail:
      return "RAIL/CHECK";

    default:
      return "UNVERIFIED";
  }
}

inline bool warning(Quality quality) {
  return quality == Quality::NoResponse ||
         quality == Quality::Stale ||
         quality == Quality::Invalid ||
         quality == Quality::Rail;
}

inline bool displayValue(Quality quality) {
  return quality == Quality::ReadOk ||
         quality == Quality::Unverified;
}

constexpr int ADC_MAX = 4095;
constexpr int RAIL_MARGIN = 8;

inline bool atRail(int raw) {
  return raw <= RAIL_MARGIN ||
         raw >= ADC_MAX - RAIL_MARGIN;
}

inline bool ntcCelsius(int raw, float& result) {
  if (raw <= 0 || raw >= ADC_MAX) {
    return false;
  }

  // Wokwi NTC module:
  // 10k thermistor, 10k divider resistor, beta 3950.
  const float inverseK =
    logf(float(raw) / (ADC_MAX - raw)) / 3950.0f +
    1.0f / 298.15f;

  if (!isfinite(inverseK) || inverseK <= 0) {
    return false;
  }

  result = 1.0f / inverseK - 273.15f;

  return isfinite(result);
}