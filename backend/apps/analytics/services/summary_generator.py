from typing import List, Dict, Any, Tuple


def compute_session_summary(telemetry_points: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes summary metrics from raw or ingested telemetry batches:
    - Duration in seconds
    - Max flexion angle and min extension angle
    - Estimated repetitions based on kinematic peak detection
    """
    if not telemetry_points:
        return {
            "duration_seconds": 0,
            "max_flexion_deg": 0.0,
            "max_extension_deg": 0.0,
            "sensor_estimated_reps": 0,
            "quality_flag": "incomplete",
        }

    angles = [p.get("kneeAngleDeg") for p in telemetry_points if p.get("kneeAngleDeg") is not None]
    
    max_flex = max(angles) if angles else 0.0
    min_ext = min(angles) if angles else 0.0

    # Simple zero-crossing / peak detector for reps
    # A repetition is counted when angle rises above 70° and returns below 20°
    reps = 0
    in_rep = False
    for a in angles:
        if a >= 70.0 and not in_rep:
            in_rep = True
        elif a <= 25.0 and in_rep:
            reps += 1
            in_rep = False

    duration_ms = telemetry_points[-1].get("timestampMs", 0) - telemetry_points[0].get("timestampMs", 0)
    duration_seconds = max(int(duration_ms / 1000), 1)

    return {
        "duration_seconds": duration_seconds,
        "max_flexion_deg": round(max_flex, 1),
        "max_extension_deg": round(min_ext, 1),
        "sensor_estimated_reps": reps,
        "quality_flag": "good" if len(angles) > 10 else "degraded",
    }

