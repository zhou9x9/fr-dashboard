from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any


DEFAULT_INPUT_DIR = Path("rm06b_api_attachments")
DEFAULT_OUTPUT = Path("rm_api_dashboard") / "data.js"
DEFAULT_GLOB = "RM*_api_d0_*.csv"
DEFAULT_EVENT_PARAMETER_GLOB = "RM*_event_parameter_*.csv"
DEFAULT_PLAYBACK_GLOB = "RM*_playback*.csv"

DIMENSIONS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "API", "type"]
SPLIT_DIMENSIONS = ["首次访问日期", "国家", "版本号", "type", "报表日期", "项目代号"]
METRICS = ["event_success_rate", "user_success_rate", "event_fail_rate", "user_fail_rate"]
EVENT_PARAMETER_DIMENSIONS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "事件名", "type"]
EVENT_PARAMETER_FIELDS = [
    {"key": "api", "label": "API"},
    {"key": "reason", "label": "reason"},
    {"key": "message", "label": "message"},
]

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
EVENT_PARAMETER_COLUMN_RENAME = {
    "first_session_date": "首次访问日期",
    "project_code": "项目代号",
    "country": "国家",
    "version": "版本号",
    "event_name": "事件名",
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
EVENT_PARAMETER_COUNT_COLUMNS = {"event_count", "total_users"}
PLAYBACK_COLUMN_RENAME = {
    **COLUMN_RENAME,
    "report_date": "报表日期",
    "project_code": "项目代号",
    "first_session_date": "首次访问日期",
    "country": "国家",
    "version": "版本号",
}
PLAYBACK_DIMENSION_CANDIDATES = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "API", "type"]
PLAYBACK_RATE_HINTS = ("rate", "ratio", "percent", "pct")


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


def parse_number(raw: Any) -> int | float | None:
    value = str(raw or "").strip().replace(",", "")
    if not value:
        return None
    if value.endswith("%"):
        return parse_rate(value)
    try:
        number = float(value)
    except ValueError:
        return None
    return int(number) if number.is_integer() else round(number, 8)


def parse_event_parameter_value(field: str, raw: Any) -> Any:
    if field in EVENT_PARAMETER_COUNT_COLUMNS:
        return parse_count(raw) or 0
    value = str(raw or "").strip()
    return value or None


def parse_value(field: str, raw: Any) -> Any:
    if field in METRICS:
        return parse_rate(raw)
    if field in COUNT_COLUMNS:
        return parse_count(raw)
    value = str(raw or "").strip()
    return value or None


def parse_playback_value(field: str, raw: Any) -> Any:
    if field in PLAYBACK_DIMENSION_CANDIDATES:
        return parse_value(field, raw)
    lower_field = field.lower()
    text = str(raw or "").strip()
    if not text:
        return None
    if text.endswith("%") or any(hint in lower_field for hint in PLAYBACK_RATE_HINTS):
        rate = parse_rate(text)
        if rate is not None:
            return rate
    number = parse_number(text)
    return number if number is not None else text


def report_date_from_path(path: Path) -> str | None:
    for text in (path.name, path.parent.name):
        match = re.search(r"\d{4}-\d{2}-\d{2}", text)
        if match:
            return match.group(0)
    return None


def project_code_from_path(path: Path) -> str | None:
    match = re.search(r"(RM\d+[A-Z]?)", path.name, flags=re.IGNORECASE)
    return match.group(1).upper() if match else None


