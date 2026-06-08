const dashboardData = window.RM_API_DASHBOARD_DATA || {
  generatedAt: "",
  sourceFiles: [],
  dimensions: ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "API"],
  splitDimensions: ["项目代号", "API", "国家", "版本号", "报表日期"],
  metrics: ["event_success_rate", "user_success_rate", "event_fail_rate", "user_fail_rate"],
  metricMeta: {},
  rows: [],
};

const DIMENSION_FIELDS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "API"];
const RATE_METRICS = ["event_success_rate", "user_success_rate", "event_fail_rate", "user_fail_rate"].filter((metric) =>
  dashboardData.metrics.includes(metric)
);
const REQUIRED_SPLIT_FIELDS = ["国家", "版本号"];
const CONTROL_CONFIGS = [
  { key: "报表日期", label: "报表日期", type: "filter" },
  { key: "项目代号", label: "项目代号", type: "filter" },
  { key: "首次访问日期", label: "首次访问日期", type: "filter", tall: true },
  { key: "版本号", label: "版本号", type: "filter" },
  { key: "国家", label: "国家", type: "filter" },
  { key: "API", label: "API", type: "filter", tall: true },
  { key: "splitDimensions", label: "拆分维度", type: "split" },
  { key: "metrics", label: "关注指标", type: "metrics" },
];
const FIELD_SHORT_LABELS = {
  报表日期: "报表",
  项目代号: "项目",
  首次访问日期: "首访",
  国家: "国家",
  版本号: "版本",
  API: "API",
};
const COLOR_PALETTE = [
  "#2563eb",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#6d28d9",
  "#0369a1",
  "#4d7c0f",
  "#9d174d",
  "#475569",
  "#c2410c",
  "#047857",
  "#7c3aed",
];

const state = {
  filters: Object.fromEntries(DIMENSION_FIELDS.map((field) => [field, []])),
  splitDimensions: [],
  metrics: [],
  openControl: null,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uniqueValues(rows, field) {
  return [...new Set(rows.map((row) => row[field]))].filter((value) => value !== null && value !== undefined && value !== "");
}

function sortValues(field, values) {
  const copy = values.slice();
  if (field.includes("日期")) {
    return copy.sort();
  }
  if (field === "国家" || field === "版本号") {
    const allValues = copy.filter((value) => value === "ALL" || value === "全部");
    const rest = copy
      .filter((value) => value !== "ALL" && value !== "全部")
      .sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }));
    return [...allValues, ...rest];
  }
  if (field === "项目代号") {
    return copy.sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }));
  }
  return copy.sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }));
}

function optionsFor(field) {
  const values = uniqueValues(dashboardData.rows, field);
  if (field === "项目代号") {
    return sortValues(field, values.filter((value) => value !== "ALL" && value !== "全部"));
  }
  if (field === "版本号") {
    const allValues = values.filter((value) => value === "ALL" || value === "全部");
    const latestVersions = sortValues(field, values.filter((value) => value !== "ALL" && value !== "全部")).slice(-5);
    return [...allValues, ...latestVersions];
  }
  return sortValues(field, values);
}

function metricLabel(metric) {
  return dashboardData.metricMeta[metric]?.label || metric;
}

function optionsForControl(config) {
  if (config.type === "split") {
    return splitDimensionOptions();
  }
  if (config.type === "metrics") {
    return RATE_METRICS;
  }
  return optionsFor(config.key);
}

function selectedForControl(config) {
  if (config.type === "split") {
    return state.splitDimensions;
  }
  if (config.type === "metrics") {
    return state.metrics;
  }
  return state.filters[config.key] || [];
}

function setSelectedForControl(config, values) {
  const next = values.slice();
  if (config.type === "split") {
    state.splitDimensions = next;
    return;
  }
  if (config.type === "metrics") {
    state.metrics = next;
    return;
  }
  state.filters[config.key] = next;
}

function optionLabel(config, value) {
  if (config.type === "metrics") {
    return metricLabel(value);
  }
  return value;
}

function controlSummary(config, selected, options) {
  if (!selected.length) {
    return "未选择";
  }
  if (options.length > 1 && selected.length === options.length) {
    return "全部";
  }
  if (selected.length <= 2) {
    return selected.map((value) => optionLabel(config, value)).join(" / ");
  }
  return `${optionLabel(config, selected[0])} + ${selected.length - 1} 项`;
}

