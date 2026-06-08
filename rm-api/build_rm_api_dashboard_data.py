from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime
from pathlib import Path
from typing import Any


DEFAULT_INPUT_DIR = Path("rm06b_api_attachments")
DEFAULT_OUTPUT = Path("rm_api_dashboard") / "data.js"
DEFAULT_GLOB = "RM06B_api_d0_export_*.csv"

DIMENSIONS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "API"]
SPLIT_DIMENSIONS = ["项目代号", "API", "国家", "版本号", "报表日期"]
METRICS = ["event_success_rate", "user_success_rate", "event_fail_rate", "user_fail_rate"]

METRIC_META = {
    "event_success_rate": {
        "label": "事件成功率",
        "kind": "rate",
        "components": ["success_events", "request_events"],
    },
    "user_success_rate": {
        "label": "用户成功率",
        "kind": "rate",
        "components": ["success_users", "request_users"],
    },
    "event_fail_rate": {
        "label": "事件失败率",
        "kind": "rate",
        "components": ["fail_events", "request_events"],
    },
    "user_fail_rate": {
        "label": "用户失败率",
        "kind": "rate",
        "components": ["fail_users", "request_users"],
    },
}

COLUMN_RENAME = {
    "report_date": "报表日期",
    "project_code": "项目代号",
    "first_session_date": "首次访问日期",
    "country": "国家",
    "version": "版本号",
    "api": "API",
}

COUNT_COLUMNS = {
    "new_users",
    "request_events",
    "request_users",
    "success_events",
    "success_users",
    "fail_events",
    "fail_users",
}


def parse_rate(raw: Any) -> float | None:
    value = str(raw or "").strip().replace(",", "")
    if not value:
        return None
    has_percent = value.endswith("%")
    if value.endswith("%"):
        value = value[:-1]
    try:
        number = float(value)
    except ValueError:
        return None
    if has_percent:
        return round(number / 100, 8)
    return round(number / 100, 8) if abs(number) > 1.5 else round(number, 8)


def parse_count(raw: Any) -> int | None:
    value = str(raw or "").strip().replace(",", "")
    if not value:
        return None
    try:
        return int(round(float(value)))
    except ValueError:
        return None


def parse_value(field: str, raw: Any) -> Any:
    if field in METRICS:
        return parse_rate(raw)
    if field in COUNT_COLUMNS:
        return parse_count(raw)
    value = str(raw or "").strip()
    return value or None


def read_csv_rows(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            with path.open("r", encoding=encoding, newline="") as handle:
                reader = csv.DictReader(handle)
                for raw_row in reader:
                    if not any(str(value or "").strip() for value in raw_row.values()):
                        continue
                    row: dict[str, Any] = {}
                    for raw_field, raw_value in raw_row.items():
                        field = COLUMN_RENAME.get(raw_field, raw_field)
                        row[field] = parse_value(raw_field, raw_value)
                    rows.append(row)
            return rows
        except Exception as exc:  # noqa: BLE001
            rows = []
            last_error = exc
    raise RuntimeError(f"Failed to read CSV: {path}") from last_error


def row_key(row: dict[str, Any]) -> tuple[Any, ...]:
    return tuple(row.get(field) for field in DIMENSIONS)


def collect_csv_paths(input_dir: Path, pattern: str, include_history: bool = False) -> list[Path]:
    if input_dir.is_file():
        return [input_dir]
    paths = sorted(path for path in input_dir.rglob(pattern) if path.is_file())
    if include_history or not paths:
        return paths
    return [paths[-1]]


def build_payload(csv_paths: list[Path]) -> dict[str, Any]:
    deduped: dict[tuple[Any, ...], dict[str, Any]] = {}
    source_files: list[str] = []

    for path in csv_paths:
        source_files.append(str(path))
        for row in read_csv_rows(path):
            if not all(row.get(field) for field in DIMENSIONS):
                continue
            deduped[row_key(row)] = row

    rows = sorted(
        deduped.values(),
        key=lambda row: (
            str(row.get("报表日期") or ""),
            str(row.get("项目代号") or ""),
            str(row.get("首次访问日期") or ""),
            str(row.get("国家") or ""),
            str(row.get("版本号") or ""),
            str(row.get("API") or ""),
        ),
    )

    return {
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "sourceFiles": source_files,
        "dimensions": DIMENSIONS,
        "splitDimensions": SPLIT_DIMENSIONS,
        "metrics": METRICS,
        "metricMeta": METRIC_META,
        "rows": rows,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build RM API dashboard data.js from RM06B CSV attachments.")
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR, help="Directory or CSV file to read.")
    parser.add_argument("--glob", default=DEFAULT_GLOB, help="CSV glob used when --input-dir is a directory.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Generated data.js path.")
    parser.add_argument("--include-history", action="store_true", help="Read all matched historical attachments.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    csv_paths = collect_csv_paths(args.input_dir, args.glob, args.include_history)
    if not csv_paths:
        raise FileNotFoundError(f"No CSV files matched {args.glob!r} under {args.input_dir}")

    payload = build_payload(csv_paths)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        "window.RM_API_DASHBOARD_DATA = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {args.output} with {len(payload['rows'])} rows from {len(csv_paths)} files")


if __name__ == "__main__":
    main()
