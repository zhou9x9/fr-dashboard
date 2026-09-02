const dashboardData = window.RM_API_DASHBOARD_DATA || {
  generatedAt: "",
  sourceFiles: [],
  dimensions: ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "API", "type"],
  splitDimensions: ["首次访问日期", "国家", "版本号", "type", "报表日期", "项目代号"],
  metrics: ["event_success_rate", "user_success_rate", "event_fail_rate", "user_fail_rate"],
  metricMeta: {},
  rows: [],
  eventParameter: {
    sourceFiles: [],
    dimensions: ["报表日期", "项目代号", "首次访问日期", "版本号", "国家", "事件名", "type"],
    parameterFields: [
      { key: "api", label: "API" },
      { key: "reason", label: "reason" },
      { key: "message", label: "message" },
    ],
    metrics: [
      { key: "event_count", label: "事件数", kind: "count" },
      { key: "total_users", label: "用户数", kind: "count" },
    ],
    rows: [],
  },
  playback: {
    sourceFiles: [],
    dimensions: ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"],
    metrics: [],
    rows: [],
  },
};

const eventParameterData = dashboardData.eventParameter || {
  sourceFiles: [],
  dimensions: ["报表日期", "项目代号", "首次访问日期", "版本号", "国家", "事件名", "type"],
  parameterFields: [
    { key: "api", label: "API" },
    { key: "reason", label: "reason" },
    { key: "message", label: "message" },
  ],
  metrics: [
    { key: "event_count", label: "事件数", kind: "count" },
    { key: "total_users", label: "用户数", kind: "count" },
  ],
  rows: [],
};
const playbackData = dashboardData.playback || {
  sourceFiles: [],
  dimensions: ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"],
  metrics: [],
  rows: [],
};

const MENU_OVERVIEW = "api_overview";
const MENU_API = "api";
const MENU_PLAYBACK = "playback";
const MENU_EVENT_PARAMETER = "event_parameter";
const DIMENSION_FIELDS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "API", "type"];
const OVERVIEW_FILTER_FIELDS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"];
const PLAYBACK_FILTER_FIELDS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"];
const EVENT_PARAMETER_DIMENSION_FIELDS = ["报表日期", "项目代号", "首次访问日期", "版本号", "国家", "事件名", "type"];
const EVENT_PARAMETER_FILTER_FIELDS = [...EVENT_PARAMETER_DIMENSION_FIELDS, "api"];
const ALL_FILTER_FIELDS = [...new Set([...DIMENSION_FIELDS, ...PLAYBACK_FILTER_FIELDS, ...EVENT_PARAMETER_FILTER_FIELDS])];
const SINGLE_SELECT_FIELDS = [];
const ALL_EXCLUSIVE_FIELDS = ["版本号", "type"];
const OVERVIEW_FIXED_TYPE = "0";
const OVERVIEW_MIN_NEW_USERS = 200;
const RATE_METRICS = ["event_success_rate", "user_success_rate", "event_fail_rate", "user_fail_rate"].filter((metric) =>
  dashboardData.metrics.includes(metric)
);
const PLAYBACK_COUNT_FIELDS = [
  "request_events",
  "request_users",
  "success_events",
  "success_users",
  "fail_events",
  "fail_users",
];
const COUNT_FIELD_LABELS = {
  new_users: "新增用户数",
  request_events: "请求事件数",
  request_users: "请求用户数",
  success_events: "成功事件数",
  success_users: "成功用户数",
  fail_events: "失败事件数",
  fail_users: "失败用户数",
};
const CHART_SPLIT_FIELDS = ["API", "国家", "版本号", "type"];
const DETAIL_SPLIT_FIELDS = ["首次访问日期", "国家", "版本号", "type", "报表日期", "项目代号"];
const API_CONTROL_CONFIGS = [
  { key: "报表日期", label: "报表日期", type: "filter" },
  { key: "项目代号", label: "项目代号", type: "filter" },
  { key: "首次访问日期", label: "首次访问日期", type: "filter", tall: true },
  { key: "版本号", label: "版本号", type: "filter" },
  { key: "国家", label: "国家", type: "filter" },
  { key: "API", label: "API", type: "filter", tall: true },
  { key: "type", label: "type", type: "filter" },
  { key: "splitDimensions", label: "拆分维度", type: "split" },
  { key: "metrics", label: "关注指标", type: "metrics" },
];
const OVERVIEW_CONTROL_CONFIGS = [
  { key: "报表日期", label: "报表日期", type: "filter" },
  { key: "项目代号", label: "项目代号", type: "filter" },
  { key: "首次访问日期", label: "首次访问日期", type: "filter", tall: true },
  { key: "版本号", label: "版本号", type: "filter" },
  { key: "国家", label: "国家", type: "filter" },
  { key: "metrics", label: "关注指标", type: "metrics" },
];
const PLAYBACK_CONTROL_CONFIGS = [
  { key: "报表日期", label: "报表日期", type: "filter" },
  { key: "项目代号", label: "项目代号", type: "filter" },
  { key: "首次访问日期", label: "首次访问日期", type: "filter", tall: true },
  { key: "版本号", label: "版本号", type: "filter" },
  { key: "国家", label: "国家", type: "filter" },
  { key: "metrics", label: "关注指标", type: "metrics" },
];
const EVENT_PARAMETER_CONTROL_CONFIGS = [
  { key: "报表日期", label: "报表日期", type: "filter" },
  { key: "项目代号", label: "项目代号", type: "filter" },
  { key: "首次访问日期", label: "首次访问日期", type: "filter", tall: true },
  { key: "版本号", label: "版本号", type: "filter" },
  { key: "国家", label: "国家", type: "filter" },
  { key: "事件名", label: "事件名", type: "filter", tall: true },
  { key: "type", label: "type", type: "filter" },
  { key: "api", label: "API", type: "filter", tall: true },
];
const FIELD_SHORT_LABELS = {
  报表日期: "报表",
  项目代号: "项目",
  首次访问日期: "首访",
  国家: "国家",
  版本号: "版本",
  API: "API",
  type: "type",
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
  activeMenu: MENU_API,
  filters: Object.fromEntries(ALL_FILTER_FIELDS.map((field) => [field, []])),
  splitDimensions: [],
  metrics: [],
  openControl: null,
  selectScrollTops: {},
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isAllValue(value) {
  return value === "ALL" || value === "全部";
}

const TYPE_EMPTY_LABEL = "未填写";

function isStrictFilterField(field) {
  return field === "type";
}

function isSingleSelectField(field) {
  return SINGLE_SELECT_FIELDS.includes(field);
}

function isAllExclusiveField(field) {
  return ALL_EXCLUSIVE_FIELDS.includes(field);
}

function valueForField(row, field) {
  if (field === "type") {
    const value = row[field];
    return value === null || value === undefined || String(value).trim() === "" ? TYPE_EMPTY_LABEL : value;
  }
  return row[field];
}

function activeData() {
  if (state.activeMenu === MENU_EVENT_PARAMETER) {
    return eventParameterData;
  }
  if (state.activeMenu === MENU_PLAYBACK) {
    return playbackData;
  }
  return dashboardData;
}

function activeRows() {
  return activeData().rows || [];
}

function activeDimensionFields() {
  if (state.activeMenu === MENU_OVERVIEW) {
    return OVERVIEW_FILTER_FIELDS;
  }
  if (state.activeMenu === MENU_PLAYBACK) {
    return PLAYBACK_FILTER_FIELDS.filter((field) => playbackData.dimensions.includes(field));
  }
  return state.activeMenu === MENU_EVENT_PARAMETER ? EVENT_PARAMETER_FILTER_FIELDS : DIMENSION_FIELDS;
}

function activeControlConfigs() {
  if (state.activeMenu === MENU_OVERVIEW) {
    return OVERVIEW_CONTROL_CONFIGS;
  }
  if (state.activeMenu === MENU_PLAYBACK) {
    return PLAYBACK_CONTROL_CONFIGS.filter((config) => config.type !== "filter" || playbackData.dimensions.includes(config.key));
  }
  return state.activeMenu === MENU_EVENT_PARAMETER ? EVENT_PARAMETER_CONTROL_CONFIGS : API_CONTROL_CONFIGS;
}

function uniqueValues(rows, field) {
  return [...new Set(rows.map((row) => valueForField(row, field)))].filter(
    (value) => value !== null && value !== undefined && value !== ""
  );
}

function countryUserTotals(rows) {
  const totals = new Map();
  const bestRows = new Map();

  dashboardData.rows.forEach((row) => {
    const country = row["国家"];
    if (!country || isAllValue(country) || !isAllValue(row["版本号"])) {
      return;
    }
    const key = [row["报表日期"], row["项目代号"], row["首次访问日期"], country].join("||");
    const users = Number(row.new_users || 0);
    if (!bestRows.has(key) || users > bestRows.get(key)) {
      bestRows.set(key, users);
    }
  });
  bestRows.forEach((users, key) => {
    const country = key.split("||")[3];
    totals.set(country, (totals.get(country) || 0) + users);
  });

  if (totals.size) {
    return totals;
  }

  rows.forEach((row) => {
    const country = row["国家"];
    if (!country || isAllValue(country)) {
      return;
    }
    totals.set(country, (totals.get(country) || 0) + Number(row.new_users || row.total_users || 0));
  });
  return totals;
}

function sortCountriesByUsers(values, rows) {
  const totals = countryUserTotals(rows);
  const allValues = values.filter(isAllValue);
  const rest = values
    .filter((value) => !isAllValue(value))
    .sort((a, b) => {
      const totalDiff = (totals.get(b) || 0) - (totals.get(a) || 0);
      if (totalDiff !== 0) {
        return totalDiff;
      }
      return String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true });
    });
  return [...allValues, ...rest];
}

