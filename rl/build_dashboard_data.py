from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
COMMON_CSV_PATH = Path("/Users/macseven1seven/Downloads/FR07_FR08_feishu_common_export_2026-04-21.csv")
TIMING_CSV_PATH = Path("/Users/macseven1seven/Downloads/FR07_FR08_feishu_timing_export_2026-04-21.csv")
OUTPUT_PATH = BASE_DIR / "data.js"

MAIN_DIMENSIONS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"]
TIMING_DIMENSIONS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "通知时机"]

RECOMMENDED_FUNNEL_METRICS = [
    "新增用户数",
    "通知授权率_D0",
    "通知展示率_D0",
    "通知点击率_D0",
    "D1留存率",
    "D3留存率",
    "卸载率_D1",
]


def metric_kind(name: str) -> str:
    if name == "新增用户数":
        return "count"
    if "率" in name:
        return "rate"
    if "次数" in name:
        return "average"
    return "value"


def metric_category(name: str) -> str:
    if name in ("新增用户数", "D1留存率", "D3留存率"):
        return "核心表现"
    if name.startswith("通知授权率"):
        return "通知授权"
    if name.startswith("通知展示率") or name.startswith("人均展示次数"):
        return "通知展示"
    if name.startswith("通知点击率") or name.startswith("人均点击次数"):
        return "通知点击"
    if name.startswith("常驻通知栏展示率") or name.startswith("常驻通知栏人均展示次数"):
        return "常驻通知栏展示"
    if name.startswith("常驻通知栏点击率") or name.startswith("常驻通知栏人均点击次数"):
        return "常驻通知栏点击"
    if name.startswith("卸载率"):
        return "卸载"
    return "其他"


def parse_value(field: str, raw: str):
    value = (raw or "").strip()
    if value == "":
        return None
    if field in ("报表日期", "项目代号", "首次访问日期", "国家", "版本号", "通知时机"):
        return value

    normalized = value.replace(",", "")
    if normalized.endswith("%"):
        try:
            return round(float(normalized[:-1]) / 100, 6)
        except ValueError:
            return value

    try:
        number = float(normalized)
    except ValueError:
        return value

    if field == "新增用户数":
        return int(round(number))
    return round(number, 6)


def read_csv_rows(path: Path, rename_map: dict[str, str] | None = None) -> tuple[list[str], list[dict]]:
    rename_map = rename_map or {}
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        original_header = list(reader.fieldnames or [])
        header = [rename_map.get(name, name) for name in original_header]
        rows = []
        for raw_row in reader:
            row = {}
            for original_name, normalized_name in zip(original_header, header):
                row[normalized_name] = parse_value(normalized_name, raw_row.get(original_name, ""))
            rows.append(row)
    return header, rows


def build_payload(common_csv_path: Path, timing_csv_path: Path):
    main_header, main_rows = read_csv_rows(common_csv_path)
    timing_header, timing_rows = read_csv_rows(timing_csv_path, rename_map={"版本": "版本号"})

    main_metrics = [name for name in main_header if name not in MAIN_DIMENSIONS]
    timing_metrics = [name for name in timing_header if name not in TIMING_DIMENSIONS]

    metric_meta = {
        metric: {
            "label": metric,
            "kind": metric_kind(metric),
            "category": metric_category(metric),
        }
        for metric in main_metrics + timing_metrics
    }

    return {
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "workbookPath": f"{common_csv_path.name} | {timing_csv_path.name}",
        "main": {
            "dimensions": MAIN_DIMENSIONS,
            "metrics": main_metrics,
            "rows": main_rows,
            "recommendedFunnelMetrics": RECOMMENDED_FUNNEL_METRICS,
        },
        "timing": {
            "dimensions": TIMING_DIMENSIONS,
            "metrics": timing_metrics,
            "rows": timing_rows,
        },
        "metricMeta": metric_meta,
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Build FR dashboard data.js from two CSV exports.")
    parser.add_argument(
        "--common",
        type=Path,
        default=COMMON_CSV_PATH,
        help="Path to the common metrics CSV.",
    )
    parser.add_argument(
        "--timing",
        type=Path,
        default=TIMING_CSV_PATH,
        help="Path to the timing metrics CSV.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=OUTPUT_PATH,
        help="Path to the generated data.js file.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    payload = build_payload(args.common, args.timing)
    args.output.write_text(
        "window.FR_DASHBOARD_DATA = " + json.dumps(payload, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {args.output}")


if __name__ == "__main__":
    main()
