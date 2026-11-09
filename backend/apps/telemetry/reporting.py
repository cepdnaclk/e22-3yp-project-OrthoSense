"""Scoped reporting formulas and a bounded multi-channel telemetry envelope."""
from collections import Counter, defaultdict
from datetime import datetime, time, timedelta, timezone as dt_timezone
import math
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from apps.accounts.models import User, ClinicianAssignment
from apps.devices.models import Device, DeviceAssignment

CHANNELS = {"angle": ("kneeAngleDeg",), "fsr": ("fsrHeelRaw", "fsrToeRaw"), "temp": ("skinTemperatureC",)}


def discontinuity(a, b, channel, key=None):
    return (a.get("bootId") != b.get("bootId") or a.get("source") != b.get("source")
        or b["timestampMs"] - a["timestampMs"] > 1000
        or b.get("sequenceNumber", 0) > a.get("sequenceNumber", 0) + 1
        or a["channelHealth"][channel] != "READ_OK" or b["channelHealth"][channel] != "READ_OK"
        or any(a.get(key) is None or b.get(key) is None for key in ([key] if key else CHANNELS[channel][:1])))


def downsample_envelope(points, limit):
    if not points:
        return []
    selected = {0, len(points)-1}
    keys = [key for values in CHANNELS.values() for key in values]
    key_health = {key:channel for channel,values in CHANNELS.items() for key in values}
    def extrema(indices):
        result = set()
        for key in keys:
            valid = [i for i in indices if isinstance(points[i].get(key), (float, int)) and math.isfinite(points[i][key])]
            for candidates in (valid, [i for i in valid if points[i]["channelHealth"][key_health[key]] == "READ_OK"]):
                if candidates:
                    result.update((min(candidates, key=lambda i: points[i][key]), max(candidates, key=lambda i: points[i][key])))
        return result
    selected.update(extrema(range(len(points))))
    if len(points) <= limit:
        selected = set(range(len(points)))
    else:
        if len(selected) > limit:
            raise ValidationError({"max_points": "Too small to retain channel extrema.", "required_min_points": len(selected)})
        # Add complete per-channel min/max buckets only when they fit the budget.
        buckets = max(1, (limit-len(selected)) // (2*len(keys)))
        for bucket in range(buckets):
            left, right = bucket*len(points)//buckets, (bucket+1)*len(points)//buckets
            candidates = extrema(range(left, right)) - selected
            if len(selected) + len(candidates) <= limit:
                selected.update(candidates)
        # Fill spare capacity with evenly distributed original observations.
        for i in range(limit):
            candidate = round(i*(len(points)-1)/max(1, limit-1))
            if len(selected) < limit:
                selected.add(candidate)
    result, previous = [], None
    for index in sorted(selected):
        point = dict(points[index])
        start = previous if previous is not None else index
        span = points[start:index+1]
        point["gapBefore"] = {channel: any(discontinuity(a,b,channel) for a,b in zip(span, span[1:])) for channel in CHANNELS}
        point["gapBefore"].update({key: any(discontinuity(a,b,channel,key) for a,b in zip(span, span[1:])) for channel,keys in CHANNELS.items() for key in keys})
        point["qualitySummary"] = {channel: dict(Counter(p["channelHealth"][channel] for p in span)) for channel in CHANNELS}
        point["sourceSummary"] = dict(Counter(p.get("source", "unknown") for p in span))
        point["bootSummary"] = dict(Counter(p.get("bootId", "unknown") for p in span))
        result.append(point)
        previous = index
    return result


def clinical_summary(qs, user, params):
    # Inclusive UTC calendar dates; default to today and the previous 29 days.
    today = timezone.now().astimezone(dt_timezone.utc).date()
    start = datetime.fromisoformat(params["date_from"]).date() if params.get("date_from") else today-timedelta(days=29)
    end = datetime.fromisoformat(params["date_to"]).date() if params.get("date_to") else today
    if start > end:
        raise ValidationError({"date_to": "Must be on or after date_from."})
    qs = qs.filter(started_at__gte=datetime.combine(start,time.min,tzinfo=dt_timezone.utc),
        started_at__lte=datetime.combine(end,time.max,tzinfo=dt_timezone.utc))
    patients = User.objects.filter(role=User.Role.PATIENT)
    if user.role == User.Role.CLINICIAN:
        patients = patients.filter(pk__in=ClinicianAssignment.objects.filter(clinician=user,active=True).values("patient_id"))
    elif user.role == User.Role.PATIENT:
        patients = patients.filter(pk=user.pk)
    else:
        patients = patients.none()
    if params.get("patient_id"):
        patients = patients.filter(pk=params["patient_id"])
    devices = Device.objects.filter(pk__in=DeviceAssignment.objects.filter(patient__in=patients,active=True).values("device_id"))
    sessions = list(qs)
    completed = [s for s in sessions if s.status == "completed"]
    # Legacy defaults are not evidence: require prescription binding and a hardware batch.
    measured_ids = set(qs.filter(prescription__isnull=False, telemetry_batches__raw_payload__source="hardware").values_list("id",flat=True))
    groups = {}
    for session in sorted(completed,key=lambda s:(s.started_at,str(s.pk))):
        exercise_id = str(session.prescription.exercise_id) if session.prescription_id else None
        key = (str(session.patient_id),exercise_id,session.exercise_name)
        group = groups.setdefault(key,{"patient_id":str(session.patient_id),"patient_name":session.patient.full_name,
            "exercise_id":exercise_id,"exercise_name":session.exercise_name,"completed_sessions":0,
            "latest_session_id":str(session.pk),"daily":[],"_days":defaultdict(list)})
        group["completed_sessions"] += 1
        group["latest_session_id"] = str(session.pk)
        if session.pk in measured_ids and session.quality_flag != "incomplete" and session.max_flexion_deg is not None:
            group["_days"][session.started_at.astimezone(dt_timezone.utc).date().isoformat()].append(session.max_flexion_deg)
    for group in groups.values():
        group["daily"] = [{"date":day,"mean_max_flexion_deg":round(sum(values)/len(values),2),"measured_sessions":len(values)} for day,values in sorted(group.pop("_days").items())]
        daily = group["daily"]
        group["flexion_change_deg"] = round(daily[-1]["mean_max_flexion_deg"]-daily[0]["mean_max_flexion_deg"],2) if len(daily)>=2 else None
    return {"period":{"date_from":start.isoformat(),"date_to":end.isoformat(),"timezone":"UTC"},
        "patients":patients.count(),"assigned_devices":devices.count(),
        "online_devices":devices.filter(status=Device.Status.ACTIVE,last_seen_at__gte=timezone.now()-timedelta(seconds=90)).count(),
        "sessions":len(sessions),"completed":len(completed),
        "pending_review":sum(not s.doctor_reviewed for s in completed),
        "reviewed":sum(s.doctor_reviewed for s in completed),
        "trends":list(groups.values()),
        "adherence_percent":None,"adherence_reason":"A prescribed schedule-to-session matching rule has not been defined."}