function sortValues(field, values, rows = activeRows()) {
  const copy = values.slice();
  if (field.includes("日期")) {
    return copy.sort();
  }
  if (field === "国家") {
    return sortCountriesByUsers(copy, rows);
  }
  if (field === "版本号") {
    const allValues = copy.filter(isAllValue);
    const rest = copy
      .filter((value) => !isAllValue(value))
      .sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }));
    return [...allValues, ...rest];
  }
  if (field === "项目代号") {
    return copy.sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }));
  }
  return copy.sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }));
}

function optionsFor(field, rows = activeRows()) {
  const values = uniqueValues(rows, field);
  if (field === "项目代号") {
    return sortValues(field, values.filter((value) => !isAllValue(value)), rows);
  }
  if (field === "版本号") {
    const allValues = values.filter(isAllValue);
    const latestVersions = sortValues(field, values.filter((value) => !isAllValue(value)), rows).slice(-5);
    return [...allValues, ...latestVersions];
  }
  return sortValues(field, values, rows);
}

function metricLabel(metric) {
  const playbackMetric = playbackData.metrics?.find((item) => item.key === metric);
  return dashboardData.metricMeta[metric]?.label || playbackMetric?.label || COUNT_FIELD_LABELS[metric] || metric;
}

function optionsForControl(config) {
  if (config.type === "split") {
    return splitDimensionOptions();
  }
  if (config.type === "metrics") {
    return RATE_METRICS;
  }
  if (state.activeMenu === MENU_OVERVIEW && config.key === "版本号") {
    return sortValues("版本号", uniqueValues(activeRows(), "版本号"), activeRows());
  }
  if (config.key === "type") {
    return sortValues("type", [
      ...new Set([...uniqueValues(dashboardData.rows || [], "type"), ...uniqueValues(eventParameterData.rows || [], "type"), ...uniqueValues(playbackData.rows || [], "type")]),
    ]);
  }
  return optionsFor(config.key, activeRows());
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

function uniqueSelected(values, options) {
  const allowed = new Set(options);
  return values.filter((value, index) => allowed.has(value) && values.indexOf(value) === index);
}

function preferredAllValue(options) {
  return options.find(isAllValue) || "";
}

function normalizeSelectedForControl(config, values, options, changedValue = null) {
  const selected = uniqueSelected(values, options);
  if (config.type !== "filter") {
    return selected;
  }

  if (isSingleSelectField(config.key)) {
    if (changedValue && selected.includes(changedValue)) {
      return [changedValue];
    }
    if (selected.length) {
      return [selected[selected.length - 1]];
    }
    return options.length ? [options[0]] : [];
  }

  if (isAllExclusiveField(config.key)) {
    const allValue = preferredAllValue(options);
    const specificValues = selected.filter((value) => !isAllValue(value));
    if (changedValue && selected.includes(changedValue)) {
      return isAllValue(changedValue) ? [changedValue] : specificValues;
    }
    if (!selected.length) {
      return allValue ? [allValue] : [];
    }
    if (selected.some(isAllValue) && specificValues.length) {
      return allValue ? [allValue] : specificValues;
    }
  }

  return selected;
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
    return config.type === "filter" && !isStrictFilterField(config.key) ? "全部" : "未选择";
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
  const apiRows = dashboardData.rows || [];
  const eventRows = eventParameterData.rows || [];
  const playbackRows = playbackData.rows || [];
  const reportDates = optionsFor("报表日期", apiRows);
  const projects = optionsFor("项目代号", apiRows);
  const firstVisitDates = optionsFor("首次访问日期", apiRows);
  const countries = optionsFor("国家", apiRows);
  const versions = optionsFor("版本号", apiRows);
  const apis = optionsFor("API", apiRows);
  const eventNames = optionsFor("事件名", eventRows);
  const eventApis = optionsFor("api", eventRows);
  const types = sortValues("type", [
    ...new Set([...uniqueValues(apiRows, "type"), ...uniqueValues(eventRows, "type"), ...uniqueValues(playbackRows, "type")]),
  ]);

  state.filters["报表日期"] = reportDates.slice(-1);
  state.filters["项目代号"] = projects.slice();
  state.filters["首次访问日期"] = firstVisitDates.slice(-5);
  state.filters["国家"] = countries.includes("ALL") ? ["ALL"] : countries.slice(0, 1);
  state.filters["版本号"] = versions.includes("ALL") ? ["ALL"] : versions.slice(-1);
  state.filters["API"] = apis.slice(0, 1);
  state.filters["type"] = types.includes("ALL") ? ["ALL"] : types.slice(0, 1);
  state.filters["事件名"] = eventNames.slice(0, 1);
  state.filters["api"] = eventApis.slice();
  state.splitDimensions = ["首次访问日期", "type"].filter((field) => splitDimensionOptions().includes(field));
  state.metrics = RATE_METRICS.slice();
}

function splitDimensionOptions() {
  const available = dashboardData.splitDimensions?.length ? dashboardData.splitDimensions : DETAIL_SPLIT_FIELDS;
  return DETAIL_SPLIT_FIELDS
    .filter((field) => available.includes(field) && dashboardData.dimensions.includes(field))
    .filter((field) => optionsFor(field, dashboardData.rows || []).length > 1);
}

function selectedSet(config) {
  return new Set(selectedForControl(config));
}

function renderMenu() {
  document.querySelectorAll("[data-menu]").forEach((item) => {
    const active = item.dataset.menu === state.activeMenu;
    item.classList.toggle("active", active);
    item.setAttribute("aria-current", active ? "page" : "false");
  });
}

function renderControls() {
  const container = document.querySelector("#filters");
  container.innerHTML = activeControlConfigs().map((config) => {
    const options = optionsForControl(config);
    const selected = normalizeSelectedForControl(config, selectedForControl(config), options);
    setSelectedForControl(config, selected);
    const selectedCount =
      config.type === "filter" && !isStrictFilterField(config.key) && !selected.length ? options.length : selected.length;
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
          <span>${selectedCount}/${options.length}</span>
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
  restoreOpenSelectScroll(container);
}

function rememberOpenSelectScroll() {
  if (!state.openControl) {
    return;
  }
  const controls = [...document.querySelectorAll(".multi-control")];
  const node = controls.find((item) => item.dataset.control === state.openControl);
  const list = node?.querySelector(".option-list");
  if (list) {
    state.selectScrollTops[state.openControl] = list.scrollTop;
  }
}

function restoreOpenSelectScroll(container = document) {
  if (!state.openControl) {
    return;
  }
  const controls = [...container.querySelectorAll(".multi-control")];
  const node = controls.find((item) => item.dataset.control === state.openControl);
  const list = node?.querySelector(".option-list");
  if (list) {
    list.scrollTop = state.selectScrollTops[state.openControl] || 0;
  }
}

function matchesFilter(row, field) {
  const selected = state.filters[field] || [];
  if (isStrictFilterField(field) && !selected.length) {
    return false;
  }
  return !selected.length || selected.includes(valueForField(row, field));
}

function matchesEventParameterFilter(row, field) {
  if (field === "api") {
    const value = row[field];
    if (value === null || value === undefined || String(value).trim() === "") {
      return true;
    }
  }
  return matchesFilter(row, field);
}

function filteredRows() {
  const fields = activeDimensionFields();
  if (state.activeMenu === MENU_EVENT_PARAMETER) {
    return activeRows().filter((row) => fields.every((field) => matchesEventParameterFilter(row, field)));
  }
  return activeRows().filter((row) => fields.every((field) => matchesFilter(row, field)));
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

function formatCount(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function activeSplitDimensions(rows) {
  const data = activeData();
  const dimensions = data.dimensions || [];
  const available = data.splitDimensions?.length ? data.splitDimensions : dimensions;
  const fields = new Set();
  CHART_SPLIT_FIELDS.forEach((field) => {
    if ((state.filters[field] || []).length > 1) {
      fields.add(field);
    }
  });
  return [...fields].filter((field) => {
    if (!available.includes(field)) {
      return dimensions.includes(field);
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
      parts.push(`${FIELD_SHORT_LABELS[field] || field}:${valueForField(row, field)}`);
    }
  });
  return parts.length ? parts.join(" · ") : metricLabel(metric);
}

function buildSeries(rows) {
  const xValues = sortValues("首次访问日期", uniqueValues(rows, "首次访问日期"), rows);
  const splitFields = activeSplitDimensions(rows);
  const seriesMap = new Map();

  state.metrics.forEach((metric) => {
    rows.forEach((row) => {
      const xValue = row["首次访问日期"];
      const splitKey = splitFields.map((field) => valueForField(row, field) ?? "NA").join("||");
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

function lineStyleForMetric(metric) {
  return metric.includes("fail") ? "dashed" : "solid";
}

function legendSwatchStyle(metric, color) {
  if (lineStyleForMetric(metric) === "dashed") {
    return `background: repeating-linear-gradient(to right, ${color} 0 7px, transparent 7px 12px);`;
  }
  return `background: ${color};`;
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
  const xTicks = Array.from({ length: xValues.length }, (_, index) => index);

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
      const anchor = index === 0 ? "start" : index === xValues.length - 1 ? "end" : "middle";
      return `
        <line x1="${x}" y1="${height - margin.bottom}" x2="${x}" y2="${height - margin.bottom + 6}" class="axis-tick" />
        <text x="${x}" y="${height - margin.bottom + 24}" text-anchor="${anchor}" class="axis-label">${escapeHtml(xValues[index])}</text>
      `;
    })
    .join("");
  const lines = series
    .map((item, index) => {
      const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
      const dash = lineStyleForMetric(item.metric) === "dashed" ? " stroke-dasharray=\"7 5\"" : "";
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
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${state.activeMenu === MENU_PLAYBACK ? "RM 播放指标趋势折线图" : "RM API 指标趋势折线图"}">
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
        <i style="${legendSwatchStyle(item.metric, COLOR_PALETTE[index % COLOR_PALETTE.length])}"></i>
        ${escapeHtml(item.label)}
      </span>
    `)
    .join("");
  countNode.textContent = `${rows.length.toLocaleString("zh-CN")} 条记录 · ${series.length} 条线`;
}

function detailSplitDimensions() {
  const options = splitDimensionOptions();
  return state.splitDimensions.filter((field) => options.includes(field) && field !== "API");
}

function detailGroupLabel(fields, row) {
  if (!fields.length) {
    return "汇总";
  }
  return fields.map((field) => `${field}: ${valueForField(row, field) || "ALL"}`).join(" / ");
}

function buildDetailGroups(rows) {
  const fields = detailSplitDimensions();
  const groupMap = new Map();
  rows.forEach((row) => {
    const key = fields.length ? JSON.stringify(fields.map((field) => valueForField(row, field) || "ALL")) : "__all__";
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        label: detailGroupLabel(fields, row),
        rows: [],
        values: fields.map((field) => valueForField(row, field) || "ALL"),
      });
    }
    groupMap.get(key).rows.push(row);
  });
  return [...groupMap.values()].sort((a, b) => {
    for (let index = 0; index < a.values.length; index += 1) {
      const field = fields[index] || "";
      const left = String(a.values[index]);
      const right = String(b.values[index]);
      const diff = field.includes("日期")
        ? right.localeCompare(left, "zh-Hans-CN", { numeric: true })
        : left.localeCompare(right, "zh-Hans-CN", { numeric: true });
      if (diff !== 0) {
        return diff;
      }
    }
    return a.label.localeCompare(b.label, "zh-Hans-CN", { numeric: true });
  });
}

function selectedTitlePart(field) {
  const values = state.filters[field] || [];
  if (!values.length) {
    return `${field}: 全部`;
  }
  if (values.length <= 3) {
    return `${field}: ${values.join("/")}`;
  }
  return `${field}: ${values.slice(0, 3).join("/")} +${values.length - 3}`;
}

function detailGroupTitle(groupLabel, groupFields) {
  const context = ["国家", "版本号", "type"]
    .filter((field) => !groupFields.includes(field))
    .map(selectedTitlePart);
  if (groupLabel === "汇总") {
    return context.length ? context.join(" / ") : groupLabel;
  }
  return [groupLabel, ...context].join(" / ");
}

function apiMetricTableHtml(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const api = row["API"];
    if (!groups.has(api)) {
      groups.set(api, []);
    }
    groups.get(api).push(row);
  });

  const apiOrder = optionsFor("API", dashboardData.rows || []).filter((api) => groups.has(api));
  const header = `
    <thead>
      <tr>
        <th>API</th>
        <th>新增用户数</th>
        <th>request user</th>
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
          <td class="number-cell">${formatCount(sumField(apiRows, "new_users"))}</td>
          <td class="number-cell">${formatCount(sumField(apiRows, "request_users"))}</td>
          ${RATE_METRICS.map((metric) => {
            const activeClass = state.metrics.includes(metric) ? " is-focused" : "";
            return `<td class="number-cell${activeClass}">${formatRate(aggregateMetric(metric, apiRows))}</td>`;
          }).join("")}
        </tr>
      `;
    })
    .join("");

  return {
    apiCount: apiOrder.length,
    html: `<table>${header}<tbody>${body || `<tr><td colspan="${RATE_METRICS.length + 3}" class="empty-table">当前筛选下暂无数据</td></tr>`}</tbody></table>`,
  };
}

function renderDetailTable(rows) {
  const host = document.querySelector("#detail-table");
  const countNode = document.querySelector("#detail-count");
  const groupFields = detailSplitDimensions();
  const detailGroups = buildDetailGroups(rows);
  const visibleGroups = detailGroups.slice(0, 80);
  const extraCount = detailGroups.length - visibleGroups.length;
  const cards = visibleGroups.map((group) => {
    const table = apiMetricTableHtml(group.rows);
    return `
      <article class="detail-group">
        <div class="detail-group-head">
          <h3>${escapeHtml(detailGroupTitle(group.label, groupFields))}</h3>
          <span>${table.apiCount} 个 API</span>
        </div>
        <div class="table-wrap inner-table-wrap">${table.html}</div>
      </article>
    `;
  }).join("");

  host.innerHTML = `
    <div class="detail-stack">
      ${cards || `<div class="empty-state">当前筛选下暂无数据</div>`}
      ${extraCount > 0 ? `<div class="empty-state compact">当前拆分组合较多，已先显示前 80 组，还有 ${extraCount} 组未展开。</div>` : ""}
    </div>
  `;
  countNode.textContent = detailGroups.length <= 1
    ? `${apiMetricTableHtml(rows).apiCount} 个 API`
    : `${detailGroups.length} 个分组`;
}

function playbackCountFields(rows) {
  return PLAYBACK_COUNT_FIELDS.filter((field) => rows.some((row) => Number.isFinite(Number(row[field]))));
}

function playbackRowsSorted(rows) {
  return rows.slice().sort((a, b) => {
    const dateDiff = String(b["首次访问日期"] || "").localeCompare(String(a["首次访问日期"] || ""), "zh-Hans-CN", { numeric: true });
    if (dateDiff !== 0) {
      return dateDiff;
    }
    const leftCountry = isAllValue(a["国家"]) ? "" : String(a["国家"] || "");
    const rightCountry = isAllValue(b["国家"]) ? "" : String(b["国家"] || "");
    const countryDiff = leftCountry.localeCompare(rightCountry, "zh-Hans-CN", { numeric: true });
    if (countryDiff !== 0) {
      return countryDiff;
    }
    return String(a["版本号"] || "").localeCompare(String(b["版本号"] || ""), "zh-Hans-CN", { numeric: true });
  });
}

function renderPlaybackDetail(rows) {
  const host = document.querySelector("#detail-table");
  const countNode = document.querySelector("#detail-count");
  const countFields = playbackCountFields(rows);
  const rateMetrics = RATE_METRICS.filter((metric) => rows.some((row) => Number.isFinite(Number(row[metric]))));
  const sortedRows = playbackRowsSorted(rows);
  const visibleRows = sortedRows.slice(0, 1000);
  const extraCount = sortedRows.length - visibleRows.length;
  const context = ["项目代号", "国家", "版本号"].map(selectedTitlePart).join(" / ");
  const headers = `
    <th>首次访问日期</th>
    <th>国家</th>
    <th>版本号</th>
    <th>新增用户数</th>
    ${countFields.map((field) => `<th>${escapeHtml(metricLabel(field))}</th>`).join("")}
    ${rateMetrics.map((metric) => `<th>${escapeHtml(metricLabel(metric))}</th>`).join("")}
  `;
  const body = visibleRows.map((row) => `
    <tr>
      <td>${escapeHtml(row["首次访问日期"] || "NA")}</td>
      <td>${escapeHtml(row["国家"] || "NA")}</td>
      <td>${escapeHtml(row["版本号"] || "NA")}</td>
      <td class="number-cell">${formatCount(row.new_users)}</td>
      ${countFields.map((field) => `<td class="number-cell">${formatCount(row[field])}</td>`).join("")}
      ${rateMetrics.map((metric) => {
        const activeClass = state.metrics.includes(metric) ? " is-focused" : "";
        return `<td class="number-cell${activeClass}">${formatRate(row[metric])}</td>`;
      }).join("")}
    </tr>
  `).join("");

  host.innerHTML = `
    <div class="detail-stack">
      <article class="detail-group">
        <div class="detail-group-head">
          <h3>${escapeHtml(context)}</h3>
          <span>${sortedRows.length.toLocaleString("zh-CN")} 条播放记录</span>
        </div>
        <div class="table-wrap inner-table-wrap">
          <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${body || `<tr><td colspan="${rateMetrics.length + countFields.length + 4}" class="empty-table">当前筛选下暂无播放指标数据</td></tr>`}</tbody>
          </table>
        </div>
      </article>
      ${extraCount > 0 ? `<div class="empty-state compact">播放记录较多，已先显示前 1000 条，还有 ${extraCount} 条未展开。</div>` : ""}
    </div>
  `;
  countNode.textContent = `${sortedRows.length.toLocaleString("zh-CN")} 条播放记录`;
}

function eventParameterFields() {
  return eventParameterData.parameterFields?.length
    ? eventParameterData.parameterFields
    : [
        { key: "api", label: "API" },
        { key: "reason", label: "reason" },
        { key: "message", label: "message" },
      ];
}

function activeEventParameterFields(rows) {
  return eventParameterFields().filter((field) =>
    rows.some((row) => {
      const value = row[field.key];
      return value !== null && value !== undefined && String(value).trim() !== "";
    })
  );
}

function buildEventParameterItems(rows, parameterFields) {
  const groups = new Map();
  rows.forEach((row) => {
    const eventName = String(row["事件名"] ?? "NA").trim() || "NA";
    const values = parameterFields.map((field) => String(row[field.key] ?? "").trim());
    const key = JSON.stringify([eventName, ...values]);
    if (!groups.has(key)) {
      groups.set(key, {
        eventName,
        values,
        eventCount: 0,
        totalUsers: 0,
      });
    }
    const item = groups.get(key);
    item.eventCount += Number(row.event_count || 0);
    item.totalUsers += Number(row.total_users || 0);
  });
  return [...groups.values()].sort((a, b) => {
    const eventDiff = b.eventCount - a.eventCount;
    if (eventDiff !== 0) {
      return eventDiff;
    }
    const userDiff = b.totalUsers - a.totalUsers;
    if (userDiff !== 0) {
      return userDiff;
    }
    const eventNameDiff = a.eventName.localeCompare(b.eventName, "zh-Hans-CN", { numeric: true });
    if (eventNameDiff !== 0) {
      return eventNameDiff;
    }
    for (let index = 0; index < a.values.length; index += 1) {
      const diff = a.values[index].localeCompare(b.values[index], "zh-Hans-CN", { numeric: true });
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  });
}

function renderEventParameterDetail(rows) {
  const host = document.querySelector("#detail-table");
  const countNode = document.querySelector("#detail-count");
  const parameterFields = activeEventParameterFields(rows);
  const items = buildEventParameterItems(rows, parameterFields);
  const visibleItems = items.slice(0, 1000);
  const extraCount = items.length - visibleItems.length;
  const context = ["事件名", "国家", "版本号", "type"].map(selectedTitlePart).join(" / ");
  const body = visibleItems
    .map((item) => `
      <tr>
        <td class="api-cell">${escapeHtml(item.eventName)}</td>
        ${item.values.map((value) => `<td class="param-value-cell">${escapeHtml(value || "NA")}</td>`).join("")}
        <td class="number-cell">${formatCount(item.eventCount)}</td>
        <td class="number-cell">${formatCount(item.totalUsers)}</td>
      </tr>
    `)
    .join("");

  host.innerHTML = `
    <div class="detail-stack">
      <article class="detail-group">
        <div class="detail-group-head">
          <h3>${escapeHtml(context)}</h3>
          <span>${items.length.toLocaleString("zh-CN")} 个参数值</span>
        </div>
        <div class="table-wrap inner-table-wrap">
          <table class="event-parameter-table">
            <thead>
              <tr>
                <th>事件名</th>
                ${parameterFields.map((field) => `<th class="param-header-cell">${escapeHtml(field.label || field.key)}</th>`).join("")}
                <th class="number-header-cell">事件数</th>
                <th class="number-header-cell">用户数</th>
              </tr>
            </thead>
            <tbody>
              ${body || `<tr><td colspan="${parameterFields.length + 3}" class="empty-table">当前筛选下暂无数据</td></tr>`}
            </tbody>
          </table>
        </div>
      </article>
      ${extraCount > 0 ? `<div class="empty-state compact">参数值较多，已先显示前 1000 条，还有 ${extraCount} 条未展开。</div>` : ""}
    </div>
  `;
  countNode.textContent = `${items.length.toLocaleString("zh-CN")} 个参数值`;
}

function selectedSpecificValues(field) {
  return (state.filters[field] || []).filter((value) => !isAllValue(value));
}

function overviewVersionValues() {
  const selectedVersions = selectedSpecificValues("版本号");
  if (selectedVersions.length) {
    return selectedVersions;
  }
  return sortValues("版本号", uniqueValues(dashboardData.rows || [], "版本号"), dashboardData.rows || [])
    .filter((value) => !isAllValue(value));
}

function matchesOverviewStaticFilters(row, versionValues = overviewVersionValues()) {
  return valueForField(row, "type") === OVERVIEW_FIXED_TYPE
    && ["报表日期", "项目代号"].every((field) => matchesFilter(row, field))
    && versionValues.includes(row["版本号"]);
}

function overviewExcludedLatestDate(versionValues = overviewVersionValues()) {
  const dates = uniqueValues((dashboardData.rows || []).filter((row) => matchesOverviewStaticFilters(row, versionValues)), "首次访问日期");
  return sortValues("首次访问日期", dates).slice(-1)[0] || "";
}

function matchesOverviewBase(row, excludedLatestDate = overviewExcludedLatestDate(), versionValues = overviewVersionValues()) {
  return matchesOverviewStaticFilters(row, versionValues)
    && row["首次访问日期"] !== excludedLatestDate
    && matchesFilter(row, "首次访问日期");
}

function overviewBaseRows() {
  const versionValues = overviewVersionValues();
  const excludedLatestDate = overviewExcludedLatestDate(versionValues);
  return (dashboardData.rows || []).filter((row) => matchesOverviewBase(row, excludedLatestDate, versionValues));
}

function overviewScopeRows(baseRows, scope) {
  if (scope === "all") {
    return baseRows.filter((row) => isAllValue(row["国家"]));
  }
  const selectedCountries = selectedSpecificValues("国家");
  return baseRows.filter((row) => {
    const country = row["国家"];
    if (!country || isAllValue(country)) {
      return false;
    }
    return !selectedCountries.length || selectedCountries.includes(country);
  });
}

function aggregateRows(rows) {
  const summary = {
    rows,
    rowCount: rows.length,
    newUsers: sumField(rows, "new_users"),
    requestEvents: sumField(rows, "request_events"),
    requestUsers: sumField(rows, "request_users"),
    metrics: {},
  };
  RATE_METRICS.forEach((metric) => {
    summary.metrics[metric] = aggregateMetric(metric, rows);
  });
  return summary;
}

function metricValue(summary, metric) {
  return summary?.metrics?.[metric] ?? null;
}

function bucketRows(rows, fields) {
  const map = new Map();
  rows.forEach((row) => {
    const values = fields.map((field) => valueForField(row, field) || "ALL");
    const key = JSON.stringify(values);
    if (!map.has(key)) {
      map.set(key, { key, values, rows: [] });
    }
    map.get(key).rows.push(row);
  });

  const included = [];
  const excluded = [];
  map.forEach((bucket) => {
    const summary = aggregateRows(bucket.rows);
    const item = { ...bucket, summary };
    if (summary.newUsers >= OVERVIEW_MIN_NEW_USERS) {
      included.push(item);
    } else {
      excluded.push(item);
    }
  });
  return { included, excluded };
}

function sortOverviewBuckets(rows, fields) {
  return rows.sort((a, b) => {
    const dateIndex = fields.indexOf("首次访问日期");
    if (dateIndex >= 0) {
      const dateDiff = String(b.values[dateIndex]).localeCompare(String(a.values[dateIndex]), "zh-Hans-CN", { numeric: true });
      if (dateDiff !== 0) {
        return dateDiff;
      }
    }
    const failDiff = Number(metricValue(b.summary, "user_fail_rate") || 0) - Number(metricValue(a.summary, "user_fail_rate") || 0);
    if (failDiff !== 0) {
      return failDiff;
    }
    return b.summary.newUsers - a.summary.newUsers;
  });
}

function sortOverviewApiBuckets(rows, fields) {
  return rows.sort((a, b) => {
    const countryIndex = fields.indexOf("国家");
    if (countryIndex >= 0) {
      const countryDiff = String(a.values[countryIndex]).localeCompare(String(b.values[countryIndex]), "zh-Hans-CN", { numeric: true });
      if (countryDiff !== 0) {
        return countryDiff;
      }
    }
    const apiIndex = fields.indexOf("API");
    if (apiIndex >= 0) {
      const apiDiff = String(a.values[apiIndex]).localeCompare(String(b.values[apiIndex]), "zh-Hans-CN", { numeric: true });
      if (apiDiff !== 0) {
        return apiDiff;
      }
    }
    const dateIndex = fields.indexOf("首次访问日期");
    if (dateIndex >= 0) {
      const dateDiff = String(b.values[dateIndex]).localeCompare(String(a.values[dateIndex]), "zh-Hans-CN", { numeric: true });
      if (dateDiff !== 0) {
        return dateDiff;
      }
    }
    const versionIndex = fields.indexOf("版本号");
    if (versionIndex >= 0) {
      const versionDiff = String(a.values[versionIndex]).localeCompare(String(b.values[versionIndex]), "zh-Hans-CN", { numeric: true });
      if (versionDiff !== 0) {
        return versionDiff;
      }
    }
    return Number(metricValue(b.summary, "user_fail_rate") || 0) - Number(metricValue(a.summary, "user_fail_rate") || 0);
  });
}

function statusForRate(value) {
  const rate = Number(value || 0);
  if (rate >= 0.08) {
    return { cls: "risk", label: "风险" };
  }
  if (rate >= 0.03) {
    return { cls: "watch", label: "关注" };
  }
  return { cls: "good", label: "稳定" };
}

function statusPill(value) {
  const status = statusForRate(value);
  return `<span class="status-pill ${status.cls}">${status.label}</span>`;
}

function formatRateDelta(current, previous) {
  if (!Number.isFinite(Number(current)) || !Number.isFinite(Number(previous))) {
    return "NA";
  }
  const delta = Number(current) - Number(previous);
  const sign = delta > 0 ? "+" : "";
  return `${sign}${(delta * 100).toFixed(2)}pp`;
}

function overviewMetrics() {
  return state.metrics.length ? state.metrics : RATE_METRICS;
}

function overviewCell(summary, metric) {
  return `<td class="number-cell">${formatRate(metricValue(summary, metric))}</td>`;
}

function overviewMetricHeaders() {
  return overviewMetrics().map((metric) => `<th>${escapeHtml(metricLabel(metric))}</th>`).join("");
}

function overviewMetricCells(summary) {
  return overviewMetrics().map((metric) => overviewCell(summary, metric)).join("");
}

function overviewTable(headers, bodyRows, emptyColspan) {
  return `
    <div class="table-wrap inner-table-wrap">
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>${bodyRows || `<tr><td colspan="${emptyColspan}" class="empty-table">当前筛选下暂无有效数据</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function buildOverviewAnalysis() {
  const baseRows = overviewBaseRows();
  const allRows = overviewScopeRows(baseRows, "all");
  const countryRows = overviewScopeRows(baseRows, "country");
  const comparisonFields = ["首次访问日期", "版本号", "API"];
  const allByDate = bucketRows(allRows, ["首次访问日期"]);
  const allApi = bucketRows(allRows, comparisonFields);
  const countryNames = sortValues("国家", uniqueValues(countryRows, "国家"), countryRows);
  const countryTables = countryNames.map((country) => {
    const grouped = bucketRows(countryRows.filter((row) => row["国家"] === country), comparisonFields);
    return {
      country,
      included: sortOverviewApiBuckets(grouped.included, comparisonFields),
      excluded: grouped.excluded,
    };
  });
  const latestDate = sortValues("首次访问日期", uniqueValues(baseRows, "首次访问日期")).slice(-1)[0] || "";
  const excludedLatestDate = overviewExcludedLatestDate();
  const countryApiIncluded = countryTables.flatMap((item) =>
    item.included.map((bucket) => ({ ...bucket, country: item.country }))
  );

  return {
    baseRows,
    allRows,
    countryRows,
    latestDate,
    excludedLatestDate,
    allByDate,
    allApi,
    countryTables,
    countryApiIncluded,
    excludedCount: allApi.excluded.length + countryTables.reduce((sum, item) => sum + item.excluded.length, 0),
  };
}

function overviewConclusionItems(analysis) {
  const dateBuckets = sortOverviewBuckets(analysis.allByDate.included.map((item) => ({ ...item, fieldsDateIndex: 0 })), ["首次访问日期"]);
  const latest = dateBuckets[0];
  const previous = dateBuckets[1];
  const allApiRisk = sortOverviewBuckets(
    analysis.allApi.included.filter((item) => !analysis.latestDate || item.values[0] === analysis.latestDate),
    ["首次访问日期", "版本号", "API"]
  );
  const countryApiRisk = sortOverviewBuckets(
    analysis.countryApiIncluded
      .filter((item) => !analysis.latestDate || item.values[0] === analysis.latestDate)
      .map((item) => ({ ...item, values: [item.country, ...item.values] })),
    ["国家", "首次访问日期", "版本号", "API"]
  );
  const worstAllApi = allApiRisk[0];
  const worstCountryApi = countryApiRisk[0];
  const items = [];

  if (latest) {
    const userFail = metricValue(latest.summary, "user_fail_rate");
    const delta = previous ? formatRateDelta(userFail, metricValue(previous.summary, "user_fail_rate")) : "NA";
    items.push(
      `固定 type=${OVERVIEW_FIXED_TYPE}，已排除最新日期 ${analysis.excludedLatestDate || "NA"}；ALL国家最新有效日期 ${latest.values[0]} 的用户失败率为 ${formatRate(userFail)}，较上一有效日期 ${previous?.values?.[0] || "NA"} 变化 ${delta}。`
    );
  }
  if (worstAllApi) {
    items.push(
      `ALL国家的 API 对比里，${worstAllApi.values[2]} / ${worstAllApi.values[1]} 当前用户失败率最高，为 ${formatRate(metricValue(worstAllApi.summary, "user_fail_rate"))}。`
    );
  }
  if (worstCountryApi) {
    items.push(
      `具体国家里，${worstCountryApi.values[0]} 的 ${worstCountryApi.values[3]} / ${worstCountryApi.values[2]} 当前最需要关注，用户失败率 ${formatRate(metricValue(worstCountryApi.summary, "user_fail_rate"))}。`
    );
  }
  items.push(`所有表格均按 日期 × 版本 × API 展开，并排除新增用户数少于 ${OVERVIEW_MIN_NEW_USERS} 的行；本次排除 ${analysis.excludedCount.toLocaleString("zh-CN")} 行。`);
  return items.length ? items : ["当前筛选下暂无可形成结论的数据。"];
}

function renderOverview() {
  const host = document.querySelector("#detail-table");
  const countNode = document.querySelector("#detail-count");
  const analysis = buildOverviewAnalysis();
  const validAllApis = sortOverviewApiBuckets(analysis.allApi.included, ["首次访问日期", "版本号", "API"]);
  const dates = uniqueValues(analysis.baseRows, "首次访问日期");
  const versions = overviewVersionValues();
  const countries = uniqueValues(analysis.countryRows, "国家");
  const apiCount = uniqueValues(analysis.baseRows, "API").length;

  const conclusion = overviewConclusionItems(analysis).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const allHeaders = `
    <th>API</th><th>日期</th><th>版本号</th><th>新增用户数</th>${overviewMetricHeaders()}<th>状态</th>
  `;
  const allRows = validAllApis.map((item) => `
    <tr>
      <td class="api-cell">${escapeHtml(item.values[2])}</td>
      <td>${escapeHtml(item.values[0])}</td>
      <td>${escapeHtml(item.values[1])}</td>
      <td class="number-cell">${formatCount(item.summary.newUsers)}</td>
      ${overviewMetricCells(item.summary)}
      <td>${statusPill(metricValue(item.summary, "user_fail_rate"))}</td>
    </tr>
  `).join("");

  const countryHeaders = `
    <th>API</th><th>日期</th><th>版本号</th><th>新增用户数</th>${overviewMetricHeaders()}<th>状态</th>
  `;
  const countryTables = analysis.countryTables.map((table) => {
    const countryRows = table.included.map((item) => `
    <tr>
      <td class="api-cell">${escapeHtml(item.values[2])}</td>
      <td>${escapeHtml(item.values[0])}</td>
      <td>${escapeHtml(item.values[1])}</td>
      <td class="number-cell">${formatCount(item.summary.newUsers)}</td>
      ${overviewMetricCells(item.summary)}
      <td>${statusPill(metricValue(item.summary, "user_fail_rate"))}</td>
    </tr>
    `).join("");
    return `
      <article class="detail-group">
        <div class="detail-group-head">
          <h3>${escapeHtml(table.country)}：所有版本 / 所有 API 对比</h3>
          <span>${table.included.length.toLocaleString("zh-CN")} 行 · 排除 ${table.excluded.length.toLocaleString("zh-CN")} 行</span>
        </div>
        ${overviewTable(countryHeaders, countryRows, overviewMetrics().length + 5)}
      </article>
    `;
  }).join("");

  host.innerHTML = `
    <div class="overview-wrap">
      <div class="overview-card-grid">
        <div class="overview-card"><span>有效日期</span><strong>${dates.length.toLocaleString("zh-CN")}</strong></div>
        <div class="overview-card"><span>具体版本</span><strong>${versions.length.toLocaleString("zh-CN")}</strong></div>
        <div class="overview-card"><span>具体国家</span><strong>${countries.length.toLocaleString("zh-CN")}</strong></div>
        <div class="overview-card"><span>API数量</span><strong>${apiCount.toLocaleString("zh-CN")}</strong></div>
      </div>
      <div class="overview-conclusion">
        <h3>总结论</h3>
        <ul>${conclusion}</ul>
      </div>
      <article class="detail-group">
        <div class="detail-group-head">
          <h3>ALL国家：所有版本 / 所有 API 对比</h3>
          <span>type=${OVERVIEW_FIXED_TYPE} · 已排除最新日期 ${analysis.excludedLatestDate || "NA"}</span>
        </div>
        ${overviewTable(allHeaders, allRows, overviewMetrics().length + 5)}
      </article>
      ${countryTables || `<div class="empty-state compact">当前筛选下暂无具体国家有效数据</div>`}
    </div>
  `;
  countNode.textContent = `type=${OVERVIEW_FIXED_TYPE} · ${analysis.baseRows.length.toLocaleString("zh-CN")} 行 · 排除最新日期 ${analysis.excludedLatestDate || "NA"} · 排除 ${analysis.excludedCount.toLocaleString("zh-CN")} 个低量行`;
}

function renderMeta() {
  const data = activeData();
  document.querySelector("#generated-at").textContent = dashboardData.generatedAt || "未生成";
  document.querySelector("#source-count").textContent = `${(data.sourceFiles || []).length} 个附件`;
  document.querySelector("#row-count").textContent = `${(data.rows || []).length.toLocaleString("zh-CN")} 行`;
}

function renderAll() {
  renderMenu();
  renderControls();
  const chartPanel = document.querySelector("#chart-panel");
  const detailTitle = document.querySelector("#detail-title");
  if (state.activeMenu === MENU_OVERVIEW) {
    chartPanel.hidden = true;
    detailTitle.textContent = "API概况";
    renderOverview();
  } else if (state.activeMenu === MENU_PLAYBACK) {
    const rows = filteredRows();
    chartPanel.hidden = false;
    detailTitle.textContent = "播放指标";
    renderChart(rows);
    renderPlaybackDetail(rows);
  } else if (state.activeMenu === MENU_EVENT_PARAMETER) {
    const rows = filteredRows();
    chartPanel.hidden = true;
    detailTitle.textContent = "明细数据";
    renderEventParameterDetail(rows);
  } else {
    const rows = filteredRows();
    chartPanel.hidden = false;
    detailTitle.textContent = "明细数据";
    renderChart(rows);
    renderDetailTable(rows);
  }
  renderMeta();
}

function configForKey(key) {
  return activeControlConfigs().find((config) => config.key === key);
}

function handleControlClick(event) {
  const trigger = event.target.closest("[data-trigger]");
  if (trigger) {
    rememberOpenSelectScroll();
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
  rememberOpenSelectScroll();
  const actionName = action.dataset.action;
  let nextValues = [];
  if (actionName === "select-all") {
    nextValues = isSingleSelectField(config.key) || isAllExclusiveField(config.key)
      ? [preferredAllValue(options) || options[0]].filter(Boolean)
      : options;
  }
  setSelectedForControl(config, normalizeSelectedForControl(config, nextValues, options));
  state.openControl = config.key;
  renderAll();
}

function handleControlChange(event) {
  const input = event.target.closest("input[data-control-key]");
  if (!input) {
    return;
  }
  rememberOpenSelectScroll();
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
  const options = optionsForControl(config);
  setSelectedForControl(config, normalizeSelectedForControl(config, selected, options, input.value));
  state.openControl = config.key;
  renderAll();
}

function handleMenuClick(event) {
  const item = event.target.closest("[data-menu]");
  if (!item) {
    return;
  }
  event.preventDefault();
  if (item.dataset.menu === state.activeMenu) {
    return;
  }
  rememberOpenSelectScroll();
  state.activeMenu = item.dataset.menu;
  state.openControl = null;
  state.selectScrollTops = {};
  renderAll();
}

document.addEventListener("DOMContentLoaded", () => {
  initDefaults();
  const filters = document.querySelector("#filters");
  const tabs = document.querySelector(".tabs");
  tabs.addEventListener("click", handleMenuClick);
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
