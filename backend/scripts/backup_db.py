#!/usr/bin/env python
"""
Automated PostgreSQL / SQLite Backup Utility for OrthoSense.
Generates timestamped dumps of clinical records and hardware telemetry.
"""
import os
import sys
import shutil
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

def backup():
    backup_dir = BASE_DIR / "backups"
    backup_dir.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sqlite_db = BASE_DIR / "db.sqlite3"

    if sqlite_db.exists():
        backup_file = backup_dir / f"orthosense_backup_{timestamp}.sqlite3"
        shutil.copy2(sqlite_db, backup_file)
        print(f"Local SQLite database successfully backed up to:\n  {backup_file}")
    else:
        print("Note: If running PostgreSQL, run: pg_dump -U orthosense_user orthosense_db > backup.sql")

if __name__ == "__main__":
    backup()

