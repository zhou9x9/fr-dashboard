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
TIMING_OUTPUT_PATH = BASE_DIR / "timing_data.js"
FEATURE_OUTPUT_PATH = BASE_DIR / "feature_data.js"

MAIN_DIMENSIONS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"]
TIMING_DIMENSIONS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "分析类型", "通知时机"]
FEATURE_DIMENSIONS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "分析类型", "分析对象", "展示格式"]
NOTIFICATION_COPY_DEFAULT_PROJECTS = {"FR001B", "FR002B", "FR005", "FR005B", "FR006", "FR006B"}
METRIC_RENAME_MAP = {"first_open\u6570": "\u65b0\u589e\u7528\u6237\u6570"}

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
    if field in ("报表日期", "项目代号", "首次访问日期", "国家", "版本号", "通知时机", "分析类型", "分析对象", "展示格式"):
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


def normalize_timing_table(header: list[str], rows: list[dict]) -> tuple[list[str], list[dict]]:
    normalized_header = [name for name in header if name != "分析对象"]
    if "分析类型" not in normalized_header:
      insert_at = normalized_header.index("版本号") + 1 if "版本号" in normalized_header else len(TIMING_DIMENSIONS) - 1
      normalized_header.insert(insert_at, "分析类型")
    if "通知时机" not in normalized_header:
      insert_at = normalized_header.index("分析类型") + 1 if "分析类型" in normalized_header else len(TIMING_DIMENSIONS)
      normalized_header.insert(insert_at, "通知时机")

    for row in rows:
        analysis_object = row.get("分析对象") or row.get("通知时机")
        analysis_type = row.get("分析类型")
        if not analysis_type:
            analysis_type = "通知文案" if row.get("项目代号") in NOTIFICATION_COPY_DEFAULT_PROJECTS else "通知时机"
        row["分析类型"] = analysis_type
        row["通知时机"] = analysis_object
        row.pop("分析对象", None)

    return normalized_header, rows


def build_payload(common_csv_path: Path, timing_csv_path: Path, feature_csv_path: Path | None = None):
    main_header, main_rows = read_csv_rows(common_csv_path, rename_map=METRIC_RENAME_MAP)
    timing_header, timing_rows = read_csv_rows(timing_csv_path, rename_map={**METRIC_RENAME_MAP, "\u7248\u672c": "\u7248\u672c\u53f7"})
    timing_header, timing_rows = normalize_timing_table(timing_header, timing_rows)
    if feature_csv_path:
        feature_header, feature_rows = read_csv_rows(feature_csv_path, rename_map={**METRIC_RENAME_MAP, "\u7248\u672c": "\u7248\u672c\u53f7"})
    else:
        feature_header, feature_rows = [], []

    main_metrics = [name for name in main_header if name not in MAIN_DIMENSIONS]
    timing_metrics = [name for name in timing_header if name not in TIMING_DIMENSIONS]
    feature_metrics = [name for name in feature_header if name not in FEATURE_DIMENSIONS]

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
        "feature": {
            "dimensions": FEATURE_DIMENSIONS,
            "metrics": feature_metrics,
            "rows": feature_rows,
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
        "--feature",
        type=Path,
        default=None,
        help="Optional path to the feature module CSV.",
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
    payload = build_payload(args.common, args.timing, args.feature)
    timing_payload = payload.pop("timing")
    feature_payload = payload.pop("feature")
    args.output.write_text(
        "window.FR_DASHBOARD_DATA = " + json.dumps(payload, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    timing_output = args.output.with_name("timing_data.js")
    feature_output = args.output.with_name("feature_data.js")
    timing_output.write_text(
        "window.FR_DASHBOARD_DATA.timing = " + json.dumps(timing_payload, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    feature_output.write_text(
        "window.FR_DASHBOARD_DATA.feature = " + json.dumps(feature_payload, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {args.output}")
    print(f"wrote {timing_output}")
    print(f"wrote {feature_output}")


if __name__ == "__main__":
    main()