function initDefaults() {
  const reportDates = optionsFor("报表日期");
  const projects = optionsFor("项目代号");
  const firstVisitDates = optionsFor("首次访问日期");
  const countries = optionsFor("国家");
  const versions = optionsFor("版本号");
  const apis = optionsFor("API");

  state.filters["报表日期"] = reportDates.slice(-1);
  state.filters["项目代号"] = projects.slice(0, 1);
  state.filters["首次访问日期"] = firstVisitDates.slice(-5);
  state.filters["国家"] = countries.includes("ALL") ? ["ALL"] : countries.slice(0, 1);
  state.filters["版本号"] = versions.includes("ALL") ? ["ALL"] : versions.slice(-1);
  state.filters["API"] = apis.slice(0, 1);
  state.splitDimensions = ["API"].filter((field) => splitDimensionOptions().includes(field));
  state.metrics = RATE_METRICS.slice();
}

function splitDimensionOptions() {
  return (dashboardData.splitDimensions || [])
    .filter((field) => !REQUIRED_SPLIT_FIELDS.includes(field))
    .filter((field) => optionsFor(field).length > 1);
}

function selectedSet(config) {
  return new Set(selectedForControl(config));
}

function renderControls() {
  const container = document.querySelector("#filters");
  container.innerHTML = CONTROL_CONFIGS.map((config) => {
    const options = optionsForControl(config);
    const selected = selectedForControl(config).filter((value) => options.includes(value));
    setSelectedForControl(config, selected);
    const selectedValues = selectedSet(config);
    const optionsHtml = options
      .map((value) => {
        const checked = selectedValues.has(value) ? "checked" : "";
        return `
          <label class="option-row">
            <input type="checkbox" data-control-key="${escapeHtml(config.key)}" value="${escapeHtml(value)}" ${checked} />
            <span>${escapeHtml(optionLabel(config, value))}</span>
          </label>
        `;
      })
      .join("");
    const openClass = state.openControl === config.key ? " is-open" : "";
    const tallClass = config.tall ? " is-tall" : "";
    return `
      <div class="multi-control${openClass}${tallClass}" data-control="${escapeHtml(config.key)}">
        <div class="label-row">
          <label>${escapeHtml(config.label)}</label>
          <span>${selected.length}/${options.length}</span>
        </div>
        <button class="select-trigger" type="button" data-trigger="${escapeHtml(config.key)}">
          <span>${escapeHtml(controlSummary(config, selected, options))}</span>
          <span aria-hidden="true">⌄</span>
        </button>
        <div class="select-popover">
          <div class="popover-actions">
            <button type="button" data-action="select-all" data-control-key="${escapeHtml(config.key)}">全选</button>
            <button type="button" data-action="clear" data-control-key="${escapeHtml(config.key)}">清空</button>
          </div>
          <div class="option-list">${optionsHtml || `<div class="empty-mini">暂无选项</div>`}</div>
        </div>
      </div>
    `;
  }).join("");
}

function matchesFilter(row, field) {
  const selected = state.filters[field] || [];
  return !selected.length || selected.includes(row[field]);
}

function filteredRows() {
  return dashboardData.rows.filter((row) => DIMENSION_FIELDS.every((field) => matchesFilter(row, field)));
}

function sumField(rows, field) {
  return rows.reduce((sum, row) => {
    const value = Number(row[field]);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}

function averageMetric(metric, rows) {
  let sum = 0;
  let count = 0;
  rows.forEach((row) => {
    const value = Number(row[metric]);
    if (Number.isFinite(value)) {
      sum += value;
      count += 1;
    }
  });
  return count ? sum / count : null;
}

function aggregateMetric(metric, rows) {
  if (!rows.length) {
    return null;
  }
  const components = dashboardData.metricMeta[metric]?.components;
  if (components && components.length === 2) {
    const numerator = sumField(rows, components[0]);
    const denominator = sumField(rows, components[1]);
    if (denominator > 0) {
      return numerator / denominator;
    }
  }
  return averageMetric(metric, rows);
}

function formatRate(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "NA";
  }
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function activeSplitDimensions(rows) {
  const fields = new Set(state.splitDimensions);
  REQUIRED_SPLIT_FIELDS.forEach((field) => {
    if ((state.filters[field] || []).length > 1) {
      fields.add(field);
    }
  });
  return [...fields].filter((field) => {
    if (!dashboardData.splitDimensions.includes(field)) {
      return false;
    }
    return uniqueValues(rows, field).length > 1 || (state.filters[field] || []).length > 1;
  });
}

function seriesLabel(metric, splitFields, row, rows) {
  const parts = [];
  if (state.metrics.length > 1) {
    parts.push(metricLabel(metric));
  }
  splitFields.forEach((field) => {
    const values = uniqueValues(rows, field);
    const selectedCount = (state.filters[field] || []).length;
    if (values.length > 1 || selectedCount > 1) {
      parts.push(`${FIELD_SHORT_LABELS[field] || field}:${row[field]}`);
    }
  });
  return parts.length ? parts.join(" · ") : metricLabel(metric);
}

function buildSeries(rows) {
  const xValues = sortValues("首次访问日期", uniqueValues(rows, "首次访问日期"));
  const splitFields = activeSplitDimensions(rows);
  const seriesMap = new Map();

  state.metrics.forEach((metric) => {
    rows.forEach((row) => {
      const xValue = row["首次访问日期"];
      const splitKey = splitFields.map((field) => row[field] ?? "NA").join("||");
      const key = `${metric}||${splitKey}`;
      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          metric,
          label: seriesLabel(metric, splitFields, row, rows),
          buckets: new Map(),
        });
      }
      const series = seriesMap.get(key);
      if (!series.buckets.has(xValue)) {
        series.buckets.set(xValue, []);
      }
      series.buckets.get(xValue).push(row);
    });
  });

  return {
    xValues,
    series: [...seriesMap.values()]
      .map((series) => ({
        metric: series.metric,
        label: series.label,
        points: xValues.map((xValue) => aggregateMetric(series.metric, series.buckets.get(xValue) || [])),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "zh-Hans-CN", { numeric: true })),
  };
}

