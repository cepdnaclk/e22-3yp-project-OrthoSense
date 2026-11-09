"""Serial/JSON-lines to HTTPS gateway. No third-party Python dependencies.
Tokens stay in the environment; SQLite stores immutable, bounded retry packets.
"""
import argparse
import json
import os
import random
import sqlite3
import sys
import time
import uuid
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import urlparse

HEALTH = {"READ OK": "READ_OK", "NO RESPONSE": "NO_RESPONSE", "RAIL/CHECK": "RAIL_ERROR",
          "STALE": "STALE", "INVALID": "INVALID", "UNVERIFIED": "UNVERIFIED", "INIT": "UNVERIFIED"}


def encode_debug(record, device, session, boot, sequence, elapsed):
    # This adapter preserves simulation provenance and never invents joint angles.
    sample = {"offset_ms": 0, "health": {"angle": "UNVERIFIED"}, "observed_ms": {}}
    for name in ("imu1", "imu2"):
        channel = record.get(name, {})
        sample["health"][name] = HEALTH.get(channel.get("quality"), "UNVERIFIED")
        if channel.get("last_success_ms") is not None:
            sample["observed_ms"][name] = channel["last_success_ms"]
        accel, gyro = channel.get("accel_m_s2"), channel.get("gyro_deg_s")
        if isinstance(accel, list) and isinstance(gyro, list) and None not in accel + gyro:
            sample[name] = {"accel_m_s2": accel, "gyro_deg_s": gyro}
    for source, target, health in (("fsr_pot_sim", "fsr", "fsr"), ("temperature", "temp_c", "temp")):
        channel = record.get(source, {})
        if channel.get("last_success_ms") is not None:
            sample["observed_ms"][health] = channel["last_success_ms"]
        sample[target] = [channel.get("value")]
        sample["health"][health] = HEALTH.get(channel.get("quality"), "UNVERIFIED")
    if record.get("source") != "simulation":
        raise ValueError("The existing debug encoder accepts simulation records only.")
    return {"schema_version": 1, "source": "simulation", "device_id": device,
            "session_id": session, "boot_id": boot, "sequence_number": sequence,
            "elapsed_ms": elapsed, "samples": [sample]}


class Outbox:
    def __init__(self, path, limit=10000):
        self.db = sqlite3.connect(path)
        self.limit = limit
        self.db.execute("CREATE TABLE IF NOT EXISTS packets (id INTEGER PRIMARY KEY, payload TEXT NOT NULL, attempts INTEGER DEFAULT 0, next_at REAL DEFAULT 0, error TEXT)")

    def enqueue(self, payload):
        if self.db.execute("SELECT COUNT(*) FROM packets").fetchone()[0] >= self.limit:
            raise RuntimeError("Offline buffer full. Stop acquisition; retained samples were not discarded.")
        with self.db:
            self.db.execute("INSERT INTO packets(payload) VALUES (?)", (json.dumps(payload, allow_nan=False),))

    def flush_one(self, send):
        row = self.db.execute("SELECT id,payload,attempts,next_at,error FROM packets ORDER BY id LIMIT 1").fetchone()
        if row is None:
            return False
        key, raw, attempts, next_at, error = row
        if error or time.time() < next_at:
            return False
        payload = json.loads(raw)
        try:
            ack = send(payload)
            if ack.get("session_id") != payload["session_id"] or ack.get("sequence_number") != payload["sequence_number"] or ack.get("status") not in ("stored", "already_stored"):
                raise ValueError("Acknowledgment identity mismatch")
        except HTTPError as exc:
            if 400 <= exc.code < 500 and exc.code != 429:
                with self.db:
                    self.db.execute("UPDATE packets SET error=? WHERE id=?", (f"HTTP {exc.code}: operator action required", key))
                raise RuntimeError(f"HTTP {exc.code}; packet retained. Resolve assignment/lifecycle/credentials before retrying.") from exc
            self.defer(key, attempts)
            return False
        except (URLError, TimeoutError, OSError, ValueError):
            self.defer(key, attempts)
            return False
        with self.db:
            self.db.execute("DELETE FROM packets WHERE id=?", (key,))
        return True

    def defer(self, key, attempts):
        with self.db:
            self.db.execute("UPDATE packets SET attempts=?, next_at=? WHERE id=?", (attempts+1, time.time()+min(60, 2**min(attempts,6))+random.random(), key))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True, help="Full /api/v1/telemetry/ingest/ HTTPS URL")
    parser.add_argument("--outbox", default="gateway-outbox.sqlite3")
    parser.add_argument("--debug-session", help="Convert existing simulation debug JSON for this saved session UUID")
    parser.add_argument("--device", help="Registered device identifier, required with --debug-session")
    parser.add_argument("--allow-local-http", action="store_true")
    parser.add_argument("--flush", action="store_true", help="Drain saved packets without reading stdin")
    args = parser.parse_args()
    parsed = urlparse(args.url)
    if parsed.scheme != "https" and not (args.allow_local_http and parsed.scheme == "http" and parsed.hostname in ("localhost", "127.0.0.1")):
        parser.error("HTTPS is required; local HTTP needs explicit --allow-local-http")
    if args.debug_session and not args.device:
        parser.error("--debug-session requires --device")
    token = os.environ["ORTHOSENSE_DEVICE_TOKEN"]
    outbox = Outbox(args.outbox)
    def send(payload):
        req = Request(args.url, data=json.dumps(payload, allow_nan=False).encode(), headers={"Content-Type": "application/json", "Authorization": "DeviceBearer " + token})
        with urlopen(req, timeout=10) as response:
            return json.load(response)
    if args.flush:
        while outbox.db.execute("SELECT COUNT(*) FROM packets").fetchone()[0]:
            if not outbox.flush_one(send):
                time.sleep(1)
        print("All queued packets acknowledged.", file=sys.stderr)
        return
    boot = str(uuid.uuid4())
    sequence = 0
    for line in sys.stdin:
        if not line.lstrip().startswith("{"):
            continue
        record = json.loads(line)
        if args.debug_session:
            # Device monotonic session offsets, never server receipt time.
            elapsed = record["elapsed_ms"]
            record = encode_debug(record, args.device, args.debug_session, boot, sequence, elapsed)
            sequence += 1
        outbox.enqueue(record)
        while outbox.flush_one(send):
            pass
    remaining = outbox.db.execute("SELECT COUNT(*) FROM packets").fetchone()[0]
    print(f"{remaining} packets pending; use --flush to drain before finishing.", file=sys.stderr)


if __name__ == "__main__":
    main()
