"""Truthful telemetry projection and conservative, prescription-based summaries."""
def telemetry_points(session):
    points = []
    for batch in session.telemetry_batches.order_by("elapsed_ms"):
        payload = batch.raw_payload
        for sample in payload.get("samples", []):
            health = sample.get("health", {})
            fsr, temp = sample.get("fsr", []), sample.get("temp_c", [])
            points.append({
                "timestampMs": batch.elapsed_ms + sample.get("offset_ms", 0),
                "kneeAngleDeg": sample.get("knee_angle_deg"),
                "fsrHeelRaw": fsr[0] if fsr else None,
                "fsrToeRaw": fsr[1] if len(fsr) > 1 else None,
                "skinTemperatureC": temp[0] if temp else None,
                "channelHealth": {key: health.get(key, "UNVERIFIED") for key in ("angle", "fsr", "temp")},
                "source": payload.get("source", "unknown"), "bootId": batch.boot_id,
                "sequenceNumber": batch.sequence_number, "serverReceivedAt": batch.server_received_at.isoformat(),
                "rawSample": sample,
            })
    return points


def summarize(session):
    points = telemetry_points(session)
    def valid_angle(point):
        return point["source"] == "hardware" and point["channelHealth"]["angle"] == "READ_OK" and point["kneeAngleDeg"] is not None
    valid = [p for p in points if valid_angle(p)]
    # Gaps, invalid samples, and reboots reset the repetition detector.
    reps, armed, previous = 0, False, None
    item = session.prescription
    for point in points:
        if not valid_angle(point):
            armed, previous = False, None
            continue
        if previous and (point["bootId"] != previous["bootId"] or point["timestampMs"] - previous["timestampMs"] > 1000 or point["sequenceNumber"] > previous["sequenceNumber"] + 1):
            armed = False
        if item:
            if point["kneeAngleDeg"] >= item.target_flexion_deg:
                armed = True
            elif armed and point["kneeAngleDeg"] <= item.target_extension_deg:
                reps += 1
                armed = False
        previous = point
    # Sum covered intervals only; do not turn pauses or transport gaps into measured duration.
    duration_ms = sum(b["timestampMs"] - a["timestampMs"] for a, b in zip(points, points[1:])
        if valid_angle(a) and valid_angle(b) and b["bootId"] == a["bootId"] and 0 < b["timestampMs"] - a["timestampMs"] <= 1000 and b["sequenceNumber"] <= a["sequenceNumber"] + 1)
    angles = [p["kneeAngleDeg"] for p in valid]
    return {"duration_seconds": duration_ms // 1000,
        "max_flexion_deg": max(angles) if angles else None,
        "max_extension_deg": min(angles) if angles else None,
        "sensor_estimated_reps": reps if item and len(valid) >= 2 else None,
        "quality_flag": "degraded" if valid else "incomplete"}