function linePath(points, xForIndex, yForValue) {
  const commands = [];
  points.forEach((value, index) => {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      return;
    }
    const command = commands.length ? "L" : "M";
    commands.push(`${command}${xForIndex(index).toFixed(2)},${yForValue(value).toFixed(2)}`);
  });
  return commands.join(" ");
}

function tickIndexes(length, maxTicks) {
  if (length <= maxTicks) {
    return Array.from({ length }, (_, index) => index);
  }
  const result = new Set([0, length - 1]);
  const step = (length - 1) / (maxTicks - 1);
  for (let index = 1; index < maxTicks - 1; index += 1) {
    result.add(Math.round(index * step));
  }
  return [...result].sort((a, b) => a - b);
}

function renderChart(rows) {
  const chartNode = document.querySelector("#line-chart");
  const legendNode = document.querySelector("#chart-legend");
  const countNode = document.querySelector("#chart-count");

  if (!rows.length || !state.metrics.length) {
    chartNode.innerHTML = `<div class="empty-state">当前筛选下暂无数据</div>`;
    legendNode.innerHTML = "";
    countNode.textContent = "0 条记录";
    return;
  }

  const { xValues, series } = buildSeries(rows);
  const values = series.flatMap((item) => item.points).filter((value) => Number.isFinite(Number(value)));
  if (!xValues.length || !values.length) {
    chartNode.innerHTML = `<div class="empty-state">当前筛选下暂无可绘制指标</div>`;
    legendNode.innerHTML = "";
    countNode.textContent = `${rows.length.toLocaleString("zh-CN")} 条记录`;
    return;
  }

  const width = 1040;
  const height = 400;
  const margin = { top: 28, right: 26, bottom: 60, left: 68 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(...values, 0.01);
  const yMax = maxValue <= 1 ? Math.min(1, Math.max(0.1, Math.ceil(maxValue * 10) / 10)) : Math.ceil(maxValue * 10) / 10;
  const xForIndex = (index) => {
    if (xValues.length === 1) {
      return margin.left + innerWidth / 2;
    }
    return margin.left + (innerWidth * index) / (xValues.length - 1);
  };
  const yForValue = (value) => margin.top + innerHeight - (Number(value) / yMax) * innerHeight;
  const yTicks = Array.from({ length: 6 }, (_, index) => (yMax * index) / 5);
  const xTicks = tickIndexes(xValues.length, 8);

  const grid = yTicks
    .map((tick) => {
      const y = yForValue(tick);
      return `
        <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" class="grid-line" />
        <text x="${margin.left - 12}" y="${y + 4}" text-anchor="end" class="axis-label">${formatRate(tick)}</text>
      `;
    })
    .join("");
  const xLabels = xTicks
    .map((index) => {
      const x = xForIndex(index);
      return `
        <line x1="${x}" y1="${height - margin.bottom}" x2="${x}" y2="${height - margin.bottom + 6}" class="axis-tick" />
        <text x="${x}" y="${height - margin.bottom + 24}" text-anchor="middle" class="axis-label">${escapeHtml(xValues[index])}</text>
      `;
    })
    .join("");
  const lines = series
    .map((item, index) => {
      const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
      const dash = item.metric.includes("fail") ? " stroke-dasharray=\"7 5\"" : "";
      const points = item.points
        .map((value, pointIndex) => {
          if (!Number.isFinite(Number(value))) {
            return "";
          }
          return `
            <circle cx="${xForIndex(pointIndex)}" cy="${yForValue(value)}" r="3.5" fill="${color}">
              <title>${escapeHtml(item.label)} ${escapeHtml(xValues[pointIndex])}: ${formatRate(value)}</title>
            </circle>
          `;
        })
        .join("");
      return `
        <path d="${linePath(item.points, xForIndex, yForValue)}" fill="none" stroke="${color}" stroke-width="2.4"${dash} />
        ${points}
      `;
    })
    .join("");

  chartNode.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="RM API 指标趋势折线图">
      <rect x="0" y="0" width="${width}" height="${height}" class="chart-bg" />
      ${grid}
      <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis-line" />
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis-line" />
      ${xLabels}
      ${lines}
    </svg>
  `;
  legendNode.innerHTML = series
    .map((item, index) => `
      <span class="legend-item">
        <i style="background:${COLOR_PALETTE[index % COLOR_PALETTE.length]}"></i>
        ${escapeHtml(item.label)}
      </span>
    `)
    .join("");
  countNode.textContent = `${rows.length.toLocaleString("zh-CN")} 条记录 · ${series.length} 条线`;
}

function renderDetailTable(rows) {
  const table = document.querySelector("#detail-table");
  const countNode = document.querySelector("#detail-count");
  const groups = new Map();
  rows.forEach((row) => {
    const api = row["API"];
    if (!groups.has(api)) {
      groups.set(api, []);
    }
    groups.get(api).push(row);
  });

  const apiOrder = optionsFor("API").filter((api) => groups.has(api));
  const header = `
    <thead>
      <tr>
        <th>API</th>
        ${RATE_METRICS.map((metric) => `<th>${escapeHtml(metricLabel(metric))}</th>`).join("")}
      </tr>
    </thead>
  `;
  const body = apiOrder
    .map((api) => {
      const apiRows = groups.get(api) || [];
      return `
        <tr>
          <td class="api-cell">${escapeHtml(api)}</td>
          ${RATE_METRICS.map((metric) => {
            const activeClass = state.metrics.includes(metric) ? " is-focused" : "";
            return `<td class="number-cell${activeClass}">${formatRate(aggregateMetric(metric, apiRows))}</td>`;
          }).join("")}
        </tr>
      `;
    })
    .join("");

  table.innerHTML = header + `<tbody>${body || `<tr><td colspan="${RATE_METRICS.length + 1}" class="empty-table">当前筛选下暂无数据</td></tr>`}</tbody>`;
  countNode.textContent = `${apiOrder.length} 个 API`;
}

function renderMeta() {
  document.querySelector("#generated-at").textContent = dashboardData.generatedAt || "未生成";
  document.querySelector("#source-count").textContent = `${(dashboardData.sourceFiles || []).length} 个附件`;
  document.querySelector("#row-count").textContent = `${dashboardData.rows.length.toLocaleString("zh-CN")} 行`;
}

function renderAll() {
  renderControls();
  const rows = filteredRows();
  renderChart(rows);
  renderDetailTable(rows);
  renderMeta();
}

function configForKey(key) {
  return CONTROL_CONFIGS.find((config) => config.key === key);
}

function handleControlClick(event) {
  const trigger = event.target.closest("[data-trigger]");
  if (trigger) {
    const key = trigger.dataset.trigger;
    state.openControl = state.openControl === key ? null : key;
    renderControls();
    return;
  }

  const action = event.target.closest("[data-action]");
  if (!action) {
    return;
  }
  const config = configForKey(action.dataset.controlKey);
  if (!config) {
    return;
  }
  const options = optionsForControl(config);
  setSelectedForControl(config, action.dataset.action === "select-all" ? options : []);
  state.openControl = config.key;
  renderAll();
}

function handleControlChange(event) {
  const input = event.target.closest("input[data-control-key]");
  if (!input) {
    return;
  }
  const config = configForKey(input.dataset.controlKey);
  if (!config) {
    return;
  }
  const selected = selectedForControl(config).slice();
  if (input.checked && !selected.includes(input.value)) {
    selected.push(input.value);
  }
  if (!input.checked) {
    const index = selected.indexOf(input.value);
    if (index >= 0) {
      selected.splice(index, 1);
    }
  }
  setSelectedForControl(config, selected);
  state.openControl = config.key;
  renderAll();
}

document.addEventListener("DOMContentLoaded", () => {
  initDefaults();
  const filters = document.querySelector("#filters");
  filters.addEventListener("click", (event) => {
    event.stopPropagation();
    handleControlClick(event);
  });
  filters.addEventListener("change", handleControlChange);
  document.addEventListener("click", () => {
    if (state.openControl) {
      state.openControl = null;
      renderControls();
    }
  });
  renderAll();
});