def read_csv_rows(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    default_report_date = report_date_from_path(path)
    default_project_code = project_code_from_path(path)
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            with path.open("r", encoding=encoding, newline="") as handle:
                reader = csv.DictReader(handle)
                for raw_row in reader:
                    if not any(str(value or "").strip() for value in raw_row.values()):
                        continue
                    row: dict[str, Any] = {}
                    if default_report_date:
                        row["报表日期"] = default_report_date
                    if default_project_code:
                        row["项目代号"] = default_project_code
                    for raw_field, raw_value in raw_row.items():
                        field = COLUMN_RENAME.get(raw_field, raw_field)
                        row[field] = parse_value(raw_field, raw_value)
                    if default_report_date:
                        row["报表日期"] = default_report_date
                    if default_project_code:
                        row["项目代号"] = default_project_code
                    rows.append(row)
            return rows
        except Exception as exc:  # noqa: BLE001
            rows = []
            last_error = exc
    raise RuntimeError(f"Failed to read CSV: {path}") from last_error


def read_event_parameter_rows(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    report_date = report_date_from_path(path)
    project_code = project_code_from_path(path)
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            with path.open("r", encoding=encoding, newline="") as handle:
                reader = csv.DictReader(handle)
                original_header = list(reader.fieldnames or [])
                for raw_row in reader:
                    if not any(str(value or "").strip() for value in raw_row.values()):
                        continue
                    row: dict[str, Any] = {"报表日期": report_date}
                    for raw_field in original_header:
                        field = EVENT_PARAMETER_COLUMN_RENAME.get(raw_field, raw_field)
                        row[field] = parse_event_parameter_value(raw_field, raw_row.get(raw_field, ""))
                    if report_date:
                        row["报表日期"] = report_date
                    if project_code:
                        row["项目代号"] = project_code
                    if all(row.get(field) for field in EVENT_PARAMETER_DIMENSIONS if field != "type"):
                        rows.append(row)
            return rows
        except Exception as exc:  # noqa: BLE001
            rows = []
            last_error = exc
    raise RuntimeError(f"Failed to read event parameter CSV: {path}") from last_error


def read_playback_rows(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    report_date = report_date_from_path(path)
    project_code = project_code_from_path(path)
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            with path.open("r", encoding=encoding, newline="") as handle:
                reader = csv.DictReader(handle)
                original_header = list(reader.fieldnames or [])
                for raw_row in reader:
                    if not any(str(value or "").strip() for value in raw_row.values()):
                        continue
                    row: dict[str, Any] = {}
                    if report_date:
                        row["报表日期"] = report_date
                    if project_code:
                        row["项目代号"] = project_code
                    for raw_field in original_header:
                        field = PLAYBACK_COLUMN_RENAME.get(raw_field, raw_field)
                        row[field] = parse_playback_value(field, raw_row.get(raw_field, ""))
                    if report_date:
                        row["报表日期"] = report_date
                    if project_code:
                        row["项目代号"] = project_code
                    if row.get("报表日期") and row.get("项目代号"):
                        rows.append(row)
            return rows
        except Exception as exc:  # noqa: BLE001
            rows = []
            last_error = exc
    raise RuntimeError(f"Failed to read playback CSV: {path}") from last_error


def row_key(row: dict[str, Any]) -> tuple[Any, ...]:
    return tuple(row.get(field) for field in DIMENSIONS)


def event_parameter_row_key(row: dict[str, Any]) -> tuple[Any, ...]:
    return tuple(
        row.get(field)
        for field in EVENT_PARAMETER_DIMENSIONS + [item["key"] for item in EVENT_PARAMETER_FIELDS]
    )


def playback_row_key(row: dict[str, Any], fields: list[str]) -> tuple[Any, ...]:
    return tuple(row.get(field) for field in fields)


def collect_csv_paths(input_dir: Path, pattern: str, include_history: bool = False) -> list[Path]:
    if input_dir.is_file():
        return [input_dir]
    paths = sorted(path for path in input_dir.rglob(pattern) if path.is_file())
    if include_history or not paths:
        return paths
    latest_by_project: dict[str, Path] = {}
    for path in paths:
        project_code = project_code_from_path(path) or "__unknown__"
        current = latest_by_project.get(project_code)
        if current is None or (
            report_date_from_path(path) or "",
            path.stat().st_mtime,
            path.name,
        ) > (
            report_date_from_path(current) or "",
            current.stat().st_mtime,
            current.name,
        ):
            latest_by_project[project_code] = path
    return sorted(latest_by_project.values(), key=lambda path: (project_code_from_path(path) or "", path.name))


def build_payload(csv_paths: list[Path]) -> dict[str, Any]:
    deduped: dict[tuple[Any, ...], dict[str, Any]] = {}
    source_files: list[str] = []

    for path in csv_paths:
        source_files.append(str(path))
        for row in read_csv_rows(path):
            if not all(row.get(field) for field in DIMENSIONS if field != "type"):
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
            str(row.get("type") or ""),
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


def build_event_parameter_payload(csv_paths: list[Path]) -> dict[str, Any]:
    deduped: dict[tuple[Any, ...], dict[str, Any]] = {}
    source_files: list[str] = []

    for path in csv_paths:
        source_files.append(str(path))
        for row in read_event_parameter_rows(path):
            deduped[event_parameter_row_key(row)] = row

    rows = sorted(
        deduped.values(),
        key=lambda row: (
            str(row.get("报表日期") or ""),
            str(row.get("项目代号") or ""),
            str(row.get("首次访问日期") or ""),
            str(row.get("国家") or ""),
            str(row.get("版本号") or ""),
            str(row.get("事件名") or ""),
            str(row.get("type") or ""),
            str(row.get("api") or ""),
            str(row.get("reason") or ""),
            str(row.get("message") or ""),
        ),
    )

    return {
        "sourceFiles": source_files,
        "dimensions": EVENT_PARAMETER_DIMENSIONS,
        "parameterFields": EVENT_PARAMETER_FIELDS,
        "metrics": [
            {"key": "event_count", "label": "事件数", "kind": "count"},
            {"key": "total_users", "label": "用户数", "kind": "count"},
        ],
        "rows": rows,
    }


def ordered_fields(rows: list[dict[str, Any]]) -> list[str]:
    fields: list[str] = []
    for row in rows:
        for field in row:
            if field not in fields:
                fields.append(field)
    return fields


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def playback_metric_kind(field: str) -> str:
    lower_field = field.lower()
    if any(hint in lower_field for hint in PLAYBACK_RATE_HINTS):
        return "rate"
    return "number"


def build_playback_payload(csv_paths: list[Path]) -> dict[str, Any]:
    raw_rows: list[dict[str, Any]] = []
    source_files: list[str] = []

    for path in csv_paths:
        source_files.append(str(path))
        raw_rows.extend(read_playback_rows(path))

    fields = ordered_fields(raw_rows)
    dimensions = [field for field in PLAYBACK_DIMENSION_CANDIDATES if field in fields]
    for field in fields:
        if field in dimensions:
            continue
        values = [row.get(field) for row in raw_rows if row.get(field) is not None]
        if values and not all(is_number(value) for value in values):
            dimensions.append(field)

    metric_fields = [
        field
        for field in fields
        if field not in dimensions
        and any(row.get(field) is not None for row in raw_rows)
        and all(row.get(field) is None or is_number(row.get(field)) for row in raw_rows)
    ]
    all_fields = dimensions + metric_fields
    deduped: dict[tuple[Any, ...], dict[str, Any]] = {}
    for row in raw_rows:
        deduped[playback_row_key(row, all_fields)] = row

    rows = sorted(
        deduped.values(),
        key=lambda row: tuple(str(row.get(field) or "") for field in dimensions),
    )

    return {
        "sourceFiles": source_files,
        "dimensions": dimensions,
        "metrics": [
            {"key": field, "label": field, "kind": playback_metric_kind(field)}
            for field in metric_fields
        ],
        "rows": rows,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build RM API dashboard data.js from RM06B CSV attachments.")
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR, help="Directory or CSV file to read.")
    parser.add_argument("--glob", default=DEFAULT_GLOB, help="CSV glob used when --input-dir is a directory.")
    parser.add_argument("--event-parameter-glob", default=DEFAULT_EVENT_PARAMETER_GLOB, help="Event parameter CSV glob.")
    parser.add_argument("--playback-glob", default=DEFAULT_PLAYBACK_GLOB, help="Playback CSV glob.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Generated data.js path.")
    parser.add_argument("--include-history", action="store_true", help="Read all matched historical attachments.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    csv_paths = collect_csv_paths(args.input_dir, args.glob, args.include_history)
    if not csv_paths:
        raise FileNotFoundError(f"No CSV files matched {args.glob!r} under {args.input_dir}")
    event_parameter_paths = collect_csv_paths(args.input_dir, args.event_parameter_glob, args.include_history)
    playback_paths = collect_csv_paths(args.input_dir, args.playback_glob, args.include_history)

    payload = build_payload(csv_paths)
    payload["eventParameter"] = build_event_parameter_payload(event_parameter_paths) if event_parameter_paths else {
        "sourceFiles": [],
        "dimensions": EVENT_PARAMETER_DIMENSIONS,
        "parameterFields": EVENT_PARAMETER_FIELDS,
        "metrics": [
            {"key": "event_count", "label": "事件数", "kind": "count"},
            {"key": "total_users", "label": "用户数", "kind": "count"},
        ],
        "rows": [],
    }
    payload["playback"] = build_playback_payload(playback_paths) if playback_paths else {
        "sourceFiles": [],
        "dimensions": [],
        "metrics": [],
        "rows": [],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        "window.RM_API_DASHBOARD_DATA = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(
        f"wrote {args.output} with {len(payload['rows'])} API rows, "
        f"{len(payload['eventParameter']['rows'])} event parameter rows, "
        f"{len(payload['playback']['rows'])} playback rows"
    )


if __name__ == "__main__":
    main()
