from typing import List, Dict, Any


def downsample_lttb(data: List[Dict[str, Any]], threshold: int) -> List[Dict[str, Any]]:
    """
    Largest-Triangle-Three-Buckets (LTTB) algorithm adapted for multi-channel biomedical telemetry.
    Preserves kinematic peaks, valleys, and zero-crossings.
    """
    if len(data) <= threshold or threshold <= 2:
        return data

    sampled = []
    bucket_size = (len(data) - 2) / (threshold - 2)

    a = 0
    sampled.append(data[a])

    for i in range(threshold - 2):
        # Calculate point average for next bucket (c)
        avg_x = 0.0
        avg_y = 0.0
        avg_range_start = int((i + 1) * bucket_size) + 1
        avg_range_end = min(int((i + 2) * bucket_size) + 1, len(data))
        avg_range_length = avg_range_end - avg_range_start

        if avg_range_length <= 0:
            avg_range_length = 1

        for j in range(avg_range_start, avg_range_end):
            avg_x += data[j].get("timestampMs", j)
            avg_y += (data[j].get("kneeAngleDeg") or 0.0)

        avg_x /= avg_range_length
        avg_y /= avg_range_length

        # Range for current bucket (b)
        range_offs = int(i * bucket_size) + 1
        range_to = min(int((i + 1) * bucket_size) + 1, len(data))

        point_a_x = data[a].get("timestampMs", a)
        point_a_y = data[a].get("kneeAngleDeg") or 0.0

        max_area = -1.0
        max_area_point = range_offs

        for j in range(range_offs, range_to):
            p_x = data[j].get("timestampMs", j)
            p_y = data[j].get("kneeAngleDeg") or 0.0

            # Calculate triangle area over A, B, C
            area = abs(
                (point_a_x - avg_x) * (p_y - point_a_y) -
                (point_a_x - p_x) * (avg_y - point_a_y)
            ) * 0.5

            if area > max_area:
                max_area = area
                max_area_point = j

        sampled.append(data[max_area_point])
        a = max_area_point

    sampled.append(data[-1])
    return sampled

