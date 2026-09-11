const dashboardData = window.FR_DASHBOARD_DATA;

const DIMENSION_LABELS = ["报表日期", "项目代号", "首次访问日期", "国家", "广告组", "版本号"];
const PREFERRED_COMPARE_METRICS = [
  "新增用户数",
  "D1留存率",
  "卸载率_D0",
  "通知授权率_D0",
  "通知展示率_D0",
  "人均展示次数_D0",
  "通知点击率_D0",
  "人均点击次数_D0",
  "常驻通知栏展示率_D0",
  "常驻通知栏人均展示次数_D0",
  "常驻通知栏点击率_D0",
  "常驻通知栏人均点击次数_D0",
];

const METRIC_CATEGORY_ORDER = [
  "新增用户数",
  "留存率",
  "卸载率",
  "通知授权率",
  "通知展示率",
  "人均展示次数",
  "通知点击率",
  "人均点击次数",
  "常驻通知栏展示率",
  "常驻通知栏人均展示次数",
  "常驻通知栏点击率",
  "常驻通知栏人均点击次数",
];

function isAllowedCompareMetric(metric) {
  if (metric === "D3留存率") {
    return true;
  }
  const dayMatches = metric.match(/D(\d+)/gi);
  if (!dayMatches) {
    return true;
  }
  return dayMatches.every((token) => ["D0", "D1"].includes(token.toUpperCase()));
}

const COMPARE_METRICS = dashboardData.main.metrics.filter(isAllowedCompareMetric);
const MIN_CONCLUSION_SAMPLE = 30;
const DEFAULT_TIMING_METRICS = [
  "D0展示用户率",
  "D0通知点击率",
  "D0人均展示次数",
  "D0人均点击次数",
  "D0通知点击转化率",
];
const DATA_OVERVIEW_METRICS = [
  "D1留存率",
  "卸载率_D0",
  "通知授权率_D0",
  "通知展示率_D0",
  "通知点击率_D0",
].filter((metric) => COMPARE_METRICS.includes(metric));
const AI_ANALYSIS_DIRECTIONS = [
  { key: "overall", label: "整体指标", note: "先看新旧版本整体变好/变差" },
  { key: "country", label: "头部国家", note: "看买量大的国家是否拖累" },
  { key: "notification", label: "通知/文案/时机", note: "看通知链路和专项表现" },
  { key: "feature", label: "功能模块", note: "看功能漏斗和模块点击" },
  { key: "d1", label: "D1变化", note: "重点看 D1 相关指标" },
  { key: "cause", label: "原因排查", note: "输出可能原因和优化建议" },
];
const AI_DEFAULT_ANALYSIS_DIRECTIONS = AI_ANALYSIS_DIRECTIONS.map((item) => item.key);
const LOCAL_AI_MODEL = "qwen3:0.6b";
const LOCAL_AI_ENDPOINT = "http://127.0.0.1:11434/api/chat";
const DEEPSEEK_AI_MODEL = "deepseek-v4-flash";
const DEEPSEEK_AI_ENDPOINT = "https://api.deepseek.com/chat/completions";
const OVERVIEW_FIRST_LAUNCH_METRIC = "首页到达率_D0";
const OVERVIEW_HEALTH_SECTIONS = [
  {
    key: "retention",
    label: "留存",
    metrics: ["D1留存率"],
    weight: 5,
    targetWorkspace: "country_opt",
  },
  {
    key: "uninstall",
    label: "卸载",
    metrics: ["卸载率_D0"],
    weight: 4,
    lowerBetter: true,
    targetWorkspace: "country_opt",
  },
  {
    key: "notification",
    label: "通知",
    metrics: ["通知授权率_D0", "通知展示率_D0", "通知点击率_D0"],
    weight: 4,
    targetWorkspace: "notification_copy",
  },
  {
    key: "first_launch",
    label: "首次启动",
    metrics: [OVERVIEW_FIRST_LAUNCH_METRIC],
    weight: 3,
    source: "feature",
    featureAnalysisType: "首次启动流程漏斗",
    featureObject: "首页展示数",
    featureDay: "D0",
    targetWorkspace: "feature_module",
  },
];
const SERIES_COLORS = ["#2563eb", "#0f766e", "#64748b", "#f59e0b"];
const TIMING_SHORT_LABELS = {
  "监听到应用安装": ["应用", "安装"],
  "监听到应用卸载": ["应用", "卸载"],
  "监听到截屏": ["监听", "截屏"],
  "广告召回时机": ["广告", "召回"],
  "fcm普通消息": ["FCM", "普通"],
  "fcm高优先级消息": ["FCM", "高优"],
  "屏幕解锁": ["屏幕", "解锁"],
  "点击home/最近任务时推送": ["Home/最近", "任务"],
  "首次扫描未完成": ["首次扫描", "未完成"],
  "有扫描结果未恢复/清理": ["有结果", "未恢复"],
};
const WORKSPACES = {
  data_overview: {
    label: "AI分析助手",
    note: "输入项目、新旧版本和迭代内容，自动查看版本指标变化、重点国家差异和下一步分析建议。",
    compareDefaults: {
      analysisMode: "cross_project",
      compareField: "项目代号",
      countryMode: "multi_country",
      groupDimensions: ["首次访问日期"],
      compareMetrics: DATA_OVERVIEW_METRICS,
    },
  },
  paid_country: {
    label: "买量国家对比",
    note: "固定报表日期、项目、首次访问日期和版本后，重点看 top 10 国家用户数占比怎么变化，以及不同项目之间的买量结构差异。",
    compareDefaults: {
      analysisMode: "cross_project",
      compareField: "国家",
      countryMode: "multi_country",
      groupDimensions: ["首次访问日期"],
      compareMetrics: [
        "新增用户数",
        "D1留存率",
        "通知授权率_D0",
        "通知展示率_D0",
        "人均展示次数_D0",
        "通知点击率_D0",
        "人均点击次数_D0",
        "常驻通知栏点击率_D0",
        "常驻通知栏人均点击次数_D0",
        "卸载率_D0",
      ],
    },
  },
  paid_adgroup: {
    label: "广告组对比",
    note: "固定报表日期、项目、首次访问日期和国家后，重点看广告组买量用户数占比、排名和随时间的结构变化。",
    compareDefaults: {
      analysisMode: "cross_project",
      compareField: "广告组",
      countryMode: "multi_country",
      groupDimensions: ["首次访问日期"],
      compareMetrics: [
        "新增用户数",
        "D1留存率",
        "通知授权率_D0",
        "通知展示率_D0",
        "人均展示次数_D0",
        "通知点击率_D0",
        "人均点击次数_D0",
        "常驻通知栏点击率_D0",
        "常驻通知栏人均点击次数_D0",
        "卸载率_D0",
      ],
    },
  },
  country_opt: {
    label: "单项目国家对比",
    note: "固定单项目后，直接比较不同国家的关键指标差距，帮助判断先优先优化哪个国家、哪个指标。",
    compareDefaults: {
      analysisMode: "single_project",
      compareField: "国家",
      countryMode: "multi_country",
      groupDimensions: ["首次访问日期"],
      compareMetrics: [
        "新增用户数",
        "D1留存率",
        "通知授权率_D0",
        "通知展示率_D0",
        "人均展示次数_D0",
        "通知点击率_D0",
        "人均点击次数_D0",
        "常驻通知栏点击率_D0",
        "常驻通知栏人均点击次数_D0",
        "卸载率_D0",
      ],
    },
  },
  version_iteration: {
    label: "单项目版本对比",
    note: "固定单项目后，对比版本和日期批次，判断迭代有没有效果，并结合漏斗观察阶段转化变化。",
    compareDefaults: {
      analysisMode: "single_project",
      compareField: "版本号",
      countryMode: "single_country",
      groupDimensions: ["首次访问日期"],
      compareMetrics: [
        "新增用户数",
        "D1留存率",
        "卸载率_D0",
        "通知授权率_D0",
        "通知展示率_D0",
        "人均展示次数_D0",
        "通知点击率_D0",
        "人均点击次数_D0",
        "常驻通知栏点击率_D0",
        "常驻通知栏人均点击次数_D0",
      ],
    },
  },
  adgroup_iteration: {
    label: "单项目广告组对比",
    note: "固定单项目和单版本后，对比不同广告组之间的新增用户占比与质量指标，判断哪个广告组更值得继续放量。",
    compareDefaults: {
      analysisMode: "single_project",
      compareField: "广告组",
      countryMode: "single_country",
      groupDimensions: ["首次访问日期"],
      compareMetrics: [
        "新增用户数",
        "D1留存率",
        "卸载率_D0",
        "通知授权率_D0",
        "通知展示率_D0",
        "人均展示次数_D0",
        "通知点击率_D0",
        "人均点击次数_D0",
        "常驻通知栏点击率_D0",
        "常驻通知栏人均点击次数_D0",
      ],
    },
  },
  cross_project: {
    label: "多项目对比",
    note: "在统一维度口径下比较不同项目代号，快速识别哪个包在哪些指标上落后，以及差异是否可能由国家结构带来。",
    compareDefaults: {
      analysisMode: "cross_project",
      compareField: "项目代号",
      countryMode: "single_country",
      groupDimensions: ["国家", "首次访问日期"],
      compareMetrics: [
        "新增用户数",
        "D1留存率",
        "卸载率_D0",
        "通知授权率_D0",
        "通知展示率_D0",
        "人均展示次数_D0",
        "通知点击率_D0",
        "人均点击次数_D0",
        "常驻通知栏点击率_D0",
        "常驻通知栏人均点击次数_D0",
      ],
    },
  },
  timing_special: {
    label: "通知时机对比",
    note: "固定日期、项目、国家和版本后，按列对比维度观察同一批通知时机的触达质量与点击差异。",
  },
  notification_copy: {
    label: "通知文案对比",
    note: "固定日期、项目、国家和版本后，按列对比维度观察不同通知文案的展示与点击差异。",
  },
  feature_module: {
    label: "功能模块",
    note: "按分析类型查看各类功能漏斗和首页模块点击率，适合判断新用户启动链路与功能入口表现。",
  },
};

const appState = {
  activeWorkspace: "data_overview",
  analysisMode: "single_project",
  countryMode: "single_country",
  openSelectId: null,
  selectScrollTops: {},
  filters: {
    报表日期: [],
    项目代号: [],
    首次访问日期: [],
    国家: [],
    广告组: [],
    版本号: [],
  },
  compareField: "版本号",
  compareValues: [],
  groupDimensions: ["首次访问日期", "国家"],
  compareMetrics: sortCompareMetrics(PREFERRED_COMPARE_METRICS.filter((metric) => COMPARE_METRICS.includes(metric))).slice(0, 6),
  funnelCompareField: "项目代号",
  funnelCompareValues: [],
  funnelProject: null,
  funnelDate: [],
  funnelCountry: [],
  funnelVersion: [],
  funnelFirstVisitDate: [],
  funnelMetrics: dashboardData.main.recommendedFunnelMetrics.filter((metric) => COMPARE_METRICS.includes(metric)).slice(),
  timingCompareField: "项目代号",
  timingCompareValues: [],
  timingMetrics: DEFAULT_TIMING_METRICS.filter((metric) => dashboardData.timing.metrics.includes(metric)),
  timingReportDate: [],
  timingProject: [],
  timingFirstVisitDate: [],
  timingCountry: [],
  timingVersion: [],
  timingTiming: [],
  timingGroupDimensions: ["首次访问日期"],
  featureReportDate: [],
  featureProject: [],
  featureFirstVisitDate: [],
  featureCountry: [],
  featureVersion: [],
  featureAnalysisType: [],
  featureDays: ["D0"],
  featureColumnDimension: ["项目代号"],
  featureGroupDimensions: ["首次访问日期"],
  lastFeatureWorkspace: null,
  lastTimingWorkspace: null,
  hasInitializedPaidCountryProjects: false,
  countryOptTrendMetric: null,
  aiProject: "",
  aiOldVersion: "",
  aiNewVersion: "",
  aiDates: [],
  aiCountry: "",
  aiFeatureAnalysisType: "",
  aiIterationText: "",
  aiDirections: AI_DEFAULT_ANALYSIS_DIRECTIONS.slice(),
  aiLocalStatus: "idle",
  aiLocalAnswer: "",
  aiLocalError: "",
  aiLocalRequestKey: "",
  aiAnalysisMode: "deepseek",
  aiDeepSeekApiKey: "",
  aiHasGenerated: false,
  workspaceMemory: {},
  sharedProjectDate: {
    single: { project: [], firstVisitDate: [] },
    multi: { project: [], firstVisitDate: [] },
  },
};

function uniqueValues(rows, field) {
  return [...new Set(rows.map((row) => row[field]))].filter((value) => value !== null && value !== undefined);
}

function uniqueArray(values) {
  return [...new Set(values)].filter((value) => value !== null && value !== undefined);
}

function sortDimensionValues(field, values) {
  const copy = values.slice();
  if (field.includes("日期")) {
    return copy.sort();
  }
  if (field === "项目代号") {
    return copy.sort((a, b) => {
      const aText = String(a);
      const bText = String(b);
      const aMatch = aText.match(/^([A-Za-z]+)(\d+)/);
      const bMatch = bText.match(/^([A-Za-z]+)(\d+)/);
      if (aMatch && bMatch && aMatch[1] === bMatch[1]) {
        return Number(aMatch[2]) - Number(bMatch[2]);
      }
      return aText.localeCompare(bText, "zh-Hans-CN", { numeric: true });
    });
  }
  if (field === "版本号" || field === "广告组") {
    const allValues = copy.filter((value) => value === "全部");
    const others = copy
      .filter((value) => value !== "全部")
      .sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }));
    return [...allValues, ...others];
  }
  return copy.sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN"));
}

function saveWorkspaceMemory(workspaceKey) {
  appState.workspaceMemory[workspaceKey] = {
    国家: (appState.filters["国家"] || []).slice(),
    广告组: (appState.filters["广告组"] || []).slice(),
    版本号: (appState.filters["版本号"] || []).slice(),
    compareMetrics: (appState.compareMetrics || []).slice(),
    groupDimensions: (appState.groupDimensions || []).slice(),
  };
}

function getWorkspaceMemory(workspaceKey) {
  return appState.workspaceMemory[workspaceKey] || {};
}

function projectDateShareGroup(workspaceKey) {
  if (["country_opt", "version_iteration", "adgroup_iteration"].includes(workspaceKey)) {
    return "single";
  }
  if (["paid_country", "paid_adgroup", "cross_project", "timing_special", "notification_copy", "feature_module"].includes(workspaceKey)) {
    return "multi";
  }
  return null;
}

function projectDateStateRefs(workspaceKey) {
  if (workspaceKey === "feature_module") {
    return { projectKey: "featureProject", dateKey: "featureFirstVisitDate" };
  }
  if (isTimingWorkspace(workspaceKey)) {
    return { projectKey: "timingProject", dateKey: "timingFirstVisitDate" };
  }
  return { projectKey: "项目代号", dateKey: "首次访问日期" };
}

function projectDateOptionsForWorkspace(workspaceKey, field) {
  if (workspaceKey === "feature_module") {
    return featureOptionsFor(field);
  }
  if (isTimingWorkspace(workspaceKey)) {
    return timingOptionsFor(field);
  }
  return optionsFor(field);
}

function getProjectDateSelection(workspaceKey, field) {
  const refs = projectDateStateRefs(workspaceKey);
  if (workspaceKey === "feature_module" || isTimingWorkspace(workspaceKey)) {
    const stateKey = field === "项目代号" ? refs.projectKey : refs.dateKey;
    return (appState[stateKey] || []).slice();
  }
  return (appState.filters[field] || []).slice();
}

function setProjectDateSelection(workspaceKey, field, values) {
  const refs = projectDateStateRefs(workspaceKey);
  if (workspaceKey === "feature_module" || isTimingWorkspace(workspaceKey)) {
    const stateKey = field === "项目代号" ? refs.projectKey : refs.dateKey;
    appState[stateKey] = values.slice();
    return;
  }
  appState.filters[field] = values.slice();
}

function applySharedProjectDateToWorkspace(workspaceKey) {
  const group = projectDateShareGroup(workspaceKey);
  if (!group) return;
  const shared = appState.sharedProjectDate[group];
  [
    ["项目代号", "project"],
    ["首次访问日期", "firstVisitDate"],
  ].forEach(([field, key]) => {
    const sharedValues = (shared[key] || []).slice();
    if (!sharedValues.length) return;
    const allowed = projectDateOptionsForWorkspace(workspaceKey, field);
    let valid = sharedValues.filter((value) => allowed.includes(value));
    if (field === "项目代号" && group === "single") {
      valid = valid.slice(0, 1);
    }
    if (valid.length) {
      setProjectDateSelection(workspaceKey, field, valid);
    }
  });
}

function rememberProjectDateSelection(workspaceKey, field) {
  if (!["项目代号", "首次访问日期"].includes(field)) return;
  const group = projectDateShareGroup(workspaceKey);
  if (!group) return;
  const key = field === "项目代号" ? "project" : "firstVisitDate";
  const values = getProjectDateSelection(workspaceKey, field).filter((value) => value !== "全部");
  if (values.length) {
    appState.sharedProjectDate[group][key] = values.slice();
  }
}

function formatSignedMetricDiff(metric, diff, formatter = formatMetric) {
  if (diff === null || diff === undefined || Number.isNaN(Number(diff))) {
    return "NA";
  }
  const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
  return `${sign}${formatter(metric, Math.abs(diff))}`;
}

function comparisonColumnsForSubjects(subjectCount) {
  if (subjectCount > 2) {
    return "<th>最优</th><th>最弱</th><th>极差</th>";
  }
  if (subjectCount === 2) {
    return "<th>差值</th>";
  }
  return "";
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function compactSubjectLabel(subject, maxLength = 28) {
  const text = String(subject ?? "");
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function subjectLabelHtml(subject, className = "subject-label") {
  return `<span class="${className}" title="${escapeAttr(subject)}">${escapeAttr(compactSubjectLabel(subject))}</span>`;
}

function comparisonCellsForMetric(subjects, metric, valueForSubject, formatter = formatMetric) {
  if (subjects.length > 2 && metric === "新增用户数") {
    return { cells: "<td></td><td></td><td></td>", valueClasses: new Map() };
  }
  const comparableValues = subjects
    .map((subject) => {
      const value = valueForSubject(subject);
      return value === null || value === undefined || Number.isNaN(Number(value))
        ? null
        : { subject, value: Number(value) };
    })
    .filter(Boolean);
  const valueClasses = new Map();
  const rangeValue = comparableValues.length >= 2
    ? Math.max(...comparableValues.map((item) => item.value)) - Math.min(...comparableValues.map((item) => item.value))
    : null;
  if (subjects.length > 2) {
    if (!(rangeValue > 0)) {
      return { cells: "<td></td><td></td><td></td>", valueClasses };
    }
    const lowerBetter = metric.includes("卸载率");
    const rankedValues = comparableValues.slice().sort((a, b) => lowerBetter ? a.value - b.value : b.value - a.value);
    const bestValue = rankedValues[0] || null;
    const weakestValue = rankedValues[rankedValues.length - 1] || null;
    if (bestValue) valueClasses.set(bestValue.subject, "best-value-cell");
    if (weakestValue) valueClasses.set(weakestValue.subject, "weak-value-cell");
    return {
      valueClasses,
      cells: `
        <td class="best-summary-cell">${bestValue ? subjectLabelHtml(bestValue.subject, "summary-subject-label") : "NA"}</td>
        <td class="weak-summary-cell">${weakestValue ? subjectLabelHtml(weakestValue.subject, "summary-subject-label") : "NA"}</td>
        <td class="diff-cell">${formatter(metric, rangeValue)}</td>
      `,
    };
  }
  if (subjects.length === 2) {
    const firstValue = valueForSubject(subjects[0]);
    const secondValue = valueForSubject(subjects[1]);
    const diff = firstValue === null || firstValue === undefined || secondValue === null || secondValue === undefined
      ? null
      : Number(secondValue) - Number(firstValue);
    return {
      valueClasses,
      cells: `<td class="diff-cell">${formatSignedMetricDiff(metric, diff, formatter)}</td>`,
    };
  }
  return { cells: "", valueClasses };
}

function preferredSingleProjectSelection(currentValues, allowedProjects) {
  const validCurrent = (currentValues || []).filter((item) => item !== "全部" && allowedProjects.includes(item));
  if (validCurrent.length === 1) {
    return [validCurrent[0]];
  }
  if (validCurrent.includes("FR07")) {
    return ["FR07"];
  }
  if (validCurrent.length) {
    return [validCurrent[0]];
  }
  if (allowedProjects.includes("FR07")) {
    return ["FR07"];
  }
  return allowedProjects.slice(0, 1);
}

function formatMetric(metric, value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "NA";
  }
  const kind = dashboardData.metricMeta[metric]?.kind;
  if (kind === "count") {
    return Math.round(value).toLocaleString("zh-CN");
  }
  if (kind === "rate") {
    return `${(value * 100).toFixed(2)}%`;
  }
  return Number(value).toFixed(2);
}

function metricWeight(metric, row) {
  const kind = dashboardData.metricMeta[metric]?.kind;
  if (kind === "count") {
    return 1;
  }
  const users = Number(row["新增用户数"] || 0);
  return users > 0 ? users : 1;
}

function aggregateRows(rows, metrics) {
  if (!rows.length) {
    return null;
  }
  const result = {};
  for (const metric of metrics) {
    const kind = dashboardData.metricMeta[metric]?.kind;
    if (kind === "count") {
      result[metric] = rows.reduce((sum, row) => sum + Number(row[metric] || 0), 0);
      continue;
    }
    let weightedSum = 0;
    let totalWeight = 0;
    for (const row of rows) {
      const value = Number(row[metric]);
      if (Number.isNaN(value)) continue;
      const weight = metricWeight(metric, row);
      weightedSum += value * weight;
      totalWeight += weight;
    }
    result[metric] = totalWeight ? weightedSum / totalWeight : null;
  }
  return result;
}

function optionsFor(field) {
  return sortDimensionValues(field, uniqueValues(dashboardData.main.rows, field));
}

function optionsForRows(rows, field) {
  return sortDimensionValues(field, uniqueValues(rows, field));
}

function defaultRecentVersionValues(rows = dashboardData.main.rows) {
  const versions = sortDimensionValues(
    "版本号",
    uniqueValues(rows, "版本号").filter((value) => value !== "全部")
  );
  return versions.slice(-2);
}

function parseDateValue(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateValue(date) {
  return date.toISOString().slice(0, 10);
}

function addDateDays(value, offset) {
  const date = parseDateValue(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + offset);
  return formatDateValue(date);
}

function overviewPeriodDates(offsets) {
  const reportDate = appState.filters["报表日期"]?.[0] || optionsFor("报表日期").slice(-1)[0];
  const availableDates = new Set(optionsFor("首次访问日期"));
  return offsets
    .map((offset) => addDateDays(reportDate, offset))
    .filter((value) => value && availableDates.has(value));
}

function overviewCurrentPeriodDates() {
  return overviewPeriodDates([-4, -3, -2]);
}

function overviewPreviousPeriodDates() {
  return overviewPeriodDates([-7, -6, -5]);
}

function versionOptionsForRows(rows) {
  return sortDimensionValues(
    "版本号",
    uniqueValues(rows, "版本号").filter((value) => value !== "全部")
  );
}

function versionFilterOptionsForWorkspace(rows) {
  const versions = versionOptionsForRows(rows);
  if (["country_opt", "adgroup_iteration"].includes(appState.activeWorkspace)) {
    return ["全部", ...versions];
  }
  return versions;
}

function topValuesByUsers(rows, field) {
  const groups = new Map();
  rows.forEach((row) => {
    const value = row[field];
    if (!value || value === "全部") return;
    const next = (groups.get(value) || 0) + Number(row["新增用户数"] || 0);
    groups.set(value, next);
  });
  return [...groups.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value);
}

function topCountriesByUsers(rows) {
  return topValuesByUsers(rows, "国家");
}

function isNotSetValue(value) {
  const text = String(value ?? "").trim().toLowerCase();
  return text === "(not set)" || text === "not set";
}

function adGroupOptionsForRows(rows) {
  const hasAggregateVersion = rows.some((row) => row["版本号"] === "全部");
  const scopedRows = hasAggregateVersion ? rows.filter((row) => row["版本号"] === "全部") : rows;
  const values = uniqueValues(rows, "广告组");
  const ranked = topValuesByUsers(scopedRows, "广告组").filter((value) => value !== "全部");
  const remaining = values.filter((value) => value !== "全部" && !ranked.includes(value));
  const combined = uniqueArray([...ranked, ...remaining]);
  const normalValues = combined.filter((value) => !isNotSetValue(value));
  const notSetValues = combined.filter((value) => isNotSetValue(value));
  const sortedValues = [...normalValues, ...notSetValues];
  return values.includes("全部") ? ["全部", ...sortedValues] : sortedValues;
}

function defaultAdGroupSelections(rows, limit = 5) {
  return adGroupOptionsForRows(rows)
    .filter((item) => item !== "全部" && !isNotSetValue(item))
    .slice(0, limit);
}

function metricCategoryRank(metric) {
  if (metric === "新增用户数") return 0;
  if (metric.includes("留存率")) return 1;
  if (metric.includes("卸载率")) return 2;
  if (metric.startsWith("通知授权率")) return 3;
  if (metric.startsWith("通知展示率")) return 4;
  if (metric.startsWith("人均展示次数")) return 5;
  if (metric.startsWith("通知点击率")) return 6;
  if (metric.startsWith("人均点击次数")) return 7;
  if (metric.startsWith("常驻通知栏展示率")) return 8;
  if (metric.startsWith("常驻通知栏人均展示次数")) return 9;
  if (metric.startsWith("常驻通知栏点击率")) return 10;
  if (metric.startsWith("常驻通知栏人均点击次数")) return 11;
  return METRIC_CATEGORY_ORDER.length + 10;
}

function metricDayRank(metric) {
  const match = metric.match(/D(\d+)/);
  if (!match) return 999;
  return Number(match[1]);
}

function sortCompareMetrics(metrics) {
  return metrics.slice().sort((a, b) => {
    const categoryDiff = metricCategoryRank(a) - metricCategoryRank(b);
    if (categoryDiff !== 0) return categoryDiff;
    const dayDiff = metricDayRank(a) - metricDayRank(b);
    if (dayDiff !== 0) return dayDiff;
    return String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true });
  });
}

function timingMetricRank(metric) {
  if (metric === "新增用户数") return 0;
  if (metric.includes("展示用户率")) return 1;
  if (metric.includes("人均展示次数")) return 2;
  if (metric.includes("通知点击率")) return 3;
  if (metric.includes("人均点击次数")) return 4;
  if (metric.includes("点击转化率")) return 5;
  return 100;
}

function sortTimingMetrics(metrics) {
  return metrics.slice().sort((a, b) => {
    const dayDiff = metricDayRank(a) - metricDayRank(b);
    if (dayDiff !== 0) return dayDiff;
    const rankDiff = timingMetricRank(a) - timingMetricRank(b);
    if (rankDiff !== 0) return rankDiff;
    return String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true });
  });
}

function shouldExcludeLatestFirstVisit(metric) {
  return metric === "D1留存率" || metric === "卸载率_D0";
}

function compareCandidateValues(rows, field) {
  if (field === "国家") {
    return topCountriesByUsers(rows);
  }
  if (field === "广告组") {
    return adGroupOptionsForRows(rows).filter((value) => value !== "全部");
  }
  return optionsForRows(rows, field).filter((value) => value !== "全部");
}

function shouldShowAggregateCompareValue(compareField = appState.compareField) {
  return appState.activeWorkspace === "country_opt" && compareField === "国家";
}

function compareValueOptions(rows, compareField = appState.compareField) {
  const values = compareCandidateValues(rows, compareField);
  if (!shouldShowAggregateCompareValue(compareField)) {
    return values;
  }
  return ["全部", ...values.filter((value) => value !== "全部")];
}

function selectedTimingProjects() {
  const projects = compareCandidateValues(timingRowsBase(), "项目代号");
  const selected = appState.timingProject.filter((project) => projects.includes(project));
  return selected.length ? selected : projects;
}

function timingRowsForCountryOptions() {
  const selectedProjects = selectedTimingProjects();
  const filters = {
    项目代号: selectedProjects,
    报表日期: appState.timingReportDate,
    首次访问日期: appState.timingFirstVisitDate,
    版本号: appState.timingVersion,
  };
  return timingRowsBase().filter((row) =>
    Object.entries(filters).every(([filterField, allowed]) => {
      if (!dashboardData.timing.dimensions.includes(filterField) || !allowed.length) {
        return true;
      }
      if (isAggregateSelection(allowed)) {
        return row[filterField] === "全部";
      }
      return allowed.includes(row[filterField]);
    })
  );
}

function commonCountriesForTimingProjects(rows, projects) {
  const projectCountrySets = projects.map((project) => new Set(
    rows
      .filter((row) => row["项目代号"] === project)
      .map((row) => row["国家"])
      .filter((country) => country && country !== "全部")
  ));
  if (!projectCountrySets.length) {
    return new Set();
  }
  return projectCountrySets.reduce((commonSet, projectSet) =>
    new Set([...commonSet].filter((country) => projectSet.has(country)))
  );
}

function sortTimingCountriesByUsers(rows, allowedCountries) {
  const countryUsers = new Map();
  const seenCohorts = new Set();
  rows.forEach((row) => {
    const country = row["国家"];
    if (!country || country === "全部" || !allowedCountries.has(country)) {
      return;
    }
    const cohortKey = ["项目代号", "报表日期", "首次访问日期", "国家", "版本号"]
      .map((key) => row[key] || "")
      .join("|");
    if (seenCohorts.has(cohortKey)) {
      return;
    }
    seenCohorts.add(cohortKey);
    countryUsers.set(country, (countryUsers.get(country) || 0) + Number(row["新增用户数"] || 0));
  });
  return [...countryUsers.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "zh-Hans-CN"))
    .map(([country]) => country);
}

function timingCountryOptions() {
  const rows = timingRowsForCountryOptions();
  const projects = selectedTimingProjects();
  const countries = commonCountriesForTimingProjects(rows, projects);
  return ["全部", ...sortTimingCountriesByUsers(rows, countries)];
}

function timingOptionsFor(field) {
  if (field === "国家") {
    return timingCountryOptions();
  }
  return sortDimensionValues(field, uniqueValues(timingRowsBase(), field));
}

function isFeatureWorkspace() {
  return appState.activeWorkspace === "feature_module";
}

function isTimingWorkspace(workspaceKey = appState.activeWorkspace) {
  return workspaceKey === "timing_special" || workspaceKey === "notification_copy";
}

function activeTimingAnalysisType(workspaceKey = appState.activeWorkspace) {
  return workspaceKey === "notification_copy" ? "通知文案" : "通知时机";
}

function activeTimingObjectLabel() {
  return activeTimingAnalysisType();
}

function timingRowsBase() {
  const analysisType = activeTimingAnalysisType();
  if (!dashboardData.timing.dimensions.includes("分析类型")) {
    return dashboardData.timing.rows;
  }
  return dashboardData.timing.rows.filter((row) => row["分析类型"] === analysisType);
}

function featureRows() {
  return dashboardData.feature?.rows || [];
}

function featureMetrics() {
  return dashboardData.feature?.metrics || [];
}

function featureOptionsFor(field) {
  const values = uniqueValues(featureRows(), field);
  if (field === "国家") {
    return featureCountryOptions();
  }
  if (field === "分析类型") {
    return values;
  }
  if (field === "国家" || field === "版本号") {
    const allValues = values.includes("全部") ? ["全部"] : [];
    const others = values
      .filter((value) => value !== "全部")
      .sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }));
    return [...allValues, ...others];
  }
  return sortDimensionValues(field, values);
}

function featureRowsForCountryOptions() {
  const filters = {
    报表日期: appState.featureReportDate,
    项目代号: appState.featureProject,
    首次访问日期: appState.featureFirstVisitDate,
    版本号: appState.featureVersion,
    分析类型: appState.featureAnalysisType,
  };
  return featureRows().filter((row) =>
    Object.entries(filters).every(([field, allowed]) => {
      if (!allowed?.length) return true;
      if (isAggregateSelection(allowed)) return row[field] === "全部";
      return allowed.includes(row[field]);
    })
  );
}

function featureCountryOptions() {
  const rows = featureRowsForCountryOptions();
  const countryUsers = new Map();
  const seenCohorts = new Set();
  rows.forEach((row) => {
    const country = row["国家"];
    if (!country || country === "全部") return;
    const cohortKey = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"]
      .map((field) => row[field] || "")
      .join("|");
    if (seenCohorts.has(cohortKey)) return;
    seenCohorts.add(cohortKey);
    countryUsers.set(country, (countryUsers.get(country) || 0) + Number(row["新增用户数"] || 0));
  });
  const countries = [...countryUsers.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "zh-Hans-CN"))
    .map(([country]) => country);
  return featureRows().some((row) => row["国家"] === "全部") ? ["全部", ...countries] : countries;
}

function applyFeatureDefaults(workspaceKey = appState.activeWorkspace) {
  const rows = featureRows();
  if (!rows.length) return;
  const keepValid = (stateKey, field, fallback) => {
    const allowed = featureOptionsFor(field);
    const kept = (appState[stateKey] || []).filter((value) => allowed.includes(value));
    appState[stateKey] = kept.length ? kept : fallback.filter((value) => allowed.includes(value));
  };
  keepValid("featureReportDate", "报表日期", featureOptionsFor("报表日期").slice(-1));
  keepValid("featureProject", "项目代号", featureOptionsFor("项目代号").slice(0, 1));
  keepValid("featureFirstVisitDate", "首次访问日期", featureOptionsFor("首次访问日期").slice(-5));
  applySharedProjectDateToWorkspace(workspaceKey);
  keepValid("featureCountry", "国家", featureOptionsFor("国家").includes("全部") ? ["全部"] : featureOptionsFor("国家").slice(0, 1));
  keepValid("featureVersion", "版本号", featureOptionsFor("版本号").includes("全部") ? ["全部"] : featureOptionsFor("版本号").slice(0, 1));
  const analysisTypes = featureOptionsFor("分析类型");
  const currentTypes = (appState.featureAnalysisType || []).filter((value) => analysisTypes.includes(value));
  appState.featureAnalysisType = currentTypes.length
    ? currentTypes
    : analysisTypes.slice(0, 1);
  appState.featureDays = (appState.featureDays || []).filter((day) => featureMetrics().includes(day));
  if (!appState.featureDays.length) {
    appState.featureDays = featureMetrics().includes("D0") ? ["D0"] : featureMetrics().filter((metric) => /^D\d+$/.test(metric)).slice(0, 1);
  }
  appState.featureColumnDimension = (appState.featureColumnDimension || [])
    .filter((field) => ["项目代号", "版本号", "国家"].includes(field));
  if (!appState.featureColumnDimension.length) {
    appState.featureColumnDimension = ["项目代号"];
  }
  appState.lastFeatureWorkspace = workspaceKey;
  appState.featureGroupDimensions = (appState.featureGroupDimensions || [])
    .filter((field) => ["首次访问日期", "国家", "版本号", "分析类型"].includes(field));
  if (!appState.featureGroupDimensions.length) {
    appState.featureGroupDimensions = ["首次访问日期"];
  }
}

function timingAvailableCompareFields() {
  return ["项目代号", "国家", "版本号"].filter((field) => dashboardData.timing.dimensions.includes(field));
}

function applyTimingDefaults(workspaceKey = appState.activeWorkspace) {
  const keepValid = (stateKey, field, fallback) => {
    const allowed = timingOptionsFor(field);
    const kept = (appState[stateKey] || []).filter((value) => allowed.includes(value));
    appState[stateKey] = kept.length ? kept : fallback.filter((value) => allowed.includes(value));
  };
  keepValid("timingReportDate", "报表日期", timingOptionsFor("报表日期").slice(-1));
  keepValid("timingProject", "项目代号", timingOptionsFor("项目代号").includes("全部") ? ["全部"] : timingOptionsFor("项目代号").slice(0, 2));
  keepValid("timingFirstVisitDate", "首次访问日期", timingOptionsFor("首次访问日期").slice(-5));
  applySharedProjectDateToWorkspace(workspaceKey);
  keepValid("timingVersion", "版本号", timingOptionsFor("版本号").includes("全部") ? ["全部"] : timingOptionsFor("版本号").slice(0, 1));
  keepValid("timingCountry", "国家", timingOptionsFor("国家").includes("全部") ? ["全部"] : timingOptionsFor("国家").slice(0, 1));
  const keptMetrics = (appState.timingMetrics || []).filter((metric) => dashboardData.timing.metrics.includes(metric));
  appState.timingMetrics = keptMetrics.length
    ? keptMetrics
    : DEFAULT_TIMING_METRICS.filter((metric) => dashboardData.timing.metrics.includes(metric));

  const objectOptions = timingOptionsFor("通知时机").filter((item) => item !== "全部");
  const keptObjects = (appState.timingTiming || []).filter((value) => objectOptions.includes(value));
  appState.timingTiming = appState.lastTimingWorkspace === workspaceKey && keptObjects.length
    ? keptObjects
    : objectOptions;
  appState.lastTimingWorkspace = workspaceKey;

  appState.timingGroupDimensions = (appState.timingGroupDimensions || [])
    .filter((field) => ["首次访问日期", "国家", "版本号"].includes(field) && dashboardData.timing.dimensions.includes(field));
  if (!appState.timingGroupDimensions.length) {
    appState.timingGroupDimensions = ["首次访问日期"].filter((field) => dashboardData.timing.dimensions.includes(field));
  }
  if (!timingAvailableCompareFields().includes(appState.timingCompareField)) {
    appState.timingCompareField = timingAvailableCompareFields()[0] || "项目代号";
  }
  appState.timingCompareValues = compareCandidateValues(timingRowsBase(), "项目代号").slice(0, 2);
}

function funnelAvailableCompareFields() {
  return ["项目代号", "版本号"];
}

function ensureDefaults() {
  if (!appState.filters["报表日期"].length) {
    appState.filters["报表日期"] = optionsFor("报表日期");
  }
  if (!appState.filters["项目代号"].length) {
    const projects = optionsFor("项目代号");
    appState.filters["项目代号"] = projects.includes("FR07") ? ["FR07"] : projects.slice(0, 1);
  }
  if (!appState.filters["首次访问日期"].length) {
    const dates = optionsFor("首次访问日期");
    appState.filters["首次访问日期"] = dates.slice(-5);
  }
  if (!appState.filters["国家"].length) {
    appState.filters["国家"] = [];
  }
  if (!appState.filters["版本号"].length) {
    const versions = optionsFor("版本号");
    appState.filters["版本号"] = versions.includes("全部") ? ["全部"] : versions.slice(0, 1);
  }
  if (!appState.compareValues.length) {
    const count = appState.compareField === "国家" ? 5 : 3;
    appState.compareValues = compareCandidateValues(baseRowsForAnalysis(), appState.compareField).slice(0, count);
    if (!appState.compareValues.length) {
      appState.compareValues = compareCandidateValues(dashboardData.main.rows, appState.compareField).slice(0, count);
    }
  }
  const projects = optionsFor("项目代号");
  if (!appState.funnelProject) {
    appState.funnelProject = projects[0] || null;
  }
  if (!appState.funnelCompareValues.length) {
    appState.funnelCompareValues = compareCandidateValues(dashboardData.main.rows, appState.funnelCompareField).slice(0, 2);
  }
  if (!appState.funnelDate.length) {
    appState.funnelDate = optionsFor("报表日期").slice(-1);
  }
  if (!appState.funnelCountry.length) {
    appState.funnelCountry = ["全部"];
  }
  if (!appState.funnelVersion.length) {
    appState.funnelVersion = ["全部"];
  }
  if (!appState.funnelFirstVisitDate.length) {
    appState.funnelFirstVisitDate = ["全部"];
    if (!optionsFor("首次访问日期").includes("全部")) {
      appState.funnelFirstVisitDate = optionsFor("首次访问日期").slice(-1);
    }
  }
  if (!appState.timingFirstVisitDate.length) {
    appState.timingFirstVisitDate = timingOptionsFor("首次访问日期").slice(-5);
  }
  if (!appState.timingReportDate.length && dashboardData.timing.dimensions.includes("报表日期")) {
    appState.timingReportDate = timingOptionsFor("报表日期").slice(-1);
  }
  if (!appState.timingCountry.length) {
    appState.timingCountry = ["全部"];
  }
  if (!appState.timingVersion.length) {
    appState.timingVersion = ["全部"];
  }
  if (!appState.timingProject.length && dashboardData.timing.dimensions.includes("项目代号")) {
    const projects = timingOptionsFor("项目代号");
    appState.timingProject = projects.includes("全部") ? ["全部"] : projects.slice(0, 2);
  }
  if (!appState.timingTiming.length) {
    appState.timingTiming = timingOptionsFor("通知时机").filter((item) => item !== "全部");
  }
  if (!appState.timingGroupDimensions.length) {
    appState.timingGroupDimensions = ["首次访问日期"]
      .filter((field) => dashboardData.timing.dimensions.includes(field));
  }
  if (!timingAvailableCompareFields().includes(appState.timingCompareField)) {
    appState.timingCompareField = timingAvailableCompareFields()[0] || "项目代号";
  }
  if (!appState.timingCompareValues.length) {
    appState.timingCompareValues = compareCandidateValues(dashboardData.timing.rows, "项目代号").slice(0, 2);
  }
}

function filteredMetrics(metrics) {
  return metrics.filter((metric) => COMPARE_METRICS.includes(metric));
}

function applyWorkspaceDefaults(workspaceKey) {
  const workspace = WORKSPACES[workspaceKey];
  if (workspaceKey === "feature_module") {
    applyFeatureDefaults(workspaceKey);
    return;
  }
  if (isTimingWorkspace(workspaceKey)) {
    applyTimingDefaults(workspaceKey);
    return;
  }
  if (!workspace?.compareDefaults) {
    return;
  }
  const defaults = workspace.compareDefaults;
  const workspaceMemory = getWorkspaceMemory(workspaceKey);
  appState.analysisMode = defaults.analysisMode;
  appState.compareField = defaults.compareField;
  appState.countryMode = defaults.countryMode;
  const groupOptions = (workspaceKey === "cross_project" ? ["首次访问日期", "国家"] : DIMENSION_LABELS).filter((field) => {
    if (["报表日期", appState.compareField].includes(field)) return false;
    if (appState.analysisMode === "single_project" && field === "项目代号") return false;
    return true;
  });
  const rememberedGroups = (workspaceMemory.groupDimensions || []).filter((field) => groupOptions.includes(field));
  appState.groupDimensions = rememberedGroups.length ? rememberedGroups : defaults.groupDimensions.slice();
  const rememberedMetrics = filteredMetrics(workspaceMemory.compareMetrics || []);
  appState.compareMetrics = rememberedMetrics.length ? rememberedMetrics : filteredMetrics(defaults.compareMetrics);
  const keepValidSelections = (field, fallbackValues) => {
    const allowed = optionsFor(field);
    const kept = (appState.filters[field] || []).filter((value) => allowed.includes(value));
    appState.filters[field] = kept.length ? kept : fallbackValues.filter((value) => allowed.includes(value));
  };

  if (workspaceKey === "paid_country") {
    appState.filters["国家"] = [];
    appState.filters["广告组"] = [];
    keepValidSelections("报表日期", optionsFor("报表日期").slice(-1));
    if (!appState.hasInitializedPaidCountryProjects) {
      appState.filters["项目代号"] = optionsFor("项目代号").filter((item) => item !== "全部");
      appState.hasInitializedPaidCountryProjects = true;
    } else {
      keepValidSelections("项目代号", optionsFor("项目代号").filter((item) => item !== "全部"));
    }
    keepValidSelections("首次访问日期", optionsFor("首次访问日期").slice(-5));
    applySharedProjectDateToWorkspace(workspaceKey);
    const versions = versionOptionsForRows(baseRowsForAnalysis());
    keepValidSelections("版本号", versions.length ? versions : defaultRecentVersionValues());
  }
  if (workspaceKey === "data_overview") {
    keepValidSelections("报表日期", optionsFor("报表日期").slice(-1));
    const allowedProjects = optionsFor("项目代号").filter((item) => item !== "全部");
    const validProjects = (appState.filters["项目代号"] || []).filter((item) => allowedProjects.includes(item));
    appState.filters["项目代号"] = validProjects.length ? validProjects : allowedProjects.slice();
    keepValidSelections("首次访问日期", overviewCurrentPeriodDates());
    applySharedProjectDateToWorkspace(workspaceKey);
    appState.filters["国家"] = ["全部"];
    appState.filters["广告组"] = ["全部"];
    appState.filters["版本号"] = ["全部"];
    appState.compareValues = appState.filters["项目代号"].slice();
    appState.compareMetrics = DATA_OVERVIEW_METRICS.slice();
  }
  if (workspaceKey === "paid_adgroup") {
    keepValidSelections("报表日期", optionsFor("报表日期").slice(-1));
    const allowedProjects = optionsFor("项目代号").filter((item) => item !== "全部");
    const validProjects = (appState.filters["项目代号"] || []).filter((item) => allowedProjects.includes(item));
    appState.filters["项目代号"] = validProjects.length ? validProjects : allowedProjects.slice();
    keepValidSelections("首次访问日期", optionsFor("首次访问日期").slice(-5));
    applySharedProjectDateToWorkspace(workspaceKey);
    const countryOptions = getCountryUniverse("广告组", appState.compareValues, baseRowsForAnalysis());
    const rememberedCountries = (workspaceMemory["国家"] || []).filter((item) => countryOptions.includes(item));
    appState.filters["国家"] = rememberedCountries.length
      ? rememberedCountries
      : (countryOptions.includes("全部") ? ["全部"] : countryOptions.slice(0, 1));
    appState.filters["广告组"] = [];
    appState.filters["版本号"] = ["全部"];
  }
  if (workspaceKey === "country_opt") {
    const projects = optionsFor("项目代号").filter((item) => item !== "全部");
    appState.filters["项目代号"] = preferredSingleProjectSelection(appState.filters["项目代号"], projects);
    keepValidSelections("报表日期", optionsFor("报表日期").slice(-1));
    keepValidSelections("首次访问日期", optionsFor("首次访问日期").slice(-5));
    applySharedProjectDateToWorkspace(workspaceKey);
    const countryOptions = getCountryUniverse("国家", appState.compareValues, baseRowsForAnalysis());
    const rememberedCountries = (workspaceMemory["国家"] || []).filter((item) => countryOptions.includes(item));
    appState.filters["国家"] = rememberedCountries.length ? rememberedCountries : countryOptions.slice(0, 1);
    const adGroupOptions = adGroupOptionsForRows(baseRowsForAnalysis());
    const rememberedAdGroups = (workspaceMemory["广告组"] || []).filter((item) => adGroupOptions.includes(item) && !isNotSetValue(item));
    appState.filters["广告组"] = rememberedAdGroups.length
      ? rememberedAdGroups
      : (adGroupOptions.includes("全部") ? ["全部"] : adGroupOptions.slice(0, 1));
    const versions = versionFilterOptionsForWorkspace(baseRowsForAnalysis());
    const rememberedVersions = (workspaceMemory["版本号"] || []).filter((item) => versions.includes(item));
    appState.filters["版本号"] = rememberedVersions.length
      ? rememberedVersions
      : (versions.includes("全部") ? ["全部"] : versions.slice(0, 1));
  }
  if (workspaceKey === "version_iteration") {
    const projects = optionsFor("项目代号").filter((item) => item !== "全部");
    appState.filters["项目代号"] = preferredSingleProjectSelection(appState.filters["项目代号"], projects);
    keepValidSelections("报表日期", optionsFor("报表日期").slice(-1));
    keepValidSelections("首次访问日期", optionsFor("首次访问日期").slice(-5));
    applySharedProjectDateToWorkspace(workspaceKey);
    const countryOptions = getCountryUniverse("版本号", appState.compareValues, baseRowsForAnalysis());
    const rememberedCountries = (workspaceMemory["国家"] || []).filter((item) => countryOptions.includes(item));
    appState.filters["国家"] = rememberedCountries.length
      ? rememberedCountries.slice(0, 1)
      : (countryOptions.includes("全部") ? ["全部"] : countryOptions.slice(0, 1));
    const adGroupOptions = adGroupOptionsForRows(baseRowsForAnalysis());
    const rememberedAdGroups = (workspaceMemory["广告组"] || []).filter((item) => adGroupOptions.includes(item) && !isNotSetValue(item));
    appState.filters["广告组"] = rememberedAdGroups.length
      ? rememberedAdGroups
      : (adGroupOptions.includes("全部") ? ["全部"] : adGroupOptions.slice(0, 1));
    const versionRows = baseRowsForAnalysis().filter((row) => {
      const selectedCountry = appState.filters["国家"]?.[0];
      return !selectedCountry || selectedCountry === "全部" || row["国家"] === selectedCountry;
    });
    const recentVersions = defaultRecentVersionValues(versionRows);
    const rememberedVersions = (workspaceMemory["版本号"] || []).filter((item) => versionOptionsForRows(versionRows).includes(item));
    appState.filters["版本号"] = rememberedVersions.length
      ? rememberedVersions
      : (recentVersions.length ? recentVersions : defaultRecentVersionValues());
    appState.compareValues = appState.filters["版本号"].slice();
  }
  if (workspaceKey === "adgroup_iteration") {
    const projects = optionsFor("项目代号").filter((item) => item !== "全部");
    appState.filters["项目代号"] = preferredSingleProjectSelection(appState.filters["项目代号"], projects);
    keepValidSelections("报表日期", optionsFor("报表日期").slice(-1));
    keepValidSelections("首次访问日期", optionsFor("首次访问日期").slice(-5));
    applySharedProjectDateToWorkspace(workspaceKey);
    const countryOptions = getCountryUniverse("广告组", appState.compareValues, baseRowsForAnalysis());
    const rememberedCountries = (workspaceMemory["国家"] || []).filter((item) => countryOptions.includes(item));
    appState.filters["国家"] = rememberedCountries.length
      ? rememberedCountries.slice(0, 1)
      : (countryOptions.includes("全部") ? ["全部"] : countryOptions.slice(0, 1));
    const versionRows = baseRowsForAnalysis().filter((row) => {
      const selectedCountry = appState.filters["国家"]?.[0];
      return !selectedCountry || selectedCountry === "全部" || row["国家"] === selectedCountry;
    });
    const recentVersions = defaultRecentVersionValues(versionRows);
    const versionOptions = ["全部", ...versionOptionsForRows(versionRows)];
    const rememberedVersions = (workspaceMemory["版本号"] || []).filter((item) => versionOptions.includes(item));
    appState.filters["版本号"] = rememberedVersions.length
      ? rememberedVersions.slice(-1)
      : (recentVersions.length ? recentVersions.slice(-1) : defaultRecentVersionValues().slice(-1));
    const adGroupRows = applyDimensionFilters(baseRowsForAnalysis(), {
      报表日期: appState.filters["报表日期"],
      首次访问日期: appState.filters["首次访问日期"],
      国家: appState.filters["国家"],
      版本号: appState.filters["版本号"],
    });
    const adGroupOptions = adGroupOptionsForRows(adGroupRows).filter((item) => item !== "全部");
    const defaultAdGroups = defaultAdGroupSelections(adGroupRows, 5);
    const rememberedAdGroups = (workspaceMemory["广告组"] || []).filter((item) => adGroupOptions.includes(item));
    appState.filters["广告组"] = rememberedAdGroups.length
      ? rememberedAdGroups
      : defaultAdGroups;
    appState.compareValues = appState.filters["广告组"].slice();
  }
  if (workspaceKey === "cross_project") {
    keepValidSelections("报表日期", optionsFor("报表日期").slice(-1));
    const allowedProjects = optionsFor("项目代号").filter((item) => item !== "全部");
    const validProjects = (appState.filters["项目代号"] || []).filter((item) => allowedProjects.includes(item));
    appState.filters["项目代号"] = validProjects.length ? validProjects.slice(0, 2) : allowedProjects.slice(0, 2);
    keepValidSelections("首次访问日期", optionsFor("首次访问日期").slice(-5));
    applySharedProjectDateToWorkspace(workspaceKey);
    appState.filters["版本号"] = ["全部"];
    const sharedCountries = getCountryUniverse("项目代号", appState.filters["项目代号"], baseRowsForAnalysis());
    const rememberedCountries = (workspaceMemory["国家"] || []).filter((item) => sharedCountries.includes(item));
    appState.filters["国家"] = rememberedCountries.length
      ? rememberedCountries.slice(0, 1)
      : (sharedCountries.includes("全部") ? ["全部"] : sharedCountries.slice(0, 1));
    const adGroupOptions = adGroupOptionsForRows(baseRowsForAnalysis());
    const rememberedAdGroups = (workspaceMemory["广告组"] || []).filter((item) => adGroupOptions.includes(item));
    appState.filters["广告组"] = rememberedAdGroups.length
      ? rememberedAdGroups
      : (adGroupOptions.includes("全部") ? ["全部"] : adGroupOptions.slice(0, 1));
    appState.compareValues = appState.filters["项目代号"].slice();
  }
  if (workspaceKey === "version_iteration" || workspaceKey === "adgroup_iteration" || workspaceKey === "cross_project") {
    return;
  }
  const compareDefaults = compareCandidateValues(baseRowsForAnalysis(), appState.compareField);
  appState.compareValues = compareDefaults.slice(0, appState.compareField === "国家" ? 5 : 3);
}

function workspaceSections() {
  return {
    compareControls: document.querySelector("#compare-controls-panel"),
    funnelControls: document.querySelector("#funnel-controls-panel"),
    timingControls: document.querySelector("#timing-controls-panel"),
    featureControls: document.querySelector("#feature-controls-panel"),
    compareSummary: document.querySelector("#compare-summary-panel"),
    compareDetails: document.querySelector("#compare-details-panel"),
    structure: document.querySelector("#country-structure-panel"),
    funnelResult: document.querySelector("#funnel-result-panel"),
    timingResult: document.querySelector("#timing-result-panel"),
    featureResult: document.querySelector("#feature-result-panel"),
  };
}

function setHidden(node, hidden) {
  if (!node) return;
  node.classList.toggle("hidden-panel", hidden);
}

function renderWorkspaceChrome() {
  const nav = document.querySelector("#workspace-nav");
  const note = document.querySelector("#workspace-note");
  if (WORKSPACES[appState.activeWorkspace]?.hidden) {
    appState.activeWorkspace = Object.keys(WORKSPACES).find((key) => !WORKSPACES[key].hidden) || appState.activeWorkspace;
  }
  if (nav) {
    nav.innerHTML = Object.entries(WORKSPACES).filter(([, item]) => !item.hidden).map(([key, item]) => `
      <button type="button" class="workspace-chip ${appState.activeWorkspace === key ? "active" : ""}" data-workspace="${key}">
        ${item.label}
      </button>
    `).join("");
    nav.querySelectorAll("[data-workspace]").forEach((button) => {
      button.onclick = () => {
        const nextWorkspace = button.dataset.workspace;
        if (nextWorkspace === appState.activeWorkspace) return;
        saveWorkspaceMemory(appState.activeWorkspace);
        appState.activeWorkspace = nextWorkspace;
        applyWorkspaceDefaults(nextWorkspace);
        rerender();
      };
    });
  }
  if (note) {
    note.textContent = WORKSPACES[appState.activeWorkspace]?.note || "";
  }

  const sections = workspaceSections();
  const showFeature = isFeatureWorkspace();
  const showTiming = isTimingWorkspace();
  const showCompare = !showTiming && !showFeature;
  const showCompareControls = showCompare && appState.activeWorkspace !== "data_overview";
  const showFunnel = false;
  const showStructure = appState.activeWorkspace === "cross_project";
  const showCompareDetails = showCompare && !["data_overview", "paid_country", "paid_adgroup"].includes(appState.activeWorkspace);

  setHidden(sections.compareControls, !showCompareControls);
  setHidden(sections.compareSummary, !showCompare);
  setHidden(sections.compareDetails, !showCompareDetails);
  setHidden(sections.funnelControls, !showFunnel);
  setHidden(sections.funnelResult, !showFunnel);
  setHidden(sections.timingControls, !showTiming);
  setHidden(sections.timingResult, !showTiming);
  setHidden(sections.featureControls, !showFeature);
  setHidden(sections.featureResult, !showFeature);
  setHidden(sections.structure, !showStructure);

  const compareControlsTitle = document.querySelector("#compare-controls-title");
  const summaryTitle = document.querySelector("#compare-summary-title");
  const summaryDesc = document.querySelector("#compare-summary-desc");
  const detailsTitle = document.querySelector("#compare-details-title");
  const detailsDesc = document.querySelector("#compare-details-desc");
  const funnelTitle = document.querySelector("#funnel-title");
  const funnelDesc = document.querySelector("#funnel-desc");
  const timingTitle = document.querySelector("#timing-title");
  const timingDesc = document.querySelector("#timing-desc");
  const timingControlsTitle = document.querySelector("#timing-controls-panel h2");
  const featureTitle = document.querySelector("#feature-title");
  const featureDesc = document.querySelector("#feature-desc");

  if (appState.activeWorkspace === "data_overview") {
    compareControlsTitle.textContent = "AI分析助手控制台";
    summaryTitle.textContent = "AI数据分析助手";
    summaryDesc.textContent = "可以问项目间数据差距，也可以问单项目新旧版本迭代效果。";
    detailsTitle.textContent = "AI分析明细";
    detailsDesc.textContent = "当前菜单以问答分析为主，普通明细表暂不展示。";
  } else if (appState.activeWorkspace === "paid_country") {
    compareControlsTitle.textContent = "买量国家对比控制台";
    summaryTitle.textContent = "买量国家对比速览";
    summaryDesc.textContent = "先看 top 10 国家用户占比在时间维度上的变化，再看不同项目之间的横向差异。";
    detailsTitle.textContent = "分国家指标明细";
    detailsDesc.textContent = "按首次访问日期拆开看 top 10 国家之间的新增用户和质量指标差异。";
  } else if (appState.activeWorkspace === "paid_adgroup") {
    compareControlsTitle.textContent = "广告组对比控制台";
    summaryTitle.textContent = "广告组对比速览";
    summaryDesc.textContent = "先看 top 广告组用户占比、排名和时间变化，判断买量结构是否集中或波动。";
    detailsTitle.textContent = "分广告组指标明细";
    detailsDesc.textContent = "按首次访问日期拆开看广告组之间的新增用户和质量指标差异。";
  } else if (appState.activeWorkspace === "country_opt") {
    compareControlsTitle.textContent = "单项目国家对比控制台";
    summaryTitle.textContent = "单项目国家对比速览";
    summaryDesc.textContent = "先看不同国家在哪些关键指标上拖后腿，方便决定优先优化哪里。";
    detailsTitle.textContent = "分国家指标明细";
    detailsDesc.textContent = "在当前项目、版本和日期范围下，逐组查看国家之间的指标差距。";
  } else if (appState.activeWorkspace === "version_iteration") {
    compareControlsTitle.textContent = "单项目版本对比控制台";
    summaryTitle.textContent = "迭代效果速览";
    summaryDesc.textContent = "先判断这次版本对比是否样本充足，再看哪些指标出现了真实变化。";
    detailsTitle.textContent = "数据明细";
    detailsDesc.textContent = "根据当前筛选的首次访问日期和国家，直接查看所勾选版本号之间的数据差异。";
  } else if (appState.activeWorkspace === "adgroup_iteration") {
    compareControlsTitle.textContent = "单项目广告组对比控制台";
    summaryTitle.textContent = "广告组效果速览";
    summaryDesc.textContent = "先判断广告组样本是否足够，再看不同广告组在质量指标上的真实差异。";
    detailsTitle.textContent = "广告组数据明细";
    detailsDesc.textContent = "固定单项目和单版本后，按首次访问日期查看所勾选广告组之间的数据差异。";
  } else if (appState.activeWorkspace === "cross_project") {
    compareControlsTitle.textContent = "多项目对比控制台";
    summaryTitle.textContent = "多项目对比速览";
    summaryDesc.textContent = "统一维度口径后，先看哪些项目在哪些核心指标上落后。";
    detailsTitle.textContent = "多项目分组明细";
    detailsDesc.textContent = "逐组查看项目代号之间的指标差距，并结合国家结构判断差异来源。";
  } else if (appState.activeWorkspace === "timing_special") {
    if (timingControlsTitle) timingControlsTitle.textContent = "通知时机对比控制台";
    timingTitle.textContent = "通知时机对比";
    timingDesc.textContent = "固定筛选范围后，按列对比维度查看相同通知时机在项目、国家或版本上的展示与点击表现。";
  } else if (appState.activeWorkspace === "notification_copy") {
    if (timingControlsTitle) timingControlsTitle.textContent = "通知文案对比控制台";
    timingTitle.textContent = "通知文案对比";
    timingDesc.textContent = "固定筛选范围后，按列对比维度查看相同通知文案在项目、国家或版本上的展示与点击表现。";
  } else if (appState.activeWorkspace === "feature_module") {
    if (featureTitle) featureTitle.textContent = "功能模块";
    if (featureDesc) featureDesc.textContent = "按分析类型查看各类功能漏斗和首页模块点击率。";
  }
}

function baseRowsForAnalysis() {
  let rows = dashboardData.main.rows.slice();
  if (appState.analysisMode === "single_project") {
    const project = appState.filters["项目代号"][0];
    if (project) {
      rows = rows.filter((row) => row["项目代号"] === project);
    }
  }
  if (["paid_country", "paid_adgroup", "cross_project"].includes(appState.activeWorkspace)) {
    rows = rows.filter((row) => row["版本号"] === "全部");
  }
  return rows;
}

function availableCompareFields() {
  if (appState.activeWorkspace === "data_overview") {
    return ["项目代号"];
  }
  if (appState.activeWorkspace === "paid_country") {
    return ["国家"];
  }
  if (appState.activeWorkspace === "paid_adgroup") {
    return ["广告组"];
  }
  if (appState.activeWorkspace === "adgroup_iteration") {
    return ["广告组"];
  }
  return appState.analysisMode === "single_project"
    ? ["版本号", "国家", "首次访问日期"]
    : ["项目代号", "国家", "首次访问日期"];
}

function activeFilterFields() {
  if (appState.activeWorkspace === "data_overview") {
    return ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"];
  }
  if (appState.activeWorkspace === "paid_country") {
    return ["报表日期", "项目代号", "首次访问日期"];
  }
  if (appState.activeWorkspace === "paid_adgroup") {
    return ["报表日期", "项目代号", "首次访问日期", "国家"];
  }
  if (appState.activeWorkspace === "cross_project") {
    return ["项目代号", "国家", "广告组", "报表日期", "首次访问日期"];
  }
  if (appState.analysisMode === "single_project") {
    return ["报表日期", "项目代号", "首次访问日期", "国家", "广告组", "版本号"];
  }
  return ["报表日期", "项目代号", "首次访问日期", "国家", "广告组"];
}

function visibleFilterFields(compareField) {
  if (appState.activeWorkspace === "data_overview") {
    return activeFilterFields();
  }
  if (appState.activeWorkspace === "version_iteration" && compareField === "版本号") {
    return activeFilterFields();
  }
  if (appState.activeWorkspace === "adgroup_iteration" && compareField === "广告组") {
    return activeFilterFields();
  }
  if (appState.activeWorkspace === "cross_project" && compareField === "项目代号") {
    return activeFilterFields();
  }
  return activeFilterFields().filter((field) => field !== compareField);
}

function getCountryUniverse(compareField, compareValues, rows) {
  const actualCountries = topCountriesByUsers(rows).filter((country) => country !== "全部");
  if (appState.activeWorkspace === "paid_adgroup") {
    return ["全部", ...actualCountries];
  }
  if (["version_iteration", "adgroup_iteration"].includes(appState.activeWorkspace)) {
    return ["全部", ...actualCountries];
  }
  if (appState.analysisMode === "single_project") {
    return appState.countryMode === "single_country" ? actualCountries : ["全部", ...actualCountries];
  }
  const subjects = compareField === "项目代号"
    ? compareValues
    : uniqueValues(rows, "项目代号");
  const subjectCountries = subjects
    .map((subject) => new Set(
      rows
        .filter((row) => row["项目代号"] === subject)
        .map((row) => row["国家"])
        .filter((country) => country !== "全部")
    ))
    .filter((set) => set.size);
  if (!subjectCountries.length) {
    return [];
  }
  let intersection = [...subjectCountries[0]];
  for (const set of subjectCountries.slice(1)) {
    intersection = intersection.filter((country) => set.has(country));
  }
  const rankedIntersection = actualCountries.filter((country) => intersection.includes(country));
  if (appState.activeWorkspace === "cross_project") {
    return ["全部", ...rankedIntersection];
  }
  const allCountries = sortDimensionValues("国家", [...new Set(subjectCountries.flatMap((set) => [...set]))]);
  if (appState.countryMode === "single_country") {
    return rankedIntersection.length ? rankedIntersection : sortDimensionValues("国家", intersection);
  }
  return sortDimensionValues("国家", ["全部", ...allCountries.filter((country) => country !== "全部")]);
}

function subjectKeysForStructure(rows, compareField, compareValues) {
  if (compareField === "项目代号") {
    return compareValues.length ? compareValues : uniqueValues(rows, "项目代号");
  }
  return compareValues.length ? compareValues : uniqueValues(rows, compareField);
}

function computeCountryStructure(compareRows, compareField, compareValues) {
  const subjects = subjectKeysForStructure(compareRows, compareField, compareValues);
  return subjects.map((subject) => {
    const scopedRows = compareRows.filter((row) => row[compareField] === subject);
    const totalUsers = scopedRows.reduce((sum, row) => sum + Number(row["新增用户数"] || 0), 0);
    const countryStats = sortDimensionValues("国家", uniqueValues(scopedRows, "国家"))
      .filter((country) => country !== "全部")
      .map((country) => {
        const users = scopedRows
          .filter((row) => row["国家"] === country)
          .reduce((sum, row) => sum + Number(row["新增用户数"] || 0), 0);
        return {
          country,
          users,
          share: totalUsers ? users / totalUsers : 0,
        };
      })
      .filter((item) => item.users > 0)
      .sort((a, b) => b.users - a.users)
      .slice(0, 5);
    return {
      subject,
      totalUsers,
      countryStats,
    };
  }).filter((item) => item.totalUsers > 0);
}

function renderCheckboxGroup(container, items, stateKey, onChange, chipClass = "") {
  container.innerHTML = "";
  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${chipClass} ${stateKey.includes(item) ? "active" : ""}`.trim();
    button.textContent = item;
    button.addEventListener("click", () => onChange(item));
    container.appendChild(button);
  }
}

function renderMultiSelect(container, items, selectedValues, onChange, options = {}) {
  container.innerHTML = "";
  const { multiple = true, placeholder = "请选择", summary = null, bulkActions = null } = options;
  const selectId = container.id || container.dataset.filter || options.selectId || Math.random().toString(36).slice(2);
  const singleInputName = `single-${selectId}`;
  const shell = document.createElement("div");
  shell.className = "multi-select-shell";
  shell.dataset.selectId = selectId;
  if (appState.openSelectId === selectId) {
    shell.classList.add("open");
  }

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "multi-select-trigger";

  const selectedText = selectedValues.length
    ? (summary ? summary(selectedValues) : selectedValues.join("、"))
    : placeholder;
  trigger.innerHTML = `
    <span class="multi-select-label ${selectedValues.length ? "" : "placeholder"}">${selectedText}</span>
    <span class="multi-select-arrow">▾</span>
  `;

  const panel = document.createElement("div");
  panel.className = "multi-select-panel";

  const resolvedBulkActions = bulkActions ?? (multiple && items.length >= 6);

  const syncPanelSelection = (values) => {
    const selectedSet = new Set(values);
    panel.querySelectorAll("input").forEach((node) => {
      node.checked = selectedSet.has(node.value);
    });
  };

  const emitSelection = (values) => {
    appState.openSelectId = selectId;
    appState.selectScrollTops[selectId] = panel.scrollTop;
    syncPanelSelection(values);
    onChange(values);
  };

  panel.addEventListener("scroll", () => {
    appState.selectScrollTops[selectId] = panel.scrollTop;
  });

  if (resolvedBulkActions && items.length) {
    const actionBar = document.createElement("div");
    actionBar.className = "multi-select-actions";

    const selectAllButton = document.createElement("button");
    selectAllButton.type = "button";
    selectAllButton.className = "multi-select-action";
    selectAllButton.textContent = "全选";
    selectAllButton.onmousedown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    selectAllButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      emitSelection(items.slice());
    };

    const invertButton = document.createElement("button");
    invertButton.type = "button";
    invertButton.className = "multi-select-action";
    invertButton.textContent = "反选";
    invertButton.onmousedown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    invertButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const inverted = items.filter((item) => !selectedValues.includes(item));
      emitSelection(inverted);
    };

    actionBar.appendChild(selectAllButton);
    actionBar.appendChild(invertButton);
    panel.appendChild(actionBar);
  }

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "multi-select-empty";
    empty.textContent = "暂无可选项";
    panel.appendChild(empty);
  } else {
    for (const item of items) {
      const row = document.createElement("label");
      row.className = "multi-select-option";

      const input = document.createElement("input");
      input.type = multiple ? "checkbox" : "radio";
      input.name = multiple ? "" : singleInputName;
      input.value = item;
      input.checked = selectedValues.includes(item);
      input.onchange = () => {
        let nextValues;
        if (multiple) {
          nextValues = [...panel.querySelectorAll("input:checked")].map((node) => node.value);
          emitSelection(nextValues);
        } else {
          nextValues = input.checked ? input.value : "";
          appState.selectScrollTops[selectId] = panel.scrollTop;
          appState.openSelectId = null;
          shell.classList.remove("open");
          onChange(nextValues);
        }
      };

      const text = document.createElement("span");
      text.textContent = item;

      row.appendChild(input);
      row.appendChild(text);
      if (!multiple) {
        row.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!input.checked) {
            input.checked = true;
          }
          input.dispatchEvent(new Event("change", { bubbles: true }));
        };
      }
      panel.appendChild(row);
    }
  }

  trigger.onclick = () => {
    document.querySelectorAll(".panel.select-open").forEach((node) => node.classList.remove("select-open"));
    document.querySelectorAll(".multi-select-shell.open").forEach((node) => {
      if (node !== shell) {
        node.classList.remove("open");
      }
    });
    const willOpen = !shell.classList.contains("open");
    shell.classList.toggle("open");
    appState.openSelectId = willOpen ? selectId : null;
    const hostPanel = shell.closest(".panel");
    if (hostPanel && willOpen) {
      hostPanel.classList.add("select-open");
    }
  };

  shell.appendChild(trigger);
  shell.appendChild(panel);
  container.appendChild(shell);
  if (appState.openSelectId === selectId) {
    requestAnimationFrame(() => {
      panel.scrollTop = appState.selectScrollTops[selectId] || 0;
    });
  }
}

function toggleFromArray(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function isAggregateSelection(allowed) {
  return allowed.length === 1 && allowed[0] === "全部";
}

function applyDimensionFilters(rows, filters) {
  return rows.filter((row) =>
    Object.entries(filters).every(([field, allowed]) => {
      if (!allowed.length) {
        return true;
      }
      if (isAggregateSelection(allowed)) {
        return row[field] === "全部";
      }
      return allowed.includes(row[field]);
    })
  );
}

function computeCompareAnalysis() {
  if (["data_overview", "cross_project"].includes(appState.activeWorkspace)) {
    appState.compareField = "项目代号";
    const selectedProjects = (appState.filters["项目代号"] || []).filter((value) => value !== "全部");
    if (selectedProjects.length) {
      appState.compareValues = selectedProjects.slice();
    }
  }
  const compareField = availableCompareFields().includes(appState.compareField) ? appState.compareField : availableCompareFields()[0];
  appState.compareField = compareField;
  const compareBaseRows = baseRowsForAnalysis();
  const countryUniverse = getCountryUniverse(compareField, appState.compareValues, compareBaseRows);
  if (!appState.filters["国家"].length) {
    appState.filters["国家"] = appState.countryMode === "single_country"
      ? countryUniverse.slice(0, 1)
      : countryUniverse.includes("全部") ? ["全部"] : countryUniverse.slice();
  }
  if (appState.countryMode === "single_country") {
    appState.filters["国家"] = appState.filters["国家"].filter((country) => countryUniverse.includes(country)).slice(0, 1);
    if (!appState.filters["国家"].length && countryUniverse.length) {
      appState.filters["国家"] = [countryUniverse[0]];
    }
  } else {
    const hasAll = appState.filters["国家"].includes("全部");
    appState.filters["国家"] = hasAll
      ? ["全部"]
      : appState.filters["国家"].filter((country) => countryUniverse.includes(country));
    if (!appState.filters["国家"].length) {
      appState.filters["国家"] = countryUniverse.includes("全部") ? ["全部"] : countryUniverse.slice(0, 3);
    }
  }

  const effectiveFilters = {};
  for (const field of visibleFilterFields(compareField)) {
    effectiveFilters[field] = appState.filters[field];
  }
  const filteredRows = applyDimensionFilters(compareBaseRows, effectiveFilters);
  const compareMetrics = appState.compareMetrics.slice();
  const isPaidShareWorkspace = ["paid_country", "paid_adgroup"].includes(appState.activeWorkspace);
  const compareSourceRows = isPaidShareWorkspace ? filteredRows : compareBaseRows;
  const compareCandidates = compareValueOptions(compareSourceRows, compareField);
  const compareValues = isPaidShareWorkspace
    ? compareCandidates.slice(0, 10)
    : (appState.compareValues.length
      ? appState.compareValues.filter((value) => compareCandidates.includes(value))
      : compareCandidates);
  appState.compareValues = compareValues;
  const groupDimensions = appState.groupDimensions.filter((field) => field !== compareField);

  const groupMap = new Map();
  for (const row of filteredRows) {
    if (!compareValues.includes(row[compareField])) continue;
    const groupKey = JSON.stringify(groupDimensions.map((field) => row[field]));
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        key: groupKey,
        labels: groupDimensions.map((field) => `${field}: ${row[field]}`),
        compareData: {},
      });
    }
    const group = groupMap.get(groupKey);
    const compareKey = row[compareField];
    group.compareData[compareKey] = group.compareData[compareKey] || [];
    group.compareData[compareKey].push(row);
  }

  const groups = [];
  for (const group of groupMap.values()) {
    const aggregated = {};
    for (const compareValue of compareValues) {
      if (!group.compareData[compareValue]?.length) continue;
      aggregated[compareValue] = aggregateRows(group.compareData[compareValue], compareMetrics);
    }
    const validSubjects = Object.keys(aggregated);
    if (!validSubjects.length) continue;

    const metricDiffs = compareMetrics.map((metric) => {
      const values = validSubjects
        .map((subject) => aggregated[subject][metric])
        .filter((value) => value !== null && value !== undefined && !Number.isNaN(Number(value)));
      const min = values.length ? Math.min(...values) : null;
      const max = values.length ? Math.max(...values) : null;
      const diff = values.length >= 2 ? max - min : 0;
      return {
        metric,
        min,
        max,
        diff,
        relativeDiff: min === null || min === 0 ? null : diff / Math.abs(min),
        kind: dashboardData.metricMeta[metric]?.kind,
      };
    });
    metricDiffs.sort((a, b) => b.diff - a.diff);
    groups.push({
      ...group,
      aggregated,
      validSubjects,
      metricDiffs,
      strongestDiff: metricDiffs[0],
    });
  }

  if (groupDimensions.includes("首次访问日期")) {
    groups.sort((a, b) => {
      const firstVisitIndex = groupDimensions.indexOf("首次访问日期");
      const aDate = JSON.parse(a.key)[firstVisitIndex] || "";
      const bDate = JSON.parse(b.key)[firstVisitIndex] || "";
      const dateDiff = String(bDate).localeCompare(String(aDate), "zh-Hans-CN", { numeric: true });
      if (dateDiff !== 0) return dateDiff;
      return (b.strongestDiff?.diff || 0) - (a.strongestDiff?.diff || 0);
    });
  } else {
    groups.sort((a, b) => (b.strongestDiff?.diff || 0) - (a.strongestDiff?.diff || 0));
  }

  const overallMetricDiffs = compareMetrics.map((metric) => {
    const subjectRows = compareValues
      .map((subject) => filteredRows.filter((row) => row[compareField] === subject))
      .filter((rows) => rows.length);
    const aggregatedSubjects = subjectRows.map((rows) => aggregateRows(rows, [metric])[metric]);
    if (!aggregatedSubjects.length) {
      return null;
    }
    const min = Math.min(...aggregatedSubjects);
    const max = Math.max(...aggregatedSubjects);
    return {
      metric,
      min,
      max,
      diff: aggregatedSubjects.length >= 2 ? max - min : 0,
      kind: dashboardData.metricMeta[metric]?.kind,
      subjectValues: compareValues
        .map((subject) => ({
          subject,
          value: filteredRows.filter((row) => row[compareField] === subject).length
            ? aggregateRows(filteredRows.filter((row) => row[compareField] === subject), [metric])[metric]
            : null,
        }))
        .filter((item) => item.value !== null),
    };
  }).filter(Boolean).sort((a, b) => b.diff - a.diff);

  const rankedMetricInsights = overallMetricDiffs.map((item) => {
    const rankedSubjects = item.subjectValues.slice().sort((a, b) => {
      const lowerBetter = item.metric.includes("卸载率");
      return lowerBetter ? a.value - b.value : b.value - a.value;
    });
    const best = rankedSubjects[0] || null;
    const worst = rankedSubjects[rankedSubjects.length - 1] || null;
    const baseline = worst ? Math.abs(worst.value) : 0;
    const relativeGap = baseline > 1e-9 ? item.diff / baseline : item.diff;
    return {
      ...item,
      best,
      worst,
      relativeGap,
    };
  }).sort((a, b) => b.relativeGap - a.relativeGap);

  const subjectSampleStats = compareValues
    .map((subject) => ({
      subject,
      users: filteredRows.filter((row) => row[compareField] === subject).length
        ? aggregateRows(filteredRows.filter((row) => row[compareField] === subject), ["新增用户数"])["新增用户数"]
        : 0,
    }))
    .filter((item) => item.users > 0);

  return {
    filteredRows,
    compareBaseRows,
    compareMetrics,
    compareField,
    compareValues,
    groupDimensions,
    groups,
    overallMetricDiffs,
    rankedMetricInsights,
    sampleAssessment: evaluateSampleAssessment(subjectSampleStats),
    subjectSampleStats,
    eligibleInsights: buildEligibleInsights(rankedMetricInsights, subjectSampleStats),
    countryUniverse,
    countryStructure: computeCountryStructure(filteredRows, compareField, compareValues),
    showStructureWarning:
      appState.countryMode === "multi_country" &&
      appState.filters["国家"].includes("全部") &&
      compareField === "项目代号",
  };
}

function evaluateSampleAssessment(subjectSampleStats) {
  if (!subjectSampleStats.length) {
    return {
      level: "low",
      title: "样本不足",
      summary: "当前没有足够样本支撑判断。",
      detail: "请先检查筛选条件或补充更多日期/国家后再比较。",
    };
  }
  const users = subjectSampleStats.map((item) => item.users);
  const totalUsers = users.reduce((sum, value) => sum + value, 0);
  const minUsers = Math.min(...users);
  const maxUsers = Math.max(...users);
  const ratio = minUsers > 0 ? maxUsers / minUsers : Infinity;

  if (minUsers < 30 || totalUsers < 100) {
    return {
      level: "low",
      title: "样本不足",
      summary: `最少主体只有 ${Math.round(minUsers)} 个新增用户，当前说谁更好并不严谨。`,
      detail: "建议先扩样本，或者只把这里当成方向性观察，不下结论。",
    };
  }
  if (minUsers < 80 || totalUsers < 300) {
    return {
      level: "mid",
      title: "谨慎解读",
      summary: `当前样本量还偏少，最少主体 ${Math.round(minUsers)} 个新增用户。`,
      detail: "可以看趋势，但不建议把细微差距直接当成稳定结论。",
    };
  }
  if (ratio >= 4) {
    return {
      level: "mid",
      title: "样本不均衡",
      summary: `不同主体样本量差异较大，最大约是最小的 ${ratio.toFixed(1)} 倍。`,
      detail: "对比方向可以看，但最好结合分组明细，避免被量级差异放大感知。",
    };
  }
  return {
    level: "high",
    title: "样本相对充分",
    summary: `最少主体 ${Math.round(minUsers)} 个新增用户，总样本 ${Math.round(totalUsers)}。`,
    detail: "当前对比更适合做版本/日期间的结论判断，但仍建议回看分组明细确认。",
  };
}

function isConclusionEligible(users) {
  return Number(users || 0) >= MIN_CONCLUSION_SAMPLE;
}

function buildEligibleInsights(rankedMetricInsights, subjectSampleStats) {
  const eligibleSubjects = new Set(
    subjectSampleStats
      .filter((item) => isConclusionEligible(item.users))
      .map((item) => item.subject)
  );

  return rankedMetricInsights
    .map((item) => {
      const eligibleValues = item.subjectValues
        .filter((entry) => eligibleSubjects.has(entry.subject))
        .sort((a, b) => {
          const lowerBetter = item.metric.includes("卸载率");
          return lowerBetter ? a.value - b.value : b.value - a.value;
        });
      if (eligibleValues.length < 2) {
        return null;
      }
      const best = eligibleValues[0];
      const worst = eligibleValues[eligibleValues.length - 1];
      const diff = Math.abs((best?.value || 0) - (worst?.value || 0));
      const baseline = worst ? Math.abs(worst.value) : 0;
      return {
        ...item,
        eligibleValues,
        best,
        worst,
        diff,
        relativeGap: baseline > 1e-9 ? diff / baseline : diff,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.relativeGap - a.relativeGap);
}

function evaluateProjectComparisonContext(analysis) {
  const countryCount = appState.filters["国家"].includes("全部")
    ? Math.max(analysis.countryUniverse.filter((item) => item !== "全部").length, 2)
    : appState.filters["国家"].length;
  const firstVisitCount = analysis.compareField === "首次访问日期"
    ? analysis.compareValues.length
    : appState.filters["首次访问日期"].length;
  const exactVersionCohort =
    analysis.compareField === "版本号" &&
    countryCount === 1 &&
    firstVisitCount === 1;

  let label = "精确 cohort";
  let detail = "当前是单国家、单日期下的版本对比，可以谨慎使用“更优版本”这类表达。";
  let mode = "exact";

  if (!exactVersionCohort) {
    mode = "weighted";
    if (countryCount > 1 && firstVisitCount > 1) {
      label = "加权汇总对比";
      detail = "当前结果是多个国家、多个日期混合后的加权汇总信号，只适合判断总体差异方向，不适合直接说谁最好。";
    } else if (countryCount > 1) {
      label = "加权国家汇总";
      detail = "当前结果会受国家结构影响，适合看加权后的总体差异，不适合直接定义“最好值”。";
    } else if (firstVisitCount > 1) {
      label = "加权日期汇总";
      detail = "当前结果会受不同日期批次影响，适合看加权后的总体差异，不适合直接定义“最好值”。";
    } else if (analysis.compareField !== "版本号") {
      label = `${analysis.compareField} 加权横比`;
      detail = `当前是在比较不同${analysis.compareField}的加权总体表现，更适合看差异分布，不建议用“最好值”概括。`;
    }
  }

  return {
    mode,
    exactVersionCohort,
    countryCount,
    firstVisitCount,
    label,
    detail,
  };
}

function aggregateInterpretation(context, metric) {
  if (context.countryCount > 1 && context.firstVisitCount > 1) {
    return "多个国家和日期加权后的总体差异，建议回到分组明细再确认来源。";
  }
  if (context.countryCount > 1) {
    return "这是按新增用户数加权后的国家汇总表现，可能受国家结构影响。";
  }
  if (context.firstVisitCount > 1) {
    return "这是按新增用户数加权后的日期汇总表现，可能受日期批次差异影响。";
  }
  return `${metric} 当前更适合作为加权总体差异来理解，不建议直接总结成“最好值”。`;
}

function overviewMetricDirection(metric) {
  return metric.includes("卸载率") ? "lower" : "higher";
}

function overviewMetricGap(metric, current, benchmark) {
  if (current === null || benchmark === null || current === undefined || benchmark === undefined) {
    return null;
  }
  return current - benchmark;
}

function overviewBadGap(metric, gap) {
  if (gap === null || gap === undefined || Number.isNaN(gap)) return 0;
  return overviewMetricDirection(metric) === "lower" ? Math.max(0, gap) : Math.max(0, -gap);
}

function overviewBadTrend(metric, trend) {
  if (trend === null || trend === undefined || Number.isNaN(trend)) return 0;
  return overviewMetricDirection(metric) === "lower" ? Math.max(0, trend) : Math.max(0, -trend);
}

function overviewStatusFromMetric(metric, gap, trend) {
  const badGap = overviewBadGap(metric, gap);
  const badTrend = overviewBadTrend(metric, trend);
  if (badGap >= 0.08 || badTrend >= 0.05) return "critical";
  if (badGap >= 0.04 || badTrend >= 0.03) return "risk";
  if (badGap >= 0.02 || badTrend >= 0.01) return "watch";
  return "healthy";
}

function overviewWorstStatus(statuses) {
  const rank = { healthy: 0, watch: 1, risk: 2, critical: 3, insufficient: 1, unavailable: 0 };
  return statuses.slice().sort((a, b) => (rank[b] || 0) - (rank[a] || 0))[0] || "healthy";
}

function overviewStatusLabel(status) {
  return {
    healthy: "健康",
    watch: "观察",
    risk: "风险",
    critical: "严重",
    insufficient: "样本不足",
    unavailable: "暂未接入",
  }[status] || status;
}

function overviewStatusClass(status) {
  return {
    healthy: "success-banner",
    watch: "warning-banner",
    risk: "warning-banner",
    critical: "warning-banner",
    insufficient: "warning-banner",
    unavailable: "success-banner",
  }[status] || "warning-banner";
}

function overviewFormatPp(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "暂无";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value * 100).toFixed(2)}个百分点`;
}

function overviewFormatMetric(metric, value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "暂无";
  if (metric === OVERVIEW_FIRST_LAUNCH_METRIC) {
    return `${(Number(value) * 100).toFixed(2)}%`;
  }
  return formatMetric(metric, value).replace("NA", "暂无");
}

function overviewCurrentDates() {
  const selected = (appState.filters["首次访问日期"] || []).filter((value) => value !== "全部");
  return selected.length ? selected : overviewCurrentPeriodDates();
}

function overviewPreviousDates(currentDates) {
  const defaultCurrent = overviewCurrentPeriodDates().join("|");
  if (currentDates.join("|") === defaultCurrent) {
    return overviewPreviousPeriodDates();
  }
  const availableDates = new Set(optionsFor("首次访问日期"));
  return currentDates
    .map((date) => addDateDays(date, -3))
    .filter((date) => date && availableDates.has(date));
}

function overviewBaseFilters(extra = {}) {
  return {
    报表日期: appState.filters["报表日期"] || [],
    项目代号: appState.filters["项目代号"] || [],
    国家: appState.filters["国家"] || [],
    广告组: [],
    版本号: appState.filters["版本号"] || [],
    ...extra,
  };
}

function overviewRowsForDates(dates, filters = {}) {
  return applyDimensionFilters(dashboardData.main.rows, {
    ...overviewBaseFilters(filters),
    首次访问日期: dates,
  });
}

function overviewValidRowsForSubject(field, subject, dates, filters = {}) {
  const rows = overviewRowsForDates(dates, { ...filters, [field]: [subject] });
  const validDates = [];
  const weakDates = [];
  dates.forEach((date) => {
    const dayRows = rows.filter((row) => row["首次访问日期"] === date);
    const users = dayRows.length ? aggregateRows(dayRows, ["新增用户数"])?.["新增用户数"] || 0 : 0;
    if (users > 200) {
      validDates.push(date);
    } else {
      weakDates.push({ date, users });
    }
  });
  return {
    rows: rows.filter((row) => validDates.includes(row["首次访问日期"])),
    validDates,
    weakDates,
  };
}

function overviewSubjectValues(field, dates, filters = {}) {
  const sourceRows = overviewRowsForDates(dates, filters);
  const selected = (appState.filters[field] || []).filter((value) => value !== "全部");
  if (selected.length) return selected;
  if (field === "项目代号") return optionsFor("项目代号").filter((value) => value !== "全部");
  if (field === "国家") return topValuesByUsers(sourceRows, "国家").slice(0, 8);
  if (field === "版本号") return versionOptionsForRows(sourceRows).slice(-6);
  return optionsForRows(sourceRows, field).filter((value) => value !== "全部").slice(0, 8);
}

function overviewMetricBenchmark(metric, subjectStats) {
  const candidates = subjectStats.filter((item) => item.current !== null && item.status !== "insufficient");
  if (!candidates.length) return null;
  const lowerBetter = overviewMetricDirection(metric) === "lower";
  return candidates.slice().sort((a, b) => lowerBetter ? a.current - b.current : b.current - a.current)[0];
}

function overviewBuildMetricStats(field, subjects, metric, currentDates, previousDates, filters = {}) {
  const rawStats = subjects.map((subject) => {
    const currentSample = overviewValidRowsForSubject(field, subject, currentDates, filters);
    const previousSample = overviewValidRowsForSubject(field, subject, previousDates, filters);
    const currentAgg = currentSample.rows.length ? aggregateRows(currentSample.rows, [metric, "新增用户数"]) : null;
    const previousAgg = previousSample.rows.length ? aggregateRows(previousSample.rows, [metric]) : null;
    return {
      subject,
      current: currentAgg?.[metric] ?? null,
      previous: previousAgg?.[metric] ?? null,
      users: currentAgg?.["新增用户数"] || 0,
      validDays: currentSample.validDates.length,
      totalDays: currentDates.length,
      weakDates: currentSample.weakDates,
      status: currentSample.validDates.length ? "pending" : "insufficient",
    };
  });
  const benchmark = overviewMetricBenchmark(metric, rawStats);
  return rawStats.map((item) => {
    if (item.status === "insufficient") {
      return { ...item, benchmark: benchmark?.current ?? null, gap: null, trend: null, status: "insufficient" };
    }
    const gap = overviewMetricGap(metric, item.current, benchmark?.current ?? null);
    const trend = item.previous === null || item.previous === undefined ? null : item.current - item.previous;
    return {
      ...item,
      benchmark: benchmark?.current ?? null,
      benchmarkSubject: benchmark?.subject || null,
      gap,
      trend,
      status: overviewStatusFromMetric(metric, gap, trend),
    };
  });
}

function overviewFeatureRowsForDates(dates, section, filters = {}) {
  return applyDimensionFilters(featureRows(), {
    报表日期: appState.filters["报表日期"] || [],
    项目代号: appState.filters["项目代号"] || [],
    国家: appState.filters["国家"] || [],
    版本号: appState.filters["版本号"] || [],
    分析类型: [section.featureAnalysisType],
    ...filters,
    首次访问日期: dates,
  });
}

function overviewValidFeatureRowsForSubject(field, subject, dates, section, filters = {}) {
  const rows = overviewFeatureRowsForDates(dates, section, { ...filters, [field]: [subject] });
  const validDates = [];
  const weakDates = [];
  dates.forEach((date) => {
    const dayRows = rows.filter((row) => row["首次访问日期"] === date);
    const users = dayRows.length ? featureSampleUsersForRows(dayRows) : 0;
    if (users > 200) {
      validDates.push(date);
    } else {
      weakDates.push({ date, users });
    }
  });
  return {
    rows: rows.filter((row) => validDates.includes(row["首次访问日期"])),
    validDates,
    weakDates,
  };
}

function overviewBuildFeatureStats(field, subjects, section, currentDates, previousDates, filters = {}) {
  const metric = section.metrics[0];
  const rawStats = subjects.map((subject) => {
    const currentSample = overviewValidFeatureRowsForSubject(field, subject, currentDates, section, filters);
    const previousSample = overviewValidFeatureRowsForSubject(field, subject, previousDates, section, filters);
    const currentValue = currentSample.rows.length
      ? weightedFeatureValue(currentSample.rows, section.featureObject, section.featureDay)
      : null;
    const previousValue = previousSample.rows.length
      ? weightedFeatureValue(previousSample.rows, section.featureObject, section.featureDay)
      : null;
    return {
      subject,
      current: currentValue,
      previous: previousValue,
      users: featureSampleUsersForRows(currentSample.rows),
      validDays: currentSample.validDates.length,
      totalDays: currentDates.length,
      weakDates: currentSample.weakDates,
      status: currentSample.validDates.length ? "pending" : "insufficient",
    };
  });
  const benchmark = overviewMetricBenchmark(metric, rawStats);
  return rawStats.map((item) => {
    if (item.status === "insufficient") {
      return { ...item, benchmark: benchmark?.current ?? null, gap: null, trend: null, status: "insufficient" };
    }
    const gap = overviewMetricGap(metric, item.current, benchmark?.current ?? null);
    const trend = item.previous === null || item.previous === undefined ? null : item.current - item.previous;
    return {
      ...item,
      benchmark: benchmark?.current ?? null,
      benchmarkSubject: benchmark?.subject || null,
      gap,
      trend,
      status: overviewStatusFromMetric(metric, gap, trend),
    };
  });
}

function overviewFeatureSectionStats(field, subjects, section, currentDates, previousDates, filters = {}) {
  const metricStats = overviewBuildFeatureStats(field, subjects, section, currentDates, previousDates, filters);
  return subjects.map((subject) => {
    const mainMetric = metricStats.find((item) => item.subject === subject);
    return {
      subject,
      section: section.key,
      label: section.label,
      current: mainMetric?.current ?? null,
      benchmark: mainMetric?.benchmark ?? null,
      gap: mainMetric?.gap ?? null,
      trend: mainMetric?.trend ?? null,
      validDays: mainMetric?.validDays || 0,
      totalDays: currentDates.length,
      users: mainMetric?.users || 0,
      status: mainMetric?.status || "insufficient",
      mainMetric: section.metrics[0],
      metricStats: mainMetric ? [{ metric: section.metrics[0], ...mainMetric }] : [],
    };
  });
}

function overviewSectionStats(field, subjects, section, currentDates, previousDates, filters = {}) {
  if (section.source === "feature") {
    return overviewFeatureSectionStats(field, subjects, section, currentDates, previousDates, filters);
  }
  if (section.unavailable || !section.metrics.length) {
    return subjects.map((subject) => ({
      subject,
      section: section.key,
      label: section.label,
      current: null,
      benchmark: null,
      gap: null,
      trend: null,
      validDays: 0,
      totalDays: currentDates.length,
      users: 0,
      status: "unavailable",
      mainMetric: null,
      metricStats: [],
    }));
  }
  const metricStatsByMetric = section.metrics.map((metric) => ({
    metric,
    stats: overviewBuildMetricStats(field, subjects, metric, currentDates, previousDates, filters),
  }));
  return subjects.map((subject) => {
    const metricStats = metricStatsByMetric.map(({ metric, stats }) => ({
      metric,
      ...stats.find((item) => item.subject === subject),
    })).filter((item) => item.subject);
    const statuses = metricStats.map((item) => item.status);
    const worst = overviewWorstStatus(statuses);
    const mainMetric = metricStats
      .filter((item) => item.status !== "insufficient")
      .sort((a, b) => overviewBadGap(b.metric, b.gap) + overviewBadTrend(b.metric, b.trend) - overviewBadGap(a.metric, a.gap) - overviewBadTrend(a.metric, a.trend))[0] || metricStats[0];
    const valueStats = metricStats.filter((item) => item.current !== null);
    const current = valueStats.length
      ? valueStats.reduce((sum, item) => sum + item.current, 0) / valueStats.length
      : null;
    return {
      subject,
      section: section.key,
      label: section.label,
      current,
      benchmark: mainMetric?.benchmark ?? null,
      gap: mainMetric?.gap ?? null,
      trend: mainMetric?.trend ?? null,
      validDays: Math.max(...metricStats.map((item) => item.validDays || 0)),
      totalDays: currentDates.length,
      users: Math.max(...metricStats.map((item) => item.users || 0)),
      status: worst,
      mainMetric: mainMetric?.metric || null,
      metricStats,
    };
  });
}

function overviewRiskScore(item) {
  const statusScore = { healthy: 0, watch: 1, risk: 2, critical: 3, insufficient: 1, unavailable: 0 };
  const section = OVERVIEW_HEALTH_SECTIONS.find((entry) => entry.key === item.section);
  return (statusScore[item.status] || 0) * (section?.weight || 1);
}

function overviewDiagnosisForProject(projectStats) {
  const riskItems = projectStats.filter((item) => ["watch", "risk", "critical"].includes(item.status));
  const retention = projectStats.find((item) => item.section === "retention");
  const uninstall = projectStats.find((item) => item.section === "uninstall");
  const notification = projectStats.find((item) => item.section === "notification");
  const firstLaunch = projectStats.find((item) => item.section === "first_launch");
  if (retention && uninstall && ["risk", "critical"].includes(retention.status) && ["risk", "critical"].includes(uninstall.status)) {
    return { issue: "留存 + 卸载同时异常", reason: "更可能是新用户体验或产品质量问题。", target: "单项目国家对比" };
  }
  if (notification && ["risk", "critical"].includes(notification.status)) {
    const ctr = notification.metricStats.find((item) => item.metric === "通知点击率_D0");
    const permission = notification.metricStats.find((item) => item.metric === "通知授权率_D0");
    const show = notification.metricStats.find((item) => item.metric === "通知展示率_D0");
    if (ctr && ["risk", "critical"].includes(ctr.status) && permission?.status === "healthy" && show?.status === "healthy") {
      return { issue: "通知点击率异常", reason: "授权和展示相对正常，可能是通知内容或文案吸引力问题。", target: "通知文案对比" };
    }
    return { issue: "通知链路异常", reason: "授权、展示或点击中至少一个环节落后于当前最优项目。", target: "通知文案对比" };
  }
  if (uninstall && ["risk", "critical"].includes(uninstall.status)) {
    return { issue: "D0卸载率异常", reason: "卸载率相对当前最优项目偏高，优先查看国家和版本来源。", target: "单项目国家对比" };
  }
  if (firstLaunch && ["risk", "critical"].includes(firstLaunch.status)) {
    return { issue: "首次启动漏斗异常", reason: "D0首页到达率落后或趋势下滑，建议查看首次启动流程漏斗。", target: "功能模块" };
  }
  if (riskItems.length) {
    return { issue: `${riskItems[0].label} 需要关注`, reason: "该模块的差距或趋势出现负向信号。", target: "单项目国家对比" };
  }
  return { issue: "暂无明显异常", reason: "核心指标相对稳定，继续观察趋势即可。", target: "买量国家对比" };
}

function computeDataOverview() {
  const currentDates = overviewCurrentDates();
  const previousDates = overviewPreviousDates(currentDates);
  const selectedProjects = (appState.filters["项目代号"] || []).filter((value) => value !== "全部");
  const projects = selectedProjects.length ? selectedProjects : optionsFor("项目代号").filter((value) => value !== "全部");
  const projectSections = OVERVIEW_HEALTH_SECTIONS.flatMap((section) =>
    overviewSectionStats("项目代号", projects, section, currentDates, previousDates)
  );
  const projectMap = new Map(projects.map((project) => [project, []]));
  projectSections.forEach((item) => projectMap.get(item.subject)?.push(item));
  const projectCards = projects.map((project) => {
    const sections = projectMap.get(project) || [];
    const status = overviewWorstStatus(sections.map((item) => item.status));
    const score = sections.reduce((sum, item) => sum + overviewRiskScore(item), 0);
    const diagnosis = overviewDiagnosisForProject(sections);
    return { project, sections, status, score, diagnosis };
  }).sort((a, b) => b.score - a.score);

  const kpiSummary = OVERVIEW_HEALTH_SECTIONS.map((section) => {
    const sectionItems = projectSections.filter((item) => item.section === section.key);
    return {
      ...section,
      status: overviewWorstStatus(sectionItems.map((item) => item.status)),
      riskCount: sectionItems.filter((item) => ["risk", "critical"].includes(item.status)).length,
      watchCount: sectionItems.filter((item) => item.status === "watch").length,
    };
  });

  return {
    currentDates,
    previousDates,
    projects,
    projectCards,
    kpiSummary,
    abnormalRanking: projectCards.slice().sort((a, b) => b.score - a.score),
  };
}

function renderOverviewSectionValue(item) {
  if (item.status === "unavailable") return "未接入";
  if (item.status === "insufficient") return "样本不足";
  return item.mainMetric ? overviewFormatMetric(item.mainMetric, item.current) : "暂无";
}

function renderOverviewMetricCell(item) {
  if (!item || item.status === "insufficient") {
    return `<td>样本不足</td><td>暂无</td><td>暂无</td><td>暂无</td>`;
  }
  return `
    <td>${overviewFormatMetric(item.mainMetric, item.current)}</td>
    <td>${item.benchmark === null ? "暂无" : overviewFormatMetric(item.mainMetric, item.benchmark)}</td>
    <td>${overviewFormatPp(item.gap)}</td>
    <td>${overviewFormatPp(item.trend)}</td>
  `;
}

function overviewPrimaryCountry(currentDates) {
  const selected = (appState.filters["国家"] || []).filter((value) => value !== "全部");
  if (selected.length === 1) return selected[0];
  const rows = overviewRowsForDates(currentDates, { 国家: [] });
  return topValuesByUsers(rows, "国家")[0] || null;
}

function renderOverviewCountryComparison(overview) {
  const country = overviewPrimaryCountry(overview.currentDates);
  if (!country) {
    return `
      <div class="panel-title"><div><h2>国家横向对比</h2><p class="muted">当前没有可用于国家横向比较的数据。</p></div></div>
    `;
  }
  const projects = overview.projects;
  const filters = { 国家: [country], 版本号: appState.filters["版本号"] || [], 广告组: [] };
  const sections = OVERVIEW_HEALTH_SECTIONS.filter((item) => !item.unavailable && item.key !== "first_launch");
  const sectionStatsByKey = new Map(sections.map((section) => [
    section.key,
    overviewSectionStats("项目代号", projects, section, overview.currentDates, overview.previousDates, filters),
  ]));
  const rows = projects.map((project) => {
    const sectionStats = sections.map((section) =>
      sectionStatsByKey.get(section.key)?.find((item) => item.subject === project)
    ).filter(Boolean);
    const notification = sectionStats.find((item) => item.section === "notification");
    const ctr = notification?.metricStats.find((item) => item.metric === "通知点击率_D0");
    return {
      project,
      retention: sectionStats.find((item) => item.section === "retention"),
      uninstall: sectionStats.find((item) => item.section === "uninstall"),
      notification,
      ctr,
      status: overviewWorstStatus(sectionStats.map((item) => item.status)),
    };
  });
  const tableRows = rows.map((item) => `
    <tr>
      <th>${item.project}</th>
      <td>${overviewStatusLabel(item.status)}</td>
      ${renderOverviewMetricCell(item.retention)}
      ${renderOverviewMetricCell(item.uninstall)}
      <td>${item.ctr ? formatMetric("通知点击率_D0", item.ctr.current) : "暂无"}</td>
    </tr>
  `).join("");
  return `
    <div class="panel-title"><div><h2>国家横向对比</h2><p class="muted">当前只做同一国家下的跨项目比较。当前国家：<strong>${country}</strong>。</p></div></div>
    <div class="table-wrap" style="margin-bottom:24px;">
      <table class="metric-table">
        <thead>
          <tr>
            <th>项目</th><th>健康状态</th>
            <th>D1留存当前值</th><th>D1留存最优值</th><th>D1留存差距</th><th>D1留存趋势</th>
            <th>D0卸载当前值</th><th>D0卸载最优值</th><th>D0卸载差距</th><th>D0卸载趋势</th>
            <th>D0通知点击率</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `;
}

function renderOverviewVersionComparison(overview) {
  const selectedProjects = (appState.filters["项目代号"] || []).filter((value) => value !== "全部");
  if (selectedProjects.length !== 1) {
    return `
      <div class="panel-title"><div><h2>版本横向对比</h2><p class="muted">版本比较仅在单项目模式显示。请选择一个项目后查看版本差异。</p></div></div>
    `;
  }
  const project = selectedProjects[0];
  const sourceRows = overviewRowsForDates(overview.currentDates, { 项目代号: [project], 版本号: [] });
  const versions = versionOptionsForRows(sourceRows).filter((value) => value !== "全部").slice(-6);
  if (versions.length < 2) {
    return `
      <div class="panel-title"><div><h2>版本横向对比</h2><p class="muted">${project} 当前可比较版本不足 2 个。</p></div></div>
    `;
  }
  const sections = OVERVIEW_HEALTH_SECTIONS.filter((item) => !item.unavailable && item.key !== "first_launch");
  const sectionStatsByKey = new Map(sections.map((section) => [
    section.key,
    overviewSectionStats("版本号", versions, section, overview.currentDates, overview.previousDates, {
      项目代号: [project],
      国家: appState.filters["国家"] || [],
      广告组: [],
    }),
  ]));
  const rows = versions.map((version) => {
    const sectionStats = sections.map((section) =>
      sectionStatsByKey.get(section.key)?.find((item) => item.subject === version)
    ).filter(Boolean);
    const notification = sectionStats.find((item) => item.section === "notification");
    const ctr = notification?.metricStats.find((item) => item.metric === "通知点击率_D0");
    return {
      version,
      retention: sectionStats.find((item) => item.section === "retention"),
      uninstall: sectionStats.find((item) => item.section === "uninstall"),
      ctr,
      status: overviewWorstStatus(sectionStats.map((item) => item.status)),
    };
  });
  const tableRows = rows.map((item) => `
    <tr>
      <th>${item.version}</th>
      <td>${overviewStatusLabel(item.status)}</td>
      ${renderOverviewMetricCell(item.retention)}
      ${renderOverviewMetricCell(item.uninstall)}
      <td>${item.ctr ? formatMetric("通知点击率_D0", item.ctr.current) : "暂无"}</td>
    </tr>
  `).join("");
  return `
    <div class="panel-title"><div><h2>版本横向对比</h2><p class="muted">仅比较单项目版本。当前项目：<strong>${project}</strong>。</p></div></div>
    <div class="table-wrap" style="margin-bottom:24px;">
      <table class="metric-table">
        <thead>
          <tr>
            <th>版本</th><th>健康状态</th>
            <th>D1留存当前值</th><th>D1留存最优值</th><th>D1留存差距</th><th>D1留存趋势</th>
            <th>D0卸载当前值</th><th>D0卸载最优值</th><th>D0卸载差距</th><th>D0卸载趋势</th>
            <th>D0通知点击率</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `;
}

function aiAvailableProjects() {
  return optionsFor("项目代号").filter((value) => value !== "全部");
}

function aiLatestReportDate() {
  return optionsFor("报表日期").slice(-1)[0] || "";
}

function aiProjectRows(project) {
  const reportDate = aiLatestReportDate();
  return dashboardData.main.rows.filter((row) =>
    row["项目代号"] === project && (!reportDate || row["报表日期"] === reportDate)
  );
}

function aiVersionOptions(project) {
  return sortDimensionValues(
    "版本号",
    uniqueValues(aiProjectRows(project), "版本号").filter((value) => value !== "全部")
  );
}

function aiDateOptions(project, oldVersion, newVersion) {
  const versions = [oldVersion, newVersion].filter(Boolean);
  const rows = aiProjectRows(project).filter((row) =>
    !versions.length || versions.includes(row["版本号"])
  );
  return sortDimensionValues("首次访问日期", uniqueValues(rows, "首次访问日期"));
}

function aiDefaultDateSelection(dates) {
  const orderedDates = (dates || []).slice();
  return orderedDates.length > 1 ? orderedDates.slice(0, -1).slice(-5) : [];
}

function ensureAiAssistantDefaults() {
  const projects = aiAvailableProjects();
  if (!projects.includes(appState.aiProject)) {
    appState.aiProject = projects.includes("FR07") ? "FR07" : projects[0] || "";
  }
  const versions = aiVersionOptions(appState.aiProject);
  if (!versions.includes(appState.aiOldVersion) || !versions.includes(appState.aiNewVersion) || appState.aiOldVersion === appState.aiNewVersion) {
    appState.aiOldVersion = versions.length >= 2 ? versions[versions.length - 2] : versions[0] || "";
    appState.aiNewVersion = versions.length >= 2 ? versions[versions.length - 1] : versions[1] || versions[0] || "";
  }
  const dates = aiDateOptions(appState.aiProject, appState.aiOldVersion, appState.aiNewVersion);
  const selectedDates = (appState.aiDates || []).filter((date) => dates.includes(date));
  appState.aiDates = selectedDates.length ? selectedDates : aiDefaultDateSelection(dates);
}

function aiMetricMatchesFocusedDay(metric, day) {
  if (!day) return false;
  return metric === `${day}留存率` || metric.endsWith(`_${day}`) || metric.startsWith(`${day}`);
}

function aiFocusedDayMetrics(days) {
  const focusedDays = days || [];
  if (!focusedDays.length) return [];
  return sortCompareMetrics(COMPARE_METRICS.filter((metric) =>
    focusedDays.some((day) => aiMetricMatchesFocusedDay(metric, day))
  ));
}

function aiNormalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s_/\-｜|,，.。:：;；()（）【】\[\]"“”'‘’]/g, "");
}

function aiTextIncludes(rawText, value) {
  const needle = aiNormalizeText(value);
  return needle.length >= 2 && aiNormalizeText(rawText).includes(needle);
}

function aiMetricAliases(metric) {
  const aliases = [metric, String(metric).replace(/_/g, ""), String(metric).replace(/_D\d+$/i, "")];
  if (metric === "D1留存率") aliases.push("D1留存", "次日留存");
  if (metric === "D3留存率") aliases.push("D3留存", "三日留存");
  if (metric.includes("卸载率")) aliases.push("卸载", "卸载率");
  if (metric.includes("通知授权率")) aliases.push("授权", "授权率", "通知授权");
  if (metric.includes("通知展示率")) aliases.push("展示率", "通知展示");
  if (metric.includes("通知点击率")) aliases.push("点击率", "通知点击");
  if (metric.includes("人均展示次数")) aliases.push("展示次数", "人均展示");
  if (metric.includes("人均点击次数")) aliases.push("点击次数", "人均点击");
  if (metric.includes("常驻通知栏")) aliases.push("常驻通知栏", "常驻");
  return uniqueArray(aliases);
}

function aiMatchedMetrics(rawText) {
  if (!String(rawText || "").trim()) return [];
  return sortCompareMetrics((dashboardData.main.metrics || []).filter((metric) =>
    aiMetricAliases(metric).some((alias) => aiTextIncludes(rawText, alias))
  ));
}

function aiDimensionAliases(dimension) {
  const aliases = {
    "报表日期": ["报表日期", "报告日期", "数据日期"],
    "项目代号": ["项目代号", "项目", "包名"],
    "首次访问日期": ["首次访问日期", "访问日期", "日期", "cohort"],
    "国家": ["国家", "地区"],
    "广告组": ["广告组", "素材组", "买量组"],
    "版本号": ["版本号", "版本"],
  };
  return uniqueArray([dimension].concat(aliases[dimension] || []));
}

function aiMatchedDimensions(rawText) {
  if (!String(rawText || "").trim()) return [];
  return (dashboardData.main.dimensions || []).filter((dimension) =>
    aiDimensionAliases(dimension).some((alias) => aiTextIncludes(rawText, alias))
  );
}

function aiMatchedDimensionValues(rawText) {
  if (!String(rawText || "").trim()) return [];
  const values = [];
  const cache = window.__frAiDimensionValueOptions || (window.__frAiDimensionValueOptions = {});
  (dashboardData.main.dimensions || []).forEach((field) => {
    const fieldValues = cache[field] || (cache[field] = optionsForRows(dashboardData.main.rows, field)
      .filter((value) => value && value !== "全部" && value !== "(not set)")
    );
    fieldValues.forEach((value) => {
      if (aiTextIncludes(rawText, value)) {
        values.push({ field, value });
      }
    });
  });
  const countryAliases = {
    印度: "India",
    美国: "United States",
    墨西哥: "Mexico",
    巴基斯坦: "Pakistan",
    孟加拉: "Bangladesh",
    孟加拉国: "Bangladesh",
    印尼: "Indonesia",
    印度尼西亚: "Indonesia",
    菲律宾: "Philippines",
    埃及: "Egypt",
    哥伦比亚: "Colombia",
    秘鲁: "Peru",
    阿根廷: "Argentina",
    肯尼亚: "Kenya",
    尼日利亚: "Nigeria",
    突尼斯: "Tunisia",
  };
  const countryOptions = cache["国家"] || (cache["国家"] = optionsForRows(dashboardData.main.rows, "国家")
    .filter((value) => value && value !== "全部" && value !== "(not set)")
  );
  Object.entries(countryAliases).forEach(([alias, value]) => {
    if (countryOptions.includes(value) && aiTextIncludes(rawText, alias)) {
      values.push({ field: "国家", value });
    }
  });
  return uniqueArray(values.map((item) => `${item.field}|${item.value}`))
    .map((key) => {
      const [field, ...rest] = key.split("|");
      return { field, value: rest.join("|") };
    })
    .slice(0, 20);
}

function aiMetricList(intent) {
  const baseMetrics = [
    "新增用户数",
    "D1留存率",
    "D3留存率",
    "卸载率_D0",
    "通知授权率_D0",
    "通知展示率_D0",
    "人均展示次数_D0",
    "通知点击率_D0",
    "人均点击次数_D0",
    "常驻通知栏点击率_D0",
    "常驻通知栏人均点击次数_D0",
  ].filter((metric) => COMPARE_METRICS.includes(metric));
  const focusedMetrics = aiFocusedDayMetrics(intent?.focusDays || []);
  if (intent?.strictDayFocus && focusedMetrics.length) {
    return uniqueArray(["新增用户数"].concat(intent?.focusMetrics || [], focusedMetrics))
      .filter((metric) => metric === "新增用户数" || focusedMetrics.includes(metric))
      .filter((metric) => COMPARE_METRICS.includes(metric));
  }
  return uniqueArray(["新增用户数"].concat(intent?.focusMetrics || [], focusedMetrics, baseMetrics))
    .filter((metric) => COMPARE_METRICS.includes(metric));
}

function aiMetricIsLowerBetter(metric) {
  return metric.includes("卸载率");
}

function aiRowsForVersion(project, version, dates, country = "全部") {
  const reportDate = aiLatestReportDate();
  let rows = dashboardData.main.rows.filter((row) =>
    row["项目代号"] === project &&
    row["版本号"] === version &&
    dates.includes(row["首次访问日期"]) &&
    (!reportDate || row["报表日期"] === reportDate) &&
    (!country || row["国家"] === country)
  );
  if (rows.some((row) => row["广告组"] === "全部")) {
    rows = rows.filter((row) => row["广告组"] === "全部");
  }
  return rows;
}

function aiAggregateVersion(project, version, dates, country = "全部", metrics = aiMetricList()) {
  const rows = aiRowsForVersion(project, version, dates, country);
  return {
    rows,
    aggregated: rows.length ? aggregateRows(rows, metrics) : null,
  };
}

function aiMentionedProjects(rawText) {
  return aiAvailableProjects().filter((project) => aiTextIncludes(rawText, project));
}

function aiMentionedVersions(rawText, project) {
  const versions = project ? aiVersionOptions(project) : [];
  const normalizedText = aiNormalizeText(rawText);
  return versions.filter((version) => {
    const normalizedVersion = aiNormalizeText(version);
    return normalizedVersion && normalizedText.includes(normalizedVersion);
  });
}

const AI_COUNTRY_ALIASES = [
  { value: "United States", aliases: ["美国", "美区", "United States", "USA", "U.S.", "America"] },
  { value: "India", aliases: ["印度", "India"] },
  { value: "Mexico", aliases: ["墨西哥", "Mexico"] },
  { value: "Pakistan", aliases: ["巴基斯坦", "Pakistan"] },
  { value: "Bangladesh", aliases: ["孟加拉", "孟加拉国", "Bangladesh"] },
  { value: "Indonesia", aliases: ["印尼", "印度尼西亚", "Indonesia"] },
  { value: "Egypt", aliases: ["埃及", "Egypt"] },
  { value: "Kenya", aliases: ["肯尼亚", "Kenya"] },
  { value: "Nigeria", aliases: ["尼日利亚", "Nigeria"] },
  { value: "Tunisia", aliases: ["突尼斯", "Tunisia"] },
  { value: "Colombia", aliases: ["哥伦比亚", "Colombia"] },
  { value: "Peru", aliases: ["秘鲁", "Peru"] },
  { value: "Argentina", aliases: ["阿根廷", "Argentina"] },
  { value: "Brazil", aliases: ["巴西", "Brazil"] },
  { value: "Vietnam", aliases: ["越南", "Vietnam"] },
  { value: "Philippines", aliases: ["菲律宾", "Philippines"] },
];

function aiMentionedCountry(intent) {
  return aiMentionedCountries(intent)[0] || "全部";
}

function aiMentionedCountries(intent) {
  const rawText = intent?.rawText || "";
  const normalizedText = aiNormalizeText(rawText);
  const availableCountries = uniqueValues(dashboardData.main.rows || [], "国家")
    .filter((value) => value && value !== "全部");
  const availableSet = new Set(availableCountries);
  const fromAliases = AI_COUNTRY_ALIASES
    .filter((item) => availableSet.has(item.value))
    .filter((item) => item.aliases.some((alias) => normalizedText.includes(aiNormalizeText(alias))))
    .map((item) => item.value);
  const fromRawNames = availableCountries.filter((country) => aiTextIncludes(rawText, country));
  const fromRecognizedDimensions = (intent?.focusDimensionValues || [])
    .filter((item) => item.field === "国家" && availableSet.has(item.value))
    .map((item) => item.value);
  return uniqueArray(fromAliases.concat(fromRawNames, fromRecognizedDimensions));
}

function aiRowsForProject(project, dates, country = "全部") {
  const reportDate = aiLatestReportDate();
  let rows = dashboardData.main.rows.filter((row) =>
    row["项目代号"] === project &&
    dates.includes(row["首次访问日期"]) &&
    (!reportDate || row["报表日期"] === reportDate) &&
    (!country || country === "全部" || row["国家"] === country)
  );
  if (rows.some((row) => row["版本号"] === "全部")) {
    rows = rows.filter((row) => row["版本号"] === "全部");
  }
  if (rows.some((row) => row["广告组"] === "全部")) {
    rows = rows.filter((row) => row["广告组"] === "全部");
  }
  return rows;
}

function aiProjectCompareDates(projects, country) {
  const reportDate = aiLatestReportDate();
  const rows = dashboardData.main.rows.filter((row) =>
    projects.includes(row["项目代号"]) &&
    (!reportDate || row["报表日期"] === reportDate) &&
    (!country || country === "全部" || row["国家"] === country) &&
    (!row["版本号"] || row["版本号"] === "全部") &&
    (!row["广告组"] || row["广告组"] === "全部")
  );
  const availableDates = sortDimensionValues("首次访问日期", uniqueValues(rows, "首次访问日期"));
  const selected = (appState.aiDates || []).filter((date) => availableDates.includes(date));
  return selected.length ? selected : aiDefaultDateSelection(availableDates);
}

function aiAggregateProject(project, dates, country = "全部", metrics = []) {
  const rows = aiRowsForProject(project, dates, country);
  return {
    rows,
    aggregated: rows.length ? aggregateRows(rows, metrics) : null,
  };
}

function aiMetricChange(metric, oldValue, newValue) {
  if (oldValue === null || oldValue === undefined || newValue === null || newValue === undefined) return null;
  const delta = newValue - oldValue;
  const kind = dashboardData.metricMeta[metric]?.kind;
  const magnitude = kind === "count"
    ? Math.abs(delta) / Math.max(Math.abs(oldValue), 1)
    : Math.abs(delta);
  const qualityMetric = metric !== "新增用户数";
  const improved = !qualityMetric ? null : (aiMetricIsLowerBetter(metric) ? delta < 0 : delta > 0);
  return {
    metric,
    oldValue,
    newValue,
    delta,
    magnitude,
    kind,
    improved,
  };
}

function aiFormatDelta(change) {
  if (!change) return "暂无";
  const sign = change.delta > 0 ? "+" : change.delta < 0 ? "-" : "";
  if (change.kind === "count") {
    const relative = change.oldValue ? `，${sign}${(Math.abs(change.delta) / Math.abs(change.oldValue) * 100).toFixed(1)}%` : "";
    return `${sign}${Math.abs(Math.round(change.delta)).toLocaleString("zh-CN")}${relative}`;
  }
  if (change.kind === "rate") {
    return `${sign}${Math.abs(change.delta * 100).toFixed(2)}个百分点`;
  }
  return `${sign}${Math.abs(change.delta).toFixed(2)}`;
}

function aiChangeTone(change) {
  if (!change || change.metric === "新增用户数") return "中性";
  if (Math.abs(change.delta) < 0.0001) return "持平";
  return change.improved ? "变好" : "变差";
}

function aiChangeClass(change) {
  const tone = aiChangeTone(change);
  if (tone === "变好") return "best-cell";
  if (tone === "变差") return "weak-cell";
  return "";
}

function aiMetricSortRank(metric) {
  if (metric.includes("留存率")) return 1;
  if (metric.includes("卸载率")) return 2;
  if (metric.includes("授权率")) return 3;
  if (metric.includes("展示率") || metric.includes("展示用户率")) return 4;
  if (metric.includes("点击率")) return 5;
  if (metric.includes("转化率")) return 6;
  if (metric.includes("人均展示次数")) return 20;
  if (metric.includes("人均点击次数")) return 21;
  if (metric.includes("次数")) return 22;
  return 10;
}

function aiSortChangesForList(changes) {
  return changes.slice().sort((a, b) =>
    aiMetricSortRank(a.metric) - aiMetricSortRank(b.metric) ||
    b.magnitude - a.magnitude ||
    String(a.metric).localeCompare(String(b.metric), "zh-Hans-CN")
  );
}

function aiSortChangesByMagnitude(changes) {
  return changes.slice().sort((a, b) =>
    b.magnitude - a.magnitude ||
    aiMetricSortRank(a.metric) - aiMetricSortRank(b.metric) ||
    String(a.metric).localeCompare(String(b.metric), "zh-Hans-CN")
  );
}

function aiStrongestSummaryChange(changes) {
  const rateChanges = changes.filter((change) => dashboardData.metricMeta[change.metric]?.kind === "rate");
  return aiSortChangesByMagnitude(rateChanges.length ? rateChanges : changes)[0] || null;
}

function aiQualityChanges(analysis) {
  let changes = analysis.changes
    .filter((change) => change.metric !== "新增用户数" && Math.abs(change.delta) >= 0.0001);
  if (analysis.intent?.wantsDayFocus) {
    changes = changes.filter((change) =>
      analysis.intent.focusDays.some((day) => aiMetricMatchesFocusedDay(change.metric, day))
    );
  }
  if (analysis.intent?.wantsMetricFocus) {
    changes = changes.filter((change) => analysis.intent.focusMetrics.includes(change.metric));
  }
  return aiSortChangesForList(changes);
}

function aiDirectAnswerText(analysis, improved, worsened) {
  const text = String(analysis.intent.rawText || "").trim();
  const strongestImproved = aiStrongestSummaryChange(improved);
  const strongestWorsened = aiStrongestSummaryChange(worsened);
  if (text && !analysis.intent.supported) {
    return "这句输入暂时没有识别到看板里的指标、维度或常见分析意图；下面先展示默认的新旧版本整体对比。";
  }
  if (analysis.intent.wantsCauseDiagnosis) {
    const diagnosis = aiBuildCauseDiagnosis(analysis);
    return `针对你问的原因，初步判断：${diagnosis?.conclusion || "当前证据还不够，需要结合整体指标、国家分化和专项数据继续确认。"}`;
  }
  if (analysis.intent.wantsDayFocus) {
    const dayLabel = analysis.intent.focusDays.join("、");
    return `针对你问的 ${dayLabel} 数据变化，当前 ${dayLabel} 指标里 ${improved.length} 个变好、${worsened.length} 个变差。${strongestWorsened ? `最需要关注 ${strongestWorsened.metric}：${formatMetric(strongestWorsened.metric, strongestWorsened.oldValue)} → ${formatMetric(strongestWorsened.metric, strongestWorsened.newValue)}（${aiFormatDelta(strongestWorsened)}）。` : strongestImproved ? `改善最明显的是 ${strongestImproved.metric}：${formatMetric(strongestImproved.metric, strongestImproved.oldValue)} → ${formatMetric(strongestImproved.metric, strongestImproved.newValue)}（${aiFormatDelta(strongestImproved)}）。` : "当前没有明显变化。"}`;
  }
  if (analysis.intent.wantsMetricFocus) {
    const metricLabel = analysis.intent.focusMetrics.slice(0, 4).join("、");
    return `针对你提到的 ${metricLabel}，当前重点指标里 ${improved.length} 个变好、${worsened.length} 个变差。${strongestWorsened ? `最需要关注 ${strongestWorsened.metric}：${formatMetric(strongestWorsened.metric, strongestWorsened.oldValue)} → ${formatMetric(strongestWorsened.metric, strongestWorsened.newValue)}（${aiFormatDelta(strongestWorsened)}）。` : strongestImproved ? `改善最明显的是 ${strongestImproved.metric}：${formatMetric(strongestImproved.metric, strongestImproved.oldValue)} → ${formatMetric(strongestImproved.metric, strongestImproved.newValue)}（${aiFormatDelta(strongestImproved)}）。` : "当前没有明显变化。"}`;
  }
  if (analysis.intent.wantsFeature) {
    const featureRisk = analysis.featureFocus
      .flatMap((item) => item.worsened.map((change) => ({ item, change })))
      .sort((a, b) => b.change.magnitude - a.change.magnitude)[0];
    const featureGood = analysis.featureFocus
      .flatMap((item) => item.improved.map((change) => ({ item, change })))
      .sort((a, b) => b.change.magnitude - a.change.magnitude)[0];
    if (featureRisk) {
      return `针对你问的功能变化，当前最需要关注 ${featureRisk.item.analysisType} 里的 ${featureRisk.change.object}，新版本比旧版本下降 ${aiFeatureFormatDelta(featureRisk.change)}。`;
    }
    if (featureGood) {
      return `针对你问的功能变化，当前功能专项整体没有明显风险，改善最明显的是 ${featureGood.item.analysisType} 里的 ${featureGood.change.object}，提升 ${aiFeatureFormatDelta(featureGood.change)}。`;
    }
  }
  if (analysis.intent.wantsNotification) {
    const notificationChanges = aiQualityChanges(analysis)
      .filter((change) => aiNotificationMetrics(analysis.intent).includes(change.metric));
    const notificationWorse = notificationChanges.filter((change) => aiChangeTone(change) === "变差");
    const notificationBetter = notificationChanges.filter((change) => aiChangeTone(change) === "变好");
    const notificationRisk = aiStrongestSummaryChange(notificationWorse);
    const notificationGood = aiStrongestSummaryChange(notificationBetter);
    if (notificationRisk) {
      return `针对你问的通知/文案/时机，整体通知链路有风险，最需要关注 ${notificationRisk.metric}：${formatMetric(notificationRisk.metric, notificationRisk.oldValue)} → ${formatMetric(notificationRisk.metric, notificationRisk.newValue)}（${aiFormatDelta(notificationRisk)}）。`;
    }
    if (notificationGood) {
      return `针对你问的通知/文案/时机，整体通知链路偏正向，改善最明显的是 ${notificationGood.metric}：${formatMetric(notificationGood.metric, notificationGood.oldValue)} → ${formatMetric(notificationGood.metric, notificationGood.newValue)}（${aiFormatDelta(notificationGood)}）。`;
    }
  }
  if (text) {
    return `针对你的问题，先看新旧版本整体效果：${improved.length} 个质量指标变好、${worsened.length} 个变差。${strongestWorsened ? `最需要关注 ${strongestWorsened.metric}。` : strongestImproved ? `改善最明显的是 ${strongestImproved.metric}。` : "当前没有明显质量指标变化。"}`;
  }
  return improved.length > worsened.length
    ? `当前版本整体偏正向：${improved.length} 个质量指标变好、${worsened.length} 个变差。`
    : worsened.length > improved.length
    ? `当前版本整体偏谨慎：${worsened.length} 个质量指标变差、${improved.length} 个变好。`
    : `当前版本表现比较分化：${improved.length} 个质量指标变好、${worsened.length} 个变差。`;
}

function aiSummaryBullets(analysis, oldUsers, newUsers) {
  const qualityChanges = aiQualityChanges(analysis);
  const improved = qualityChanges.filter((change) => aiChangeTone(change) === "变好");
  const worsened = qualityChanges.filter((change) => aiChangeTone(change) === "变差");
  const strongestImproved = aiStrongestSummaryChange(improved);
  const strongestWorsened = aiStrongestSummaryChange(worsened);
  const riskCountries = analysis.topCountries
    .filter((item) => item.valid && item.negative > item.positive)
    .slice(0, 3)
    .map((item) => item.country);
  const goodCountries = analysis.topCountries
    .filter((item) => item.valid && item.positive > item.negative)
    .slice(0, 3)
    .map((item) => item.country);
  const userDelta = newUsers - oldUsers;
  const userText = `样本从 ${Math.round(oldUsers).toLocaleString("zh-CN")} 到 ${Math.round(newUsers).toLocaleString("zh-CN")}，新增用户数${userDelta >= 0 ? "增加" : "减少"} ${Math.abs(Math.round(userDelta)).toLocaleString("zh-CN")}，这里只作为样本背景，不参与变好变差判断。`;
  const directionText = improved.length > worsened.length
    ? `整体偏正向：${improved.length} 个质量指标变好、${worsened.length} 个变差，改善面更宽。`
    : worsened.length > improved.length
    ? `整体偏谨慎：${worsened.length} 个质量指标变差、${improved.length} 个变好，负向指标更多。`
    : `整体比较分化：${improved.length} 个质量指标变好、${worsened.length} 个变差，需要拆到国家和专项指标看原因。`;
  const keyText = [
    strongestImproved ? `最明显的改善是 ${strongestImproved.metric}：${formatMetric(strongestImproved.metric, strongestImproved.oldValue)} → ${formatMetric(strongestImproved.metric, strongestImproved.newValue)}（${aiFormatDelta(strongestImproved)}）。` : "",
    strongestWorsened ? `最需要关注的是 ${strongestWorsened.metric}：${formatMetric(strongestWorsened.metric, strongestWorsened.oldValue)} → ${formatMetric(strongestWorsened.metric, strongestWorsened.newValue)}（${aiFormatDelta(strongestWorsened)}）。` : "",
  ].filter(Boolean).join(" ");
  const countryText = riskCountries.length || goodCountries.length
    ? `头部国家里，${goodCountries.length ? `${goodCountries.join("、")}偏正向` : "暂无明显偏正向国家"}；${riskCountries.length ? `${riskCountries.join("、")}需要重点看` : "暂无明显偏负向国家"}。`
    : "头部国家暂时没有足够分化信号。";
  const recognizedText = [
    analysis.intent.focusMetrics.length ? `指标：${analysis.intent.focusMetrics.slice(0, 5).join("、")}` : "",
    analysis.intent.focusDimensions.length ? `维度：${analysis.intent.focusDimensions.join("、")}` : "",
    analysis.intent.focusDimensionValues.length ? `维度值：${analysis.intent.focusDimensionValues.slice(0, 5).map((item) => `${item.field}=${item.value}`).join("、")}` : "",
  ].filter(Boolean).join("；");
  const focusText = recognizedText
    ? `已根据输入优先关注 ${recognizedText}。`
    : analysis.intent.wantsFeature
    ? "因为已选择或输入提到功能模块，下面会额外列出功能专项变化。"
    : analysis.intent.wantsNotification
    ? "因为已选择或输入提到通知/文案/时机，下面会额外列出通知专项变化。"
    : "如果要继续定位原因，优先看负向指标对应的国家和版本明细。";
  return [aiDirectAnswerText(analysis, improved, worsened), keyText || directionText, countryText, userText, focusText].filter(Boolean);
}

function aiRenderSummaryPanel(title, bullets) {
  const [primary, secondary, country, sample, focus] = bullets;
  const summaryBlock = (label, text, tone) => {
    if (!text) return "";
    const palette = {
      key: { accent: "#2563eb", bg: "rgba(37,99,235,0.10)", border: "rgba(37,99,235,0.32)" },
      country: { accent: "#0f766e", bg: "rgba(15,118,110,0.10)", border: "rgba(15,118,110,0.28)" },
      sample: { accent: "#b45309", bg: "rgba(180,83,9,0.10)", border: "rgba(180,83,9,0.28)" },
    }[tone] || { accent: "var(--accent)", bg: "rgba(247,250,252,0.92)", border: "rgba(86,102,115,0.18)" };
    return `
    <div style="position:relative; border:2px solid ${palette.border}; border-radius:20px; padding:20px 22px 22px; background:linear-gradient(135deg, ${palette.bg}, rgba(255,255,255,0.96)); box-shadow:0 16px 34px rgba(15,23,42,0.07); overflow:hidden;">
      <div style="position:absolute; left:0; top:0; bottom:0; width:6px; background:${palette.accent};"></div>
      <div style="display:inline-flex; align-items:center; min-height:28px; padding:4px 12px; border-radius:999px; background:${palette.accent}; color:#fff; font-size:14px; font-weight:800;">${label}</div>
      <div style="margin-top:14px; font-size:20px; line-height:1.75; font-weight:800; color:var(--ink);">${text}</div>
    </div>
  `;
  };
  return `
    <div style="border:1px solid rgba(86,102,115,0.16); border-radius:22px; padding:28px 32px; margin-bottom:28px; background:rgba(255,255,255,0.82); box-shadow:0 18px 42px rgba(15,23,42,0.06);">
      <div class="eyebrow">${title}</div>
      <h3 style="margin:10px 0 24px; line-height:1.55; max-width:1080px; font-size:24px;">${primary || "当前筛选下暂无足够结论。"}</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
        ${summaryBlock("关键指标", secondary, "key")}
        ${summaryBlock("国家分化", country, "country")}
        ${summaryBlock("样本背景", sample, "sample")}
      </div>
      ${focus ? `<div style="margin-top:22px; padding:14px 18px; border-radius:16px; background:rgba(37,99,235,0.06); color:var(--muted); line-height:1.7; font-weight:700;">${focus}</div>` : ""}
    </div>
  `;
}

function aiTopCountries(project, oldVersion, newVersion, dates, limit = 5) {
  const reportDate = aiLatestReportDate();
  let rows = dashboardData.main.rows.filter((row) =>
    row["项目代号"] === project &&
    [oldVersion, newVersion].includes(row["版本号"]) &&
    dates.includes(row["首次访问日期"]) &&
    row["国家"] &&
    row["国家"] !== "全部" &&
    row["国家"] !== "(not set)" &&
    (!reportDate || row["报表日期"] === reportDate)
  );
  if (rows.some((row) => row["广告组"] === "全部")) {
    rows = rows.filter((row) => row["广告组"] === "全部");
  }
  const countryMap = new Map();
  rows.forEach((row) => {
    const country = row["国家"];
    countryMap.set(country, (countryMap.get(country) || 0) + Number(row["新增用户数"] || 0));
  });
  return [...countryMap.entries()]
    .map(([country, users]) => ({ country, users }))
    .sort((a, b) => b.users - a.users)
    .slice(0, limit);
}

const AI_NOTIFICATION_METRICS = [
  "通知授权率_D0",
  "通知展示率_D0",
  "人均展示次数_D0",
  "通知点击率_D0",
  "人均点击次数_D0",
  "卸载率_D0",
];

function aiNotificationMetrics(intent) {
  if (intent?.wantsDayFocus) {
    const focused = COMPARE_METRICS.filter((metric) =>
      intent.focusDays.some((day) => aiMetricMatchesFocusedDay(metric, day)) &&
      (/通知|展示|点击|人均|卸载/.test(metric))
    );
    return focused.length ? sortCompareMetrics(focused) : AI_NOTIFICATION_METRICS.filter((metric) => COMPARE_METRICS.includes(metric));
  }
  return AI_NOTIFICATION_METRICS.filter((metric) => COMPARE_METRICS.includes(metric));
}

const AI_TIMING_METRICS = [
  "D0展示用户率",
  "D0人均展示次数",
  "D0通知点击率",
  "D0人均点击次数",
  "D0通知点击转化率",
];

function aiSelectedDirections() {
  const allowed = AI_ANALYSIS_DIRECTIONS.map((item) => item.key);
  const selected = uniqueArray((appState.aiDirections || []).filter((key) => allowed.includes(key)));
  return selected.length ? selected : AI_DEFAULT_ANALYSIS_DIRECTIONS.slice();
}

function aiHasDirection(key) {
  return aiSelectedDirections().includes(key);
}

function aiDetectIntent(text) {
  const rawText = String(text || "");
  const selectedDirections = aiSelectedDirections();
  const hasDirection = (key) => selectedDirections.includes(key);
  const focusTerms = [];
  [
    ["安装", ["安装", "install", "App安装", "应用安装"]],
    ["卸载", ["卸载", "uninstall", "App卸载", "应用卸载"]],
    ["截图", ["截图", "截屏", "screenshot"]],
    ["解锁", ["解锁", "unlock"]],
    ["广告召回", ["广告召回", "召回", "ad recall"]],
    ["home", ["home", "首页"]],
    ["图片", ["图片", "photo", "照片"]],
    ["视频", ["视频", "video"]],
    ["音频", ["音频", "audio", "音乐"]],
    ["文件", ["文件", "document"]],
    ["清理", ["清理", "clean", "junk"]],
  ].forEach(([label, keywords]) => {
    if (keywords.some((keyword) => rawText.toLowerCase().includes(String(keyword).toLowerCase()))) {
      focusTerms.push(label);
    }
  });
  const wantsNotification = hasDirection("notification") || /通知|推送|文案|时机|安装|卸载|触发|push|fcm/i.test(rawText);
  const wantsFeature = hasDirection("feature") || /功能|模块|首页|点击|漏斗|首次启动|启动流程|引导|到达|流失|恢复|清理|图片|视频|音频|文件|截图|扫描/i.test(rawText);
  const wantsCopy = /文案|安装|卸载|截图|截屏|home|图片|视频|音频|清理|恢复|photo|video|audio/i.test(rawText);
  const wantsTiming = /时机|触发|解锁|召回|fcm|安装|卸载/i.test(rawText);
  const asksCause = /原因|为什么|找下|排查|定位|怀疑|怎么回事|哪里/i.test(rawText);
  const mentionsUninstallRisk = /卸载率.*(提高|升高|上升|变高|变差|增加)|卸载.*(提高|升高|上升|变高|变差|增加)/i.test(rawText);
  const mentionsRetentionNoLift = /留存.*(没有提升|没提升|不升|未提升|下降|变差)|D1.*(没有提升|没提升|不升|未提升|下降|变差)/i.test(rawText);
  const mentionsNoLimitPush = /没有限制|无限制|不限制|有触发就.*推|触发就.*推|频率|频控|放开/i.test(rawText);
  let focusDays = uniqueArray((rawText.match(/D[0-4]/gi) || []).map((day) => day.toUpperCase()));
  const mentionsDayScope = focusDays.length > 0 && /D[0-4].{0,10}(数据|指标|差异|对比|表现|变化)|(数据|指标|差异|对比|表现|变化).{0,10}D[0-4]/i.test(rawText);
  const strictDayFocus = focusDays.length > 0 && (
    /只|仅|单独|只看|只分析|只需要|不用看其他|不要.*D1|不要.*D0/i.test(rawText) || mentionsDayScope
  );
  if (hasDirection("d1") && !focusDays.includes("D1")) {
    focusDays = focusDays.concat("D1");
  }
  const focusMetrics = aiMatchedMetrics(rawText);
  const focusDimensions = aiMatchedDimensions(rawText);
  const focusDimensionValues = aiMatchedDimensionValues(rawText);
  const wantsCauseDiagnosis = hasDirection("cause") || asksCause || mentionsUninstallRisk || mentionsRetentionNoLift || mentionsNoLimitPush;
  const asksGeneralAnalysis = /效果|变化|变好|变差|指标|数据|对比|分析|迭代|版本|表现|提升|下降|异常|问题|趋势/i.test(rawText);
  const supported = !rawText.trim() || selectedDirections.length || asksGeneralAnalysis || wantsNotification || wantsFeature || wantsCauseDiagnosis || focusDays.length || focusMetrics.length || focusDimensions.length || focusDimensionValues.length;
  return {
    rawText,
    selectedDirections,
    wantsNotification,
    wantsFeature,
    focusDays,
    strictDayFocus,
    focusMetrics,
    focusDimensions,
    focusDimensionValues,
    wantsDayFocus: hasDirection("d1") || strictDayFocus || (focusDays.length > 0 && !wantsCauseDiagnosis),
    wantsMetricFocus: focusMetrics.length > 0,
    asksCause,
    mentionsUninstallRisk,
    mentionsRetentionNoLift,
    mentionsNoLimitPush,
    wantsCauseDiagnosis,
    supported,
    analysisTypes: wantsNotification
      ? (wantsCopy ? ["通知文案", "通知时机"] : wantsTiming ? ["通知时机", "通知文案"] : ["通知文案", "通知时机"])
      : [],
    focusTerms: focusTerms.length ? focusTerms : [],
  };
}

function aiTimingReportDate() {
  return sortDimensionValues("报表日期", uniqueValues(dashboardData.timing?.rows || [], "报表日期")).slice(-1)[0] || "";
}

function aiTimingMetrics(intent) {
  const available = dashboardData.timing?.metrics || [];
  if (intent?.wantsDayFocus) {
    const focused = available.filter((metric) =>
      intent.focusDays.some((day) => String(metric).startsWith(day))
    );
    if (focused.length) return focused;
  }
  return AI_TIMING_METRICS.filter((metric) => available.includes(metric));
}

function aiTimingRowsForVersion(project, version, dates, options = {}) {
  const reportDate = aiTimingReportDate();
  const analysisType = options.analysisType || "";
  const objectName = options.objectName || "";
  const country = options.country || "全部";
  return (dashboardData.timing?.rows || []).filter((row) =>
    row["项目代号"] === project &&
    row["版本号"] === version &&
    dates.includes(row["首次访问日期"]) &&
    (!reportDate || row["报表日期"] === reportDate) &&
    (!analysisType || !row["分析类型"] || row["分析类型"] === analysisType) &&
    (!objectName || row["通知时机"] === objectName) &&
    (!country || row["国家"] === country)
  );
}

function aiTimingAggregate(project, version, dates, options = {}, intent = null) {
  const metrics = aiTimingMetrics(intent);
  const rows = aiTimingRowsForVersion(project, version, dates, options);
  return {
    rows,
    aggregated: rows.length ? aggregateRows(rows, metrics) : null,
  };
}

function aiTimingObjectsForIntent(project, oldVersion, newVersion, dates, intent) {
  if (!intent.wantsNotification) return [];
  const reportDate = aiTimingReportDate();
  const versions = [oldVersion, newVersion].filter(Boolean);
  const rows = (dashboardData.timing?.rows || []).filter((row) =>
    row["项目代号"] === project &&
    versions.includes(row["版本号"]) &&
    dates.includes(row["首次访问日期"]) &&
    (!reportDate || row["报表日期"] === reportDate)
  );
  const candidates = [];
  intent.analysisTypes.forEach((analysisType) => {
    const values = uniqueValues(rows.filter((row) => !row["分析类型"] || row["分析类型"] === analysisType), "通知时机");
    const matched = values.filter((value) => {
      const lower = String(value || "").toLowerCase();
      return intent.focusTerms.length
        ? intent.focusTerms.some((term) => lower.includes(term.toLowerCase()) || String(value).includes(term))
        : true;
    });
    matched.forEach((objectName) => {
      if (objectName && objectName !== "全部") {
        candidates.push({ analysisType, objectName });
      }
    });
  });
  const seen = {};
  const uniqueCandidates = candidates.filter((item) => {
    const key = `${item.analysisType}|${item.objectName}`;
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  const text = String(intent.rawText || "");
  const wantsCopyFirst = /文案|安装|卸载|截图|截屏|home|图片|视频|音频|清理|恢复/i.test(text);
  const scoreMetricNames = [
    "D0展示用户率",
    "D0人均展示次数",
    "D0通知点击率",
    "D0人均点击次数",
    "D0通知点击转化率",
  ].filter((metric) => (dashboardData.timing?.metrics || []).includes(metric));
  const scored = uniqueCandidates.map((item) => {
    const oldAgg = aiTimingAggregate(project, oldVersion, dates, item, null).aggregated || {};
    const newAgg = aiTimingAggregate(project, newVersion, dates, item, null).aggregated || {};
    const changes = scoreMetricNames.map((metric) => aiMetricChange(metric, oldAgg[metric], newAgg[metric])).filter(Boolean);
    const risingScore = changes
      .filter((change) => change.delta > 0)
      .reduce((sum, change) => sum + change.magnitude, 0);
    const riskScore = changes
      .filter((change) => aiChangeTone(change) === "变差")
      .reduce((sum, change) => sum + change.magnitude, 0);
    const focusScore = intent.focusTerms.some((term) => String(item.objectName).includes(term)) ? 10 : 0;
    const typeScore = wantsCopyFirst && item.analysisType === "通知文案" ? 3 : item.analysisType === "通知文案" ? 1 : 0;
    return {
      ...item,
      score: focusScore + typeScore + risingScore + riskScore * 0.5,
      risingScore,
      riskScore,
    };
  }).sort((a, b) => b.score - a.score || b.risingScore - a.risingScore || String(a.objectName).localeCompare(String(b.objectName), "zh-Hans-CN", { numeric: true }));
  return scored.slice(0, intent.focusTerms.length ? 8 : 6).map(({ analysisType, objectName }) => ({ analysisType, objectName }));
}

function aiTimingChange(project, oldVersion, newVersion, dates, objectItem, country = "全部", intent = null) {
  const options = { ...objectItem, country };
  const oldData = aiTimingAggregate(project, oldVersion, dates, options, intent);
  const newData = aiTimingAggregate(project, newVersion, dates, options, intent);
  const changes = aiTimingMetrics(intent)
    .map((metric) => aiMetricChange(metric, oldData.aggregated?.[metric], newData.aggregated?.[metric]))
    .filter(Boolean);
  return {
    ...objectItem,
    oldData,
    newData,
    changes,
    rankedChanges: changes.slice().sort((a, b) => b.magnitude - a.magnitude),
  };
}

function aiFeatureReportDate() {
  return sortDimensionValues("报表日期", uniqueValues(featureRows(), "报表日期")).slice(-1)[0] || "";
}

function aiFeatureAnalysisTypesForIntent(project, oldVersion, newVersion, dates, intent) {
  if (!intent.wantsFeature) return [];
  const reportDate = aiFeatureReportDate();
  const versions = [oldVersion, newVersion].filter(Boolean);
  const rows = featureRows().filter((row) =>
    row["项目代号"] === project &&
    versions.includes(row["版本号"]) &&
    dates.includes(row["首次访问日期"]) &&
    (!reportDate || row["报表日期"] === reportDate)
  );
  const types = uniqueValues(rows, "分析类型");
  const text = intent.rawText || "";
  const preferred = [];
  if (/首页|模块|点击/i.test(text)) {
    preferred.push(...types.filter((type) => String(type).includes("首页") || String(type).includes("点击")));
  }
  if (/首次启动|启动流程/i.test(text)) {
    preferred.push(...types.filter((type) => String(type).includes("首次启动")));
  }
  if (/漏斗|引导/i.test(text)) {
    const focusedFunnels = intent.focusTerms.length
      ? types.filter((type) => String(type).includes("漏斗") && intent.focusTerms.some((term) => String(type).includes(term)))
      : [];
    preferred.push(...(focusedFunnels.length ? focusedFunnels : types.filter((type) => String(type).includes("漏斗")).slice(0, 2)));
  }
  intent.focusTerms.forEach((term) => {
    preferred.push(...types.filter((type) => String(type).includes(term)));
  });
  if (!preferred.length) {
    preferred.push(...types);
  }
  const seen = {};
  return preferred.filter((type) => {
    if (!type || seen[type]) return false;
    seen[type] = true;
    return true;
  }).slice(0, 4);
}

function aiFeatureRowsForVersion(project, version, dates, analysisType, country = "全部") {
  const reportDate = aiFeatureReportDate();
  const baseRows = featureRows().filter((row) =>
    row["项目代号"] === project &&
    row["版本号"] === version &&
    dates.includes(row["首次访问日期"]) &&
    row["分析类型"] === analysisType &&
    (!reportDate || row["报表日期"] === reportDate)
  );
  if (country && baseRows.some((row) => row["国家"] === country)) {
    return baseRows.filter((row) => row["国家"] === country);
  }
  return baseRows;
}

function aiFeatureChange(project, oldVersion, newVersion, dates, analysisType, country = "全部") {
  const oldRows = aiFeatureRowsForVersion(project, oldVersion, dates, analysisType, country);
  const newRows = aiFeatureRowsForVersion(project, newVersion, dates, analysisType, country);
  const objects = uniqueValues([...oldRows, ...newRows], "分析对象").filter((object) => object && object !== "新增用户");
  const changes = objects.map((object) => {
    const oldValue = weightedFeatureValue(oldRows, object, "D0");
    const newValue = weightedFeatureValue(newRows, object, "D0");
    if (oldValue === null || newValue === null) return null;
    const delta = newValue - oldValue;
    return {
      analysisType,
      object,
      metric: `${object}_D0`,
      oldValue,
      newValue,
      delta,
      magnitude: Math.abs(delta),
      kind: "rate",
      improved: delta > 0,
    };
  }).filter(Boolean);
  const stepValues = objects.map((object) => ({
    object,
    value: weightedFeatureValue(newRows, object, "D0"),
  })).filter((item) => item.value !== null);
  const drops = stepValues.slice(1).map((item, index) => ({
    from: stepValues[index].object,
    to: item.object,
    drop: stepValues[index].value - item.value,
  })).filter((item) => item.drop > 0).sort((a, b) => b.drop - a.drop);
  return {
    analysisType,
    oldRows,
    newRows,
    oldUsers: featureSampleUsersForRows(oldRows),
    newUsers: featureSampleUsersForRows(newRows),
    changes,
    rankedChanges: changes.slice().sort((a, b) => b.magnitude - a.magnitude),
    improved: changes.filter((change) => change.improved).sort((a, b) => b.magnitude - a.magnitude),
    worsened: changes.filter((change) => change.improved === false).sort((a, b) => b.magnitude - a.magnitude),
    mainDrop: drops[0] || null,
  };
}

function aiFeatureFormatDelta(change) {
  if (!change) return "暂无";
  const sign = change.delta > 0 ? "+" : change.delta < 0 ? "-" : "";
  return `${sign}${Math.abs(change.delta * 100).toFixed(2)}个百分点`;
}

function aiBuildFeatureFocus(project, oldVersion, newVersion, dates, intent) {
  return aiFeatureAnalysisTypesForIntent(project, oldVersion, newVersion, dates, intent)
    .map((analysisType) => aiFeatureChange(project, oldVersion, newVersion, dates, analysisType))
    .filter((item) => item.changes.length);
}

function aiFeatureRowsForProject(project, dates, analysisType, country = "全部") {
  const reportDate = aiFeatureReportDate();
  let rows = featureRows().filter((row) =>
    row["项目代号"] === project &&
    dates.includes(row["首次访问日期"]) &&
    row["分析类型"] === analysisType &&
    (!reportDate || row["报表日期"] === reportDate)
  );
  if (rows.some((row) => row["版本号"] === "全部")) {
    rows = rows.filter((row) => row["版本号"] === "全部");
  }
  if (country && rows.some((row) => row["国家"] === country)) {
    rows = rows.filter((row) => row["国家"] === country);
  }
  return rows;
}

function aiFeatureAnalysisTypesForProjectCompare(projects, dates, intent) {
  const reportDate = aiFeatureReportDate();
  const rows = featureRows().filter((row) =>
    projects.includes(row["项目代号"]) &&
    dates.includes(row["首次访问日期"]) &&
    (!reportDate || row["报表日期"] === reportDate)
  );
  const types = uniqueValues(rows, "分析类型").filter(Boolean);
  const text = intent?.rawText || "";
  const preferred = [];
  if (/首次启动|启动流程/i.test(text)) {
    preferred.push(...types.filter((type) => String(type).includes("首次启动")));
  }
  if (/漏斗|引导/i.test(text)) {
    preferred.push(...types.filter((type) => String(type).includes("漏斗")));
  }
  if (/首页|模块|点击/i.test(text)) {
    preferred.push(...types.filter((type) => String(type).includes("首页") || String(type).includes("点击")));
  }
  (intent?.focusTerms || []).forEach((term) => {
    preferred.push(...types.filter((type) => String(type).includes(term)));
  });
  return uniqueArray((preferred.length ? preferred : types).filter(Boolean)).slice(0, 6);
}

function aiFeatureProjectCompareItem(baseProject, compareProject, dates, analysisType, country = "全部") {
  const baseRows = aiFeatureRowsForProject(baseProject, dates, analysisType, country);
  const compareRows = aiFeatureRowsForProject(compareProject, dates, analysisType, country);
  const objects = uniqueValues(baseRows.concat(compareRows), "分析对象")
    .filter((object) => object && object !== "新增用户");
  const changes = objects.map((object) => {
    const baseValue = weightedFeatureValue(baseRows, object, "D0");
    const compareValue = weightedFeatureValue(compareRows, object, "D0");
    if (baseValue === null || compareValue === null) return null;
    const delta = compareValue - baseValue;
    return {
      analysisType,
      object,
      metric: object,
      oldValue: baseValue,
      newValue: compareValue,
      delta,
      magnitude: Math.abs(delta),
      kind: "rate",
      improved: delta > 0,
    };
  }).filter(Boolean);
  const rankedChanges = changes.slice().sort((a, b) => b.magnitude - a.magnitude);
  return {
    analysisType,
    country,
    dates,
    hasData: !!baseRows.length && !!compareRows.length && !!changes.length,
    sample: {
      baseUsers: Math.round(featureSampleUsersForRows(baseRows) || 0),
      compareUsers: Math.round(featureSampleUsersForRows(compareRows) || 0),
    },
    strongestChanges: rankedChanges.slice(0, 8).map((change) => ({
      object: change.object,
      baseValue: featureValue("D0", change.oldValue),
      compareValue: featureValue("D0", change.newValue),
      delta: aiFeatureFormatDelta(change),
      judgment: change.delta > 0 ? `${compareProject} 更高` : change.delta < 0 ? `${baseProject} 更高` : "基本持平",
    })),
    tableRows: rankedChanges.slice(0, 12).map((change) => ({
      range: country === "全部" ? "整体" : country,
      analysisType,
      object: change.object,
      baseObject: baseProject,
      baseValue: featureValue("D0", change.oldValue),
      compareObject: compareProject,
      compareValue: featureValue("D0", change.newValue),
      delta: aiFeatureFormatDelta(change),
      judgment: change.delta > 0 ? `${compareProject} 更高` : change.delta < 0 ? `${baseProject} 更高` : "基本持平",
    })),
  };
}

function aiBuildFeatureProjectCompareContext(baseProject, compareProject, dates, requestedCountries, intent) {
  if (!intent?.wantsFeature) return null;
  const analysisTypes = aiFeatureAnalysisTypesForProjectCompare([baseProject, compareProject], dates, intent);
  const countries = uniqueArray(["全部"].concat(requestedCountries || []));
  const modules = countries.flatMap((country) =>
    analysisTypes.map((analysisType) =>
      aiFeatureProjectCompareItem(baseProject, compareProject, dates, analysisType, country)
    )
  ).filter((item) => item.hasData);
  return {
    taskType: "项目间功能模块对比",
    baseProject,
    compareProject,
    dates,
    requestedCountries,
    analysisTypes,
    hasData: modules.length > 0,
    modules: modules.slice(0, 12),
    comparisonTableRows: modules.flatMap((item) => item.tableRows || []).slice(0, 80),
  };
}

function aiBuildNotificationSummary(changes) {
  const notificationChanges = changes.filter((change) => aiNotificationMetrics(aiDetectIntent(appState.aiIterationText)).includes(change.metric));
  if (!notificationChanges.length) return "当前筛选下没有足够的整体通知指标可判断。";
  const worsened = notificationChanges.filter((change) => aiChangeTone(change) === "变差");
  const improved = notificationChanges.filter((change) => aiChangeTone(change) === "变好");
  const strongest = notificationChanges.slice().sort((a, b) => b.magnitude - a.magnitude)[0];
  const mainText = strongest
    ? `${strongest.metric}变化最明显：${formatMetric(strongest.metric, strongest.oldValue)} → ${formatMetric(strongest.metric, strongest.newValue)}（${aiFormatDelta(strongest)}，${aiChangeTone(strongest)}）。`
    : "";
  if (worsened.length > improved.length) {
    return `整体通知链路偏谨慎：${worsened.map((item) => item.metric).join("、")}变差。${mainText}`;
  }
  if (improved.length > worsened.length) {
    return `整体通知链路偏正向：${improved.map((item) => item.metric).join("、")}变好。${mainText}`;
  }
  return `整体通知链路有升有降，需要结合文案专项看。${mainText}`;
}

function aiChangeByMetric(changes, metric) {
  return changes.find((change) => change.metric === metric) || null;
}

function aiIsNotImproved(change) {
  return !!change && aiChangeTone(change) !== "变好";
}

function aiBuildCauseDiagnosis(analysis) {
  const primaryDay = analysis.intent?.wantsDayFocus ? (analysis.intent.focusDays?.[0] || "D0") : "D0";
  const uninstall = aiChangeByMetric(analysis.changes, `卸载率_${primaryDay}`);
  const retention = aiChangeByMetric(analysis.changes, "D1留存率");
  const showRate = aiChangeByMetric(analysis.changes, `通知展示率_${primaryDay}`);
  const showAvg = aiChangeByMetric(analysis.changes, `人均展示次数_${primaryDay}`);
  const clickRate = aiChangeByMetric(analysis.changes, `通知点击率_${primaryDay}`);
  const clickAvg = aiChangeByMetric(analysis.changes, `人均点击次数_${primaryDay}`);
  const uninstallWorse = uninstall && aiChangeTone(uninstall) === "变差";
  const retentionNoLift = retention && aiIsNotImproved(retention);
  const exposureUp = [showRate, showAvg].some((change) => change && change.delta > 0);
  const clickNotSync = [clickRate, clickAvg].some((change) => change && aiIsNotImproved(change));
  const focusRisks = analysis.timingFocus.map((item) => {
    const exposure = item.changes.filter((change) =>
      [`${primaryDay}展示用户率`, `${primaryDay}人均展示次数`].includes(change.metric) && change.delta > 0
    );
    const weak = item.changes.filter((change) =>
      [`${primaryDay}通知点击率`, `${primaryDay}通知点击转化率`, `${primaryDay}人均点击次数`].includes(change.metric) && aiIsNotImproved(change)
    );
    const strongestRisk = aiStrongestSummaryChange(item.changes.filter((change) => aiChangeTone(change) === "变差"));
    return {
      item,
      exposure,
      weak,
      strongestRisk,
      suspicious: exposure.length && (weak.length || uninstallWorse || retentionNoLift),
    };
  }).filter((item) => item.suspicious);
  const riskCountries = analysis.topCountries
    .filter((item) => item.valid)
    .map((item) => {
      const uninstallChange = aiChangeByMetric(item.changes, `卸载率_${primaryDay}`);
      const retentionChange = aiChangeByMetric(item.changes, "D1留存率");
      const reasons = [];
      if (uninstallChange && aiChangeTone(uninstallChange) === "变差") {
        reasons.push(`卸载率 ${formatMetric(uninstallChange.metric, uninstallChange.oldValue)} → ${formatMetric(uninstallChange.metric, uninstallChange.newValue)}`);
      }
      if (retentionChange && aiIsNotImproved(retentionChange)) {
        reasons.push(`D1留存 ${formatMetric(retentionChange.metric, retentionChange.oldValue)} → ${formatMetric(retentionChange.metric, retentionChange.newValue)}`);
      }
      return { ...item, reasons };
    })
    .filter((item) => item.reasons.length)
    .slice(0, 5);
  const evidence = [];
  if (uninstallWorse) evidence.push(`卸载率已经变差：${formatMetric(uninstall.metric, uninstall.oldValue)} → ${formatMetric(uninstall.metric, uninstall.newValue)}（${aiFormatDelta(uninstall)}）。`);
  if (retentionNoLift) evidence.push(`D1留存没有改善：${formatMetric(retention.metric, retention.oldValue)} → ${formatMetric(retention.metric, retention.newValue)}（${aiFormatDelta(retention)}）。`);
  if (exposureUp) {
    const exposureText = [showRate, showAvg]
      .filter((change) => change && change.delta > 0)
      .map((change) => `${change.metric} ${formatMetric(change.metric, change.oldValue)} → ${formatMetric(change.metric, change.newValue)}`)
      .join("；");
    evidence.push(`通知触达变强：${exposureText}。`);
  }
  if (clickNotSync) {
    const clickText = [clickRate, clickAvg]
      .filter((change) => change && aiIsNotImproved(change))
      .map((change) => `${change.metric} ${formatMetric(change.metric, change.oldValue)} → ${formatMetric(change.metric, change.newValue)}`)
      .join("；");
    evidence.push(`点击质量没有同步改善：${clickText}。`);
  }
  const signalCount = [uninstallWorse, retentionNoLift, exposureUp, clickNotSync, !!focusRisks.length].filter(Boolean).length;
  const conclusion = signalCount >= 4
    ? "更像是推送触发放开后，触达压力增加，但用户意图没有同步提升，导致卸载率上升且留存没有吃到收益。"
    : signalCount >= 2
    ? "目前存在推送触达压力变大的迹象，但还需要结合安装/卸载文案和头部国家进一步确认。"
    : "当前证据还不足以直接归因到推送逻辑，需要先看整体通知指标和专项文案是否真的发生明显变化。";
  const nextSteps = [
    focusRisks.length
      ? `优先收敛 ${focusRisks.slice(0, 3).map((item) => `${item.item.analysisType}-${item.item.objectName}`).join("、")}：这些专项同时出现触达增强和质量承接不足的迹象，可以先降低频次、增加冷却时间或提高触发门槛。`
      : "先确认安装、卸载相关文案或时机是否有展示用户率、人均展示次数明显上升；如果有，优先给这些触发加频控或延迟触达。",
    riskCountries.length
      ? `对 ${riskCountries.map((item) => item.country).join("、")} 做国家差异化处理：先灰度回退或降低推送强度，避免头部国家继续拖累整体。`
      : "如果头部国家没有明显分化，说明可能是全局策略影响，可以先整体降低触达强度再观察。",
    analysis.intent.mentionsNoLimitPush
      ? "建议恢复基础频控实验：例如同类文案每日上限、安装/卸载触发冷却、连续触发合并，再观察卸载率和D1留存是否回稳。"
      : "建议补充触发次数或推送次数分层；如果高触发用户卸载更高，就优先从频次和触发门槛优化。",
  ];
  return {
    conclusion,
    evidence,
    nextSteps,
    focusRisks,
    riskCountries,
    signalCount,
  };
}

function aiRenderCauseDiagnosis(analysis) {
  const diagnosis = aiBuildCauseDiagnosis(analysis);
  if (!diagnosis || (!analysis.intent.wantsCauseDiagnosis && diagnosis.signalCount < 2)) return "";
  const focusRows = diagnosis.focusRisks.slice(0, 4).map((risk) => {
    const exposure = risk.exposure[0];
    const weak = risk.weak[0] || risk.strongestRisk;
    return `
      <div style="display:grid; grid-template-columns:minmax(170px, 0.9fr) minmax(240px, 1.2fr) minmax(240px, 1.2fr); gap:18px; align-items:start; padding:14px 0; border-top:1px solid rgba(86,102,115,0.12);">
        <strong>${risk.item.analysisType}-${risk.item.objectName}</strong>
        <span class="muted">${exposure ? `${exposure.metric}：${formatMetric(exposure.metric, exposure.oldValue)} → ${formatMetric(exposure.metric, exposure.newValue)}` : "触达变化不明显"}</span>
        <span class="muted">${weak ? `${weak.metric}：${formatMetric(weak.metric, weak.oldValue)} → ${formatMetric(weak.metric, weak.newValue)}（${aiChangeTone(weak)}）` : "点击质量暂无明显风险"}</span>
      </div>
    `;
  }).join("");
  const countryRows = diagnosis.riskCountries.slice(0, 5).map((item) => `
    <div style="display:grid; grid-template-columns:minmax(120px, 0.5fr) minmax(260px, 1.5fr); gap:18px; align-items:start; padding:12px 0; border-top:1px solid rgba(86,102,115,0.12);">
      <strong>${item.country}</strong>
      <span class="muted">${item.reasons.join("；")}</span>
    </div>
  `).join("");
  return `
    <div style="border:2px solid rgba(220,38,38,0.20); border-radius:22px; padding:26px 30px; margin:0 0 28px; background:linear-gradient(135deg, rgba(254,242,242,0.92), rgba(255,255,255,0.96)); box-shadow:0 18px 42px rgba(127,29,29,0.08);">
      <div class="eyebrow" style="color:#dc2626;">问题、可能原因和优化建议</div>
      <h3 style="margin:10px 0 18px; font-size:24px; line-height:1.5;">${diagnosis.conclusion}</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-bottom:22px;">
        <div style="border:1px solid rgba(220,38,38,0.18); border-radius:18px; padding:18px 20px; background:#fff;">
          <div class="eyebrow">目前看到的问题</div>
          <ul style="margin:12px 0 0; padding-left:20px; line-height:1.85;">${diagnosis.evidence.slice(0, 4).map((item) => `<li>${item}</li>`).join("") || "<li>当前整体指标证据不足。</li>"}</ul>
        </div>
        <div style="border:1px solid rgba(37,99,235,0.18); border-radius:18px; padding:18px 20px; background:#fff;">
          <div class="eyebrow">可以怎么优化</div>
          <ul style="margin:12px 0 0; padding-left:20px; line-height:1.85;">${diagnosis.nextSteps.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
      </div>
      ${focusRows ? `<div style="margin-top:8px;"><div class="eyebrow">安装/卸载专项线索</div>${focusRows}</div>` : ""}
      ${countryRows ? `<div style="margin-top:22px;"><div class="eyebrow">头部国家风险</div>${countryRows}</div>` : ""}
    </div>
  `;
}

function aiMetricChangeText(change) {
  if (!change) return "暂无可比数据";
  return `${formatMetric(change.metric, change.oldValue)} → ${formatMetric(change.metric, change.newValue)}（${aiFormatDelta(change)}，${aiChangeTone(change)}）`;
}

function aiQuestionCard(question, answer, tone = "normal") {
  const palette = {
    good: { color: "#0f766e", bg: "rgba(15,118,110,0.08)", border: "rgba(15,118,110,0.24)", label: "偏正向" },
    risk: { color: "#dc2626", bg: "rgba(254,242,242,0.95)", border: "rgba(220,38,38,0.24)", label: "需关注" },
    warn: { color: "#b45309", bg: "rgba(255,251,235,0.95)", border: "rgba(180,83,9,0.24)", label: "待确认" },
    normal: { color: "#2563eb", bg: "rgba(37,99,235,0.06)", border: "rgba(37,99,235,0.18)", label: "自动分析" },
  }[tone] || { color: "var(--accent)", bg: "#fff", border: "rgba(86,102,115,0.16)", label: "自动分析" };
  return `
    <article style="border:1px solid ${palette.border}; border-radius:18px; padding:18px 20px; background:${palette.bg}; min-height:150px;">
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
        <h3 style="margin:0; font-size:18px; line-height:1.45;">${question}</h3>
        <span style="flex:0 0 auto; border-radius:999px; padding:5px 10px; background:#fff; color:${palette.color}; font-weight:800; font-size:12px;">${palette.label}</span>
      </div>
      <p class="muted" style="margin:14px 0 0; line-height:1.75;">${answer}</p>
    </article>
  `;
}

function aiRenderInputRecognition(analysis) {
  const text = String(analysis.intent.rawText || "").trim();
  if (!text) {
    return `<p class="muted" style="font-size:13px; margin:10px 0 0;">DeepSeek 会自动结合整体指标、头部国家、通知文案/时机和功能模块分析；输入框可补充具体指标、国家、文案、功能或原因问题。</p>`;
  }
  if (!analysis.intent.supported) {
    return `
      <div style="margin-top:10px; border:1px solid rgba(220,38,38,0.20); border-radius:14px; padding:12px 14px; background:rgba(254,242,242,0.88); color:#991b1b; line-height:1.65;">
        当前输入没有识别到看板里的指标、维度或常见分析意图。可以输入原表字段，例如“XXX指标”“XXX国家”“XXX版本”“D1数据变化”“XXX文案/时机/功能”。
      </div>
    `;
  }
  const parts = [];
  if (analysis.intent.focusMetrics.length) parts.push(`指标：${analysis.intent.focusMetrics.slice(0, 6).join("、")}`);
  if (analysis.intent.focusDimensions.length) parts.push(`维度：${analysis.intent.focusDimensions.join("、")}`);
  if (analysis.intent.focusDimensionValues.length) {
    parts.push(`维度值：${analysis.intent.focusDimensionValues.slice(0, 6).map((item) => `${item.field}=${item.value}`).join("、")}`);
  }
  if (analysis.intent.focusDays.length) parts.push(`天数：${analysis.intent.focusDays.join("、")}`);
  return `
    <div style="margin-top:10px; border:1px solid rgba(15,118,110,0.18); border-radius:14px; padding:12px 14px; background:rgba(15,118,110,0.06); color:var(--muted); line-height:1.65;">
      ${parts.length ? `已识别重点，后面的分析会优先看 ${parts.join("；")}。` : "未识别到额外字段，DeepSeek 会按当前筛选下的整体数据自动判断分析重点。"}
      <span style="display:block; margin-top:4px;">输入后会自动刷新分析；如果想立刻刷新，也可以点击“立即分析”。</span>
    </div>
  `;
}

function aiRenderChangeRows(changes, emptyColspan = 5) {
  return changes.map((change) => `
    <tr>
      <th>${change.metric}</th>
      <td>${formatMetric(change.metric, change.oldValue)}</td>
      <td>${formatMetric(change.metric, change.newValue)}</td>
      <td class="${aiChangeClass(change)}">${aiFormatDelta(change)}</td>
      <td>${aiChangeTone(change)}</td>
    </tr>
  `).join("") || `<tr><td colspan="${emptyColspan}">当前筛选下没有足够数据。</td></tr>`;
}

function aiRenderNotificationCards(analysis) {
  if (!analysis.intent.wantsNotification) return "";
  const notificationChanges = aiSortChangesForList(analysis.changes
    .filter((change) => aiNotificationMetrics(analysis.intent).includes(change.metric) && Math.abs(change.delta) >= 0.0001));
  const improved = notificationChanges.filter((change) => aiChangeTone(change) === "变好");
  const worsened = notificationChanges.filter((change) => aiChangeTone(change) === "变差");
  const strongest = aiStrongestSummaryChange(improved);
  const risk = aiStrongestSummaryChange(worsened);
  const installHint = analysis.intent.focusTerms.length
    ? `已识别关注点：${analysis.intent.focusTerms.join("、")}。`
    : "未识别到具体文案关键词，会先看整体通知指标。";
  return `
    <div class="panel-title"><div><h2>整体通知指标</h2><p class="muted">先看新旧版本整体通知链路，再进入具体文案或时机。</p></div></div>
    <div style="border:1px solid rgba(86,102,115,0.16); border-radius:20px; padding:24px 28px; margin-bottom:24px; background:rgba(255,255,255,0.72);">
      <h3 style="margin:0 0 10px; line-height:1.5;">${improved.length > worsened.length ? "整体通知链路偏正向" : worsened.length > improved.length ? "整体通知链路偏谨慎" : "整体通知链路有升有降"}</h3>
      <p class="muted" style="margin:0 0 18px; line-height:1.65;">
        ${strongest ? `最大改善：${strongest.metric} ${formatMetric(strongest.metric, strongest.oldValue)} → ${formatMetric(strongest.metric, strongest.newValue)}（${aiFormatDelta(strongest)}）。` : "暂无明显改善。"}
        ${risk ? `主要风险：${risk.metric} ${formatMetric(risk.metric, risk.oldValue)} → ${formatMetric(risk.metric, risk.newValue)}（${aiFormatDelta(risk)}）。` : "暂无明显风险。"}
        ${installHint}
      </p>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:24px;">
        <div>
          <div class="eyebrow">通知变好</div>
          ${aiRenderChangeList(improved.slice(0, 6), "当前没有明显变好的通知指标。")}
        </div>
        <div>
          <div class="eyebrow">通知变差</div>
          ${aiRenderChangeList(worsened.slice(0, 6), "当前没有明显变差的通知指标。")}
        </div>
      </div>
    </div>
  `;
}

function aiRenderTimingFocus(analysis) {
  if (!analysis.intent.wantsNotification) return "";
  if (!analysis.timingFocus.length) {
    const target = analysis.intent.focusTerms.length ? analysis.intent.focusTerms.join("、") : "指定文案";
    return `
      <div class="warning-banner" style="margin-bottom:24px;">
        <strong>专项分析：</strong>当前通知数据里没有匹配到“${target}”相关的通知文案或通知时机。可以换成数据表里的完整名称，或先到“通知文案对比”菜单确认名称。
      </div>
    `;
  }
  const blocks = analysis.timingFocus.map((item) => {
    const sortedChanges = aiSortChangesForList(item.changes.filter((change) => Math.abs(change.delta) >= 0.0001));
    const strongest = aiStrongestSummaryChange(sortedChanges);
    const worsened = sortedChanges.filter((change) => aiChangeTone(change) === "变差");
    const improved = sortedChanges.filter((change) => aiChangeTone(change) === "变好");
    const verdict = worsened.length > improved.length
      ? "专项表现偏弱"
      : improved.length > worsened.length
      ? "专项表现偏好"
      : "专项表现混合";
    return `
      <div style="border:1px solid rgba(86,102,115,0.16); border-radius:20px; padding:24px 28px; background:rgba(255,255,255,0.72);">
        <div class="eyebrow">${item.analysisType}</div>
        <h3 style="margin:8px 0 10px;">${item.objectName}</h3>
        <p class="muted" style="margin:0 0 18px; line-height:1.65;">${verdict}。${strongest ? `变化最大：${strongest.metric} ${formatMetric(strongest.metric, strongest.oldValue)} → ${formatMetric(strongest.metric, strongest.newValue)}（${aiFormatDelta(strongest)}，${aiChangeTone(strongest)}）。` : "暂无可比指标。"}</p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap:20px;">
          <div>
            <div class="eyebrow">变好</div>
            ${aiRenderChangeList(improved.slice(0, 5), "暂无明显变好指标。")}
          </div>
          <div>
            <div class="eyebrow">变差</div>
            ${aiRenderChangeList(worsened.slice(0, 5), "暂无明显变差指标。")}
          </div>
        </div>
      </div>
    `;
  }).join("");
  return `
    <div class="panel-title"><div><h2>指定文案/时机专项</h2><p class="muted">根据输入内容自动匹配通知文案或通知时机，例如“安装”“卸载”。</p></div></div>
    <div style="display:flex; flex-direction:column; gap:22px; margin-bottom:28px;">${blocks}</div>
  `;
}

function aiRenderTimingCountryFocus(analysis) {
  if (!analysis.intent.wantsNotification || !analysis.timingCountryFocus.length) return "";
  const blocks = analysis.timingCountryFocus.map((item) => {
    const countryRows = item.countries.map((countryItem) => {
      const change = countryItem.keyChange;
      return `
        <div style="display:grid; grid-template-columns:minmax(150px, 0.7fr) minmax(260px, 1.5fr) minmax(110px, auto); gap:16px; align-items:center; padding:12px 0; border-top:1px solid rgba(86,102,115,0.10);">
          <strong>${countryItem.country}</strong>
          <span class="muted">${change.metric}：${formatMetric(change.metric, change.oldValue)} → ${formatMetric(change.metric, change.newValue)}</span>
          <strong style="text-align:right;">${aiFormatDelta(change)}</strong>
        </div>
      `;
    }).join("");
    return `
      <div style="border:1px solid rgba(86,102,115,0.16); border-radius:20px; padding:24px 28px; background:rgba(255,255,255,0.72);">
        <div class="eyebrow">头部国家专项</div>
        <h3 style="margin:8px 0 18px;">${item.objectName}</h3>
        ${countryRows || `<p class="muted">头部国家暂无可比专项数据。</p>`}
      </div>
    `;
  }).join("");
  return `
    <div class="panel-title"><div><h2>买量多国家里的专项差异</h2><p class="muted">只看样本达标的头部国家，判断指定文案是否在某些国家表现分化。</p></div></div>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(520px, 1fr)); gap:24px; margin-bottom:30px;">${blocks}</div>
  `;
}

function aiRenderChangeList(items, emptyText) {
  if (!items.length) {
    return `<p class="muted">${emptyText}</p>`;
  }
  return `
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${items.map((change) => `
        <div style="display:grid; grid-template-columns:minmax(180px, 1fr) minmax(220px, 1.2fr) minmax(90px, auto); gap:16px; align-items:center; padding:12px 0; border-top:1px solid rgba(86,102,115,0.10);">
          <strong>${change.metric}</strong>
          <span class="muted">${formatMetric(change.metric, change.oldValue)} → ${formatMetric(change.metric, change.newValue)}</span>
          <strong style="text-align:right;">${aiFormatDelta(change)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function aiRenderFeatureChangeList(items, emptyText) {
  if (!items.length) {
    return `<p class="muted">${emptyText}</p>`;
  }
  return `
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${items.map((change) => `
        <div style="display:grid; grid-template-columns:minmax(180px, 1fr) minmax(220px, 1.2fr) minmax(90px, auto); gap:16px; align-items:center; padding:12px 0; border-top:1px solid rgba(86,102,115,0.10);">
          <strong>${change.object}</strong>
          <span class="muted">${featureValue("D0", change.oldValue)} → ${featureValue("D0", change.newValue)}</span>
          <strong style="text-align:right;">${aiFeatureFormatDelta(change)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function aiRenderChangeBuckets(analysis) {
  const qualityChanges = aiQualityChanges(analysis);
  const improved = qualityChanges.filter((change) => aiChangeTone(change) === "变好").slice(0, 8);
  const worsened = qualityChanges.filter((change) => aiChangeTone(change) === "变差").slice(0, 8);
  return `
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:24px; margin-bottom:30px;">
      <div style="border:1px solid rgba(86,102,115,0.16); border-radius:18px; padding:22px 26px; background:rgba(255,255,255,0.68);">
        <div class="eyebrow">变好指标</div>
        <h3 style="margin:8px 0 18px;">${improved.length} 个重点改善</h3>
        ${aiRenderChangeList(improved, "当前没有明显变好的质量指标。")}
      </div>
      <div style="border:1px solid rgba(86,102,115,0.16); border-radius:18px; padding:22px 26px; background:rgba(255,255,255,0.68);">
        <div class="eyebrow">变差指标</div>
        <h3 style="margin:8px 0 18px;">${worsened.length} 个需要关注</h3>
        ${aiRenderChangeList(worsened, "当前没有明显变差的质量指标。")}
      </div>
    </div>
  `;
}

function aiRenderCountryChangeBuckets(countryItem) {
  const changes = aiSortChangesForList((countryItem?.changes || [])
    .filter((change) => change.metric !== "新增用户数" && Math.abs(change.delta) >= 0.0001));
  const improved = changes.filter((change) => aiChangeTone(change) === "变好").slice(0, 6);
  const worsened = changes.filter((change) => aiChangeTone(change) === "变差").slice(0, 6);
  return `
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:24px; margin-bottom:28px;">
      <div style="border:1px solid rgba(86,102,115,0.16); border-radius:18px; padding:22px 26px; background:rgba(255,255,255,0.68);">
        <div class="eyebrow">该国家变好</div>
        <h3 style="margin:8px 0 18px;">${improved.length} 个改善指标</h3>
        ${aiRenderChangeList(improved, "该国家当前没有明显变好的质量指标。")}
      </div>
      <div style="border:1px solid rgba(86,102,115,0.16); border-radius:18px; padding:22px 26px; background:rgba(255,255,255,0.68);">
        <div class="eyebrow">该国家变差</div>
        <h3 style="margin:8px 0 18px;">${worsened.length} 个风险指标</h3>
        ${aiRenderChangeList(worsened, "该国家当前没有明显变差的质量指标。")}
      </div>
    </div>
  `;
}

function aiRenderOverallSection(analysis, context) {
  return `
    <section class="feature-overview" style="margin-bottom:26px;">
      <div class="panel-title" style="margin-top:0;">
        <div>
          <h2>综合数据</h2>
          <p class="muted">先看当前项目、版本和日期范围下的整体结论。</p>
        </div>
      </div>
      ${appState.aiIterationText.trim() ? `<div class="muted" style="margin-bottom:10px;">迭代背景：${escapeAttr(appState.aiIterationText.trim())}</div>` : ""}
      ${aiRenderSummaryPanel("总结", context.summaryBullets)}
      ${aiRenderChangeBuckets(analysis)}
      ${aiRenderNotificationCards(analysis)}
      ${aiRenderTimingFocus(analysis)}
    </section>
  `;
}

function aiRenderCountrySection(analysis) {
  const availableCountries = analysis.topCountries.filter((item) => item.valid);
  const countries = availableCountries.length ? availableCountries : analysis.topCountries;
  const selectedCountry = countries.some((item) => item.country === appState.aiCountry)
    ? appState.aiCountry
    : countries[0]?.country || "";
  if (selectedCountry && selectedCountry !== appState.aiCountry) {
    appState.aiCountry = selectedCountry;
  }
  const selected = countries.find((item) => item.country === selectedCountry);
  const countryImproved = aiSortChangesForList((selected?.changes || []).filter((change) => aiChangeTone(change) === "变好"));
  const countryWorsened = aiSortChangesForList((selected?.changes || []).filter((change) => aiChangeTone(change) === "变差"));
  const strongest = aiStrongestSummaryChange((selected?.changes || [])
    .filter((change) => change.metric !== "新增用户数" && Math.abs(change.delta) >= 0.0001));
  const countrySummary = selected
    ? [
      `该国家有 ${countryImproved.length} 个指标变好、${countryWorsened.length} 个指标变差，${countryWorsened.length > countryImproved.length ? "整体需要重点关注" : countryImproved.length > countryWorsened.length ? "整体偏正向" : "表现比较分化"}。`,
      strongest ? `变化最大的是 ${strongest.metric}：${formatMetric(strongest.metric, strongest.oldValue)} → ${formatMetric(strongest.metric, strongest.newValue)}（${aiFormatDelta(strongest)}，${aiChangeTone(strongest)}）。` : "暂无明显质量指标变化。",
      "",
      `${selected.country} 样本：旧版本 ${Math.round(selected.oldUsers).toLocaleString("zh-CN")}，新版本 ${Math.round(selected.newUsers).toLocaleString("zh-CN")}，样本${selected.valid ? "可纳入判断" : "偏少，只适合作为线索"}。`,
    ]
    : ["当前筛选下没有国家维度数据。"];
  return `
    <section class="feature-overview" style="margin-bottom:26px;">
      <div class="panel-title" style="margin-top:0;">
        <div>
          <h2>国家数据</h2>
          <p class="muted">选择一个头部国家，单独看这个国家的新旧版本变化。</p>
        </div>
      </div>
      <div class="chip-row" style="margin-bottom:18px;">
        ${countries.map((item) => `
          <button type="button" class="chip ai-country-button ${item.country === selectedCountry ? "active" : ""}" data-country="${escapeAttr(item.country)}" style="cursor:pointer; border:0; ${item.country === selectedCountry ? "background:var(--accent); color:#fff;" : ""}">
            ${item.country}
          </button>
        `).join("") || `<span class="chip">暂无国家数据</span>`}
      </div>
      ${aiRenderSummaryPanel(`${selectedCountry || "国家"}总结`, countrySummary)}
      ${aiRenderCountryChangeBuckets(selected)}
      ${aiRenderTimingCountryFocus(analysis)}
    </section>
  `;
}

function aiRenderFeatureFocus(analysis) {
  if (!analysis.intent.wantsFeature) return "";
  if (!analysis.featureFocus.length) {
    return `
      <section class="feature-overview" style="margin-bottom:26px;">
        <div class="panel-title" style="margin-top:0;">
          <div>
            <h2>功能模块专项</h2>
            <p class="muted">按分析类型切换查看功能漏斗或模块点击变化。</p>
          </div>
        </div>
        <div class="warning-banner" style="margin-bottom:0;">
          <strong>功能模块专项：</strong>当前项目、新旧版本和日期范围下没有匹配到可对比的功能模块数据。可以换一下日期或确认这两个版本是否都有 feature_export。
        </div>
      </section>
    `;
  }
  const selectedType = analysis.featureFocus.some((item) => item.analysisType === appState.aiFeatureAnalysisType)
    ? appState.aiFeatureAnalysisType
    : analysis.featureFocus[0].analysisType;
  if (selectedType !== appState.aiFeatureAnalysisType) {
    appState.aiFeatureAnalysisType = selectedType;
  }
  const selected = analysis.featureFocus.find((item) => item.analysisType === selectedType) || analysis.featureFocus[0];
  const strongest = selected.rankedChanges[0];
  const improved = selected.improved.slice(0, 8);
  const worsened = selected.worsened.slice(0, 8);
  const isFunnel = String(selected.analysisType).includes("漏斗");
  const verdict = selected.worsened.length > selected.improved.length
    ? "负向变化更多，需要重点关注"
    : selected.improved.length > selected.worsened.length
    ? "正向变化更多，整体偏改善"
    : "正负变化接近，需要看具体对象";
  const summary = [
    `${selected.analysisType} 当前 ${selected.improved.length} 个对象变好、${selected.worsened.length} 个对象变差，${verdict}。`,
    strongest ? `变化最大的是 ${strongest.object}：${featureValue("D0", strongest.oldValue)} → ${featureValue("D0", strongest.newValue)}（${aiFeatureFormatDelta(strongest)}，${strongest.improved ? "变好" : "变差"}）。` : "暂无明显变化。",
    isFunnel && selected.mainDrop ? `新版本主要流失步骤：${selected.mainDrop.from} → ${selected.mainDrop.to}，下降 ${featureValue("D0", selected.mainDrop.drop)}。` : "",
    `样本：旧版本 ${Math.round(selected.oldUsers).toLocaleString("zh-CN")}，新版本 ${Math.round(selected.newUsers).toLocaleString("zh-CN")}。`,
  ];
  const rows = selected.rankedChanges.slice(0, 30).map((change) => `
    <tr>
      <td>${change.object}</td>
      <td>${featureValue("D0", change.oldValue)}</td>
      <td>${featureValue("D0", change.newValue)}</td>
      <td class="${change.improved ? "best-cell" : "weak-cell"}">${aiFeatureFormatDelta(change)}</td>
      <td>${change.improved ? "变好" : "变差"}</td>
    </tr>
  `).join("");
  return `
    <section class="feature-overview" style="margin-bottom:26px;">
      <div class="panel-title" style="margin-top:0;">
        <div>
          <h2>功能模块专项</h2>
          <p class="muted">选择一个分析类型，单独看该功能模块的新旧版本变化。</p>
        </div>
      </div>
      <div class="chip-row" style="margin-bottom:18px;">
        ${analysis.featureFocus.map((item) => `
          <button type="button" class="chip ai-feature-button ${item.analysisType === selectedType ? "active" : ""}" data-feature-type="${escapeAttr(item.analysisType)}" style="cursor:pointer; border:0; ${item.analysisType === selectedType ? "background:var(--accent); color:#fff;" : ""}">
            ${item.analysisType}
          </button>
        `).join("")}
      </div>
      ${aiRenderSummaryPanel(`${selected.analysisType}总结`, summary)}
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:24px; margin-bottom:28px;">
        <div style="border:1px solid rgba(86,102,115,0.16); border-radius:18px; padding:22px 26px; background:rgba(255,255,255,0.68);">
          <div class="eyebrow">该模块变好</div>
          <h3 style="margin:8px 0 18px;">${improved.length} 个改善对象</h3>
          ${aiRenderFeatureChangeList(improved, "该模块当前没有明显变好的对象。")}
        </div>
        <div style="border:1px solid rgba(86,102,115,0.16); border-radius:18px; padding:22px 26px; background:rgba(255,255,255,0.68);">
          <div class="eyebrow">该模块变差</div>
          <h3 style="margin:8px 0 18px;">${worsened.length} 个风险对象</h3>
          ${aiRenderFeatureChangeList(worsened, "该模块当前没有明显变差的对象。")}
        </div>
      </div>
      <div class="table-wrap" style="margin-bottom:0;">
        <table class="metric-table">
          <thead><tr><th>分析对象</th><th>旧版本_D0</th><th>新版本_D0</th><th>变化</th><th>方向</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="5">当前筛选下没有功能模块指标。</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
}

function aiBuildRecommendation(analysis) {
  if (analysis.intent.wantsFeature && analysis.featureFocus.length) {
    const risk = analysis.featureFocus
      .flatMap((item) => item.worsened.map((change) => ({ item, change })))
      .sort((a, b) => b.change.magnitude - a.change.magnitude)[0];
    if (risk) {
      return `建议先看 ${risk.item.analysisType} 里的 ${risk.change.object}：它是当前功能专项里最明显的负向变化。`;
    }
    return "功能模块整体没有明显负向项，可以继续看头部国家是否同步改善。";
  }
  const qualityChanges = analysis.changes.filter((change) => change.metric !== "新增用户数");
  const uninstall = qualityChanges.find((change) => change.metric === "卸载率_D0");
  const click = qualityChanges.find((change) => change.metric === "通知点击率_D0");
  const show = qualityChanges.find((change) => change.metric === "通知展示率_D0");
  const timingRisk = analysis.timingFocus
    .flatMap((item) => item.changes.map((change) => ({ item, change })))
    .filter(({ change }) => aiChangeTone(change) === "变差")
    .sort((a, b) => b.change.magnitude - a.change.magnitude)[0];
  if (analysis.intent.wantsNotification && timingRisk) {
    return `建议先复盘 ${timingRisk.item.objectName}：${timingRisk.change.metric} 当前是主要负向点。如果这次迭代是“有触发就推送、没有限制”，需要特别观察展示次数是否上升但点击率或卸载率同步变差。`;
  }
  if (uninstall && aiChangeTone(uninstall) === "变差") {
    return "建议先查卸载率升高来自哪些国家或版本入口，再判断是否和新逻辑触达频率、首日体验压力有关。";
  }
  if (show && click && aiChangeTone(show) === "变好" && aiChangeTone(click) === "变差") {
    return "展示提升但点击下降，说明触达变多不一定带来有效点击，建议拆到通知文案/时机看是否有低意图触发。";
  }
  return "建议继续结合头部国家和专项文案看分化：如果整体正向但个别大国家变差，优先按国家灰度或调整触发限制。";
}

function aiLocalAnalysisKey(analysis) {
  return JSON.stringify({
    project: analysis.project,
    oldVersion: analysis.oldVersion,
    newVersion: analysis.newVersion,
    dates: analysis.dates,
    text: appState.aiIterationText || "",
    directions: aiSelectedDirections(),
  });
}

function aiCompactChange(change) {
  if (!change) return null;
  return {
    metric: change.metric,
    oldValue: formatMetric(change.metric, change.oldValue),
    newValue: formatMetric(change.metric, change.newValue),
    delta: aiFormatDelta(change),
    direction: aiChangeTone(change),
  };
}

function aiCompactCountry(countryItem) {
  if (!countryItem) return null;
  return {
    country: countryItem.country,
    sample: {
      oldUsers: Math.round(countryItem.oldUsers || 0),
      newUsers: Math.round(countryItem.newUsers || 0),
      qualified: !!countryItem.valid,
    },
    positiveMetricCount: countryItem.positive || 0,
    negativeMetricCount: countryItem.negative || 0,
    strongestChange: aiCompactChange(countryItem.strongest),
    metrics: aiCompactChangeList(countryItem.changes || [], 8),
  };
}

function aiCompactTiming(item) {
  if (!item) return null;
  const allChanges = aiSortChangesForList(item.changes || []);
  const rising = allChanges
    .filter((change) => change.delta > 0)
    .slice(0, 3)
    .map(aiCompactChange)
    .filter(Boolean);
  const risks = allChanges
    .filter((change) => aiChangeTone(change) === "变差")
    .slice(0, 3)
    .map(aiCompactChange)
    .filter(Boolean);
  return {
    analysisType: item.analysisType,
    objectName: item.objectName,
    summary: item.summary,
    risingMetrics: rising,
    riskMetrics: risks,
  };
}

function aiCompactFeature(item) {
  if (!item) return null;
  const improved = (item.improved || []).slice(0, 2).map((change) => ({
    object: change.object,
    oldValue: featureValue(change.day, change.oldValue),
    newValue: featureValue(change.day, change.newValue),
    delta: aiFeatureFormatDelta(change),
    direction: "变好",
  }));
  const worsened = (item.worsened || []).slice(0, 2).map((change) => ({
    object: change.object,
    oldValue: featureValue(change.day, change.oldValue),
    newValue: featureValue(change.day, change.newValue),
    delta: aiFeatureFormatDelta(change),
    direction: "变差",
  }));
  return {
    analysisType: item.analysisType,
    improved,
    worsened,
  };
}

function aiBuildOutputPreference(question, intent) {
  const text = String(question || "");
  return {
    wantsTable: /表格|表|差值|具体|明细/i.test(text),
    wantsCause: !!intent?.wantsCauseDiagnosis || /为什么|原因|排查|定位|怎么回事/i.test(text),
    wantsCountryDetail: /国家|地区|美国|印度|墨西哥|巴基斯坦|孟加拉|头部|买量/i.test(text),
    wantsNotificationDetail: !!intent?.wantsNotification,
    wantsFeatureDetail: !!intent?.wantsFeature,
  };
}

function aiBuildDeterministicRules() {
  return [
    "看板代码负责计算指标、加权、差值、方向和缺失；DeepSeek 只负责总结和解释。",
    "新增用户数只作为样本背景，不参与变好或变差判断。",
    "率类和人均类指标跨日期聚合时，已按新增用户数加权平均。",
    "差值口径：项目间对比为第二个项目减第一个项目；版本对比为新版本减旧版本。",
    "卸载率越低越好；留存、授权、展示、点击、转化率通常越高越好。",
    "如果只提到 D0，就只分析 D0 指标；如果只提到 D1，就只分析 D1 指标。",
    "如果用户点名国家、版本、广告组、文案、时机或功能模块，必须优先分析这些对象。",
    "如果用户问国家但没点名，优先看新增用户数靠前的头部国家。",
    "(not set) 默认不作为重点分析对象，除非用户明确点名。",
    "如果 hasData 为 true，不能说对应对象数据缺失；如果 hasData 为 false，必须说明缺失的是哪个对象。",
  ];
}

function aiCompactChangeList(changes, limit = 8) {
  return (changes || []).slice(0, limit).map(aiCompactChange).filter(Boolean);
}

function aiBuildVersionComparisonTableRows(analysis) {
  return (analysis.changes || []).map((change) => ({
    range: "整体",
    metric: change.metric,
    baseObject: `${analysis.project} ${analysis.oldVersion}`,
    baseValue: formatMetric(change.metric, change.oldValue),
    compareObject: `${analysis.project} ${analysis.newVersion}`,
    compareValue: formatMetric(change.metric, change.newValue),
    delta: aiFormatDelta(change),
    judgment: change.metric === "新增用户数"
      ? "样本背景"
      : aiChangeTone(change) === "变好"
      ? "新版本更好"
      : aiChangeTone(change) === "变差"
      ? "旧版本更好"
      : "基本持平",
  })).slice(0, 80);
}

function aiProjectCompareTopCountries(projects, limit = 5) {
  const reportDate = aiLatestReportDate();
  const rows = (dashboardData.main.rows || []).filter((row) =>
    projects.includes(row["项目代号"]) &&
    (!reportDate || row["报表日期"] === reportDate) &&
    row["国家"] &&
    row["国家"] !== "全部" &&
    row["国家"] !== "(not set)" &&
    (!row["版本号"] || row["版本号"] === "全部") &&
    (!row["广告组"] || row["广告组"] === "全部")
  );
  const countryMap = new Map();
  rows.forEach((row) => {
    countryMap.set(row["国家"], (countryMap.get(row["国家"]) || 0) + Number(row["新增用户数"] || 0));
  });
  return [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([country]) => country);
}

function aiBuildLocalAiContext(analysis) {
  const qualityChanges = aiQualityChanges(analysis);
  const improved = qualityChanges.filter((change) => aiChangeTone(change) === "变好");
  const worsened = qualityChanges.filter((change) => aiChangeTone(change) === "变差");
  const diagnosis = aiBuildCauseDiagnosis(analysis);
  const question = String(appState.aiIterationText || "").trim() || "请分析这次版本迭代效果。";
  const outputPreference = aiBuildOutputPreference(question, analysis.intent);
  const recognized = {
    focusDays: analysis.intent.focusDays,
    strictDayFocus: analysis.intent.strictDayFocus,
    focusMetrics: analysis.intent.focusMetrics,
    focusDimensions: analysis.intent.focusDimensions,
    focusDimensionValues: analysis.intent.focusDimensionValues,
    requestedProjects: aiMentionedProjects(analysis.intent.rawText),
    requestedVersions: aiMentionedVersions(analysis.intent.rawText, analysis.project),
    requestedCountries: aiMentionedCountries(analysis.intent),
  };
  const commonScope = {
    reportDate: aiLatestReportDate(),
    selectedDirections: analysis.intent.selectedDirections,
    recognized,
    outputPreference,
    deterministicRules: aiBuildDeterministicRules(),
  };
  const projectCompare = aiBuildProjectCompareContext(analysis);
  if (projectCompare) {
    return {
      question,
      scope: commonScope,
      projectCompare,
    };
  }
  return {
    question,
    scope: {
      ...commonScope,
      project: analysis.project,
      oldVersion: analysis.oldVersion,
      newVersion: analysis.newVersion,
      firstVisitDates: analysis.dates,
    },
    ruleSummary: {
      sample: {
        oldUsers: Math.round(analysis.oldData.aggregated?.["新增用户数"] || 0),
        newUsers: Math.round(analysis.newData.aggregated?.["新增用户数"] || 0),
      },
      improvedMetricCount: improved.length,
      worsenedMetricCount: worsened.length,
      improvedMetrics: aiCompactChangeList(improved, 8),
      worsenedMetrics: aiCompactChangeList(worsened, 8),
      biggestChanges: aiSortChangesByMagnitude(qualityChanges).slice(0, 8).map(aiCompactChange),
      notificationSummary: analysis.notificationSummary,
      recommendation: aiBuildRecommendation(analysis),
    },
    comparisonTableRows: aiBuildVersionComparisonTableRows(analysis),
    topCountries: (analysis.topCountries || []).slice(0, 8).map(aiCompactCountry).filter(Boolean),
    notificationOrTiming: (analysis.timingFocus || []).slice(0, 6).map(aiCompactTiming).filter(Boolean),
    featureModules: (analysis.featureFocus || []).slice(0, 4).map(aiCompactFeature).filter(Boolean),
    causeDiagnosis: {
      conclusion: diagnosis.conclusion,
      evidence: diagnosis.evidence.slice(0, 3),
      nextSteps: diagnosis.nextSteps.slice(0, 2),
      riskCountries: (diagnosis.riskCountries || []).slice(0, 5).map((item) => ({
        country: item.country,
        reasons: item.reasons,
      })),
      focusRisks: (diagnosis.focusRisks || []).slice(0, 3).map((item) => ({
        analysisType: item.item.analysisType,
        objectName: item.item.objectName,
        strongestRisk: aiCompactChange(item.strongestRisk),
      })),
    },
    projectCompare,
  };
}

function aiBuildLocalAiPrompt(context) {
  return `
你是 FR 看板里的中文业务数据分析助手。请只根据下面 JSON 数据回答，不要编造看板里没有的数据。

核心原则：
1. JSON 中的 deterministicRules 是必须遵守的看板口径；不要自行更改差值、方向或缺失判断。
2. 所有 metric.oldValue/newValue/delta/direction 都是看板代码已经计算好的结果，你只能引用和解释。
3. 新增用户数是样本背景，不参与变好/变差判断。
4. 率类和人均类跨日期聚合已经按新增用户数加权，不要重新计算。
5. 卸载率越低越好；留存、授权、展示、点击、转化率通常越高越好。
6. 如果用户问题提到某个指标、国家、版本、广告组、通知文案、通知时机或功能模块，要优先围绕它回答。
7. 如果证据不足，要明确说“当前证据不足”，不要硬下结论。

场景判断：
1. 如果 projectCompare 不为空，说明用户正在做项目间对比，请优先回答 projectCompare 里的两个项目差异，不要改成版本迭代分析。
2. 如果 projectCompare.countryComparisons 有内容，必须单独分析这些国家；hasData 为 true 的国家不能说数据缺失。
3. 如果 recognized.focusDays 里只有 D0，且 strictDayFocus 为 true，只分析 D0 指标，不要额外展开 D1 或 D3。
4. 如果 recognized.focusDays 里只有 D1，且 strictDayFocus 为 true，只分析 D1 指标，不要额外展开 D0。
5. 如果用户问“为什么/原因/排查”，要按证据链组织：整体指标 → 头部国家 → 通知文案/时机 → 功能模块 → 可能原因 → 建议动作。
6. 如果 notificationOrTiming 有内容，且用户提到通知、推送、文案、时机、安装或卸载，必须引用专项数据。
7. 如果 featureModules 有内容，且用户提到功能、模块、流程、首次启动或漏斗，必须引用功能模块数据。
8. 如果 projectCompare.featureProjectCompare.hasData 为 true，且用户提到功能、模块、流程、首次启动或漏斗，必须优先回答功能模块差异；公共通知指标只能作为补充背景，不能作为主要答案。

输出要求：
1. 用中文自然段输出，不要输出 JSON。
2. 先用 1 句话直接回答用户问题。
3. 再分为“主要差异”“重点风险”“可能原因”“建议动作”四段，每段最多 3 条。
4. 如果用户要求表格、差值、具体明细，或 scope.outputPreference.wantsTable / projectCompare.outputPreference.wantsTable 为 true，必须先输出 Markdown 表格，不要只用文字。
5. 表格至少包含：范围/国家、指标、${context.projectCompare?.baseProject || "旧对象"}、${context.projectCompare?.compareProject || "新对象"}、差值、判断。
6. 如果 projectCompare.comparisonTableRows 或 comparisonTableRows 有内容，表格优先使用这些行，不要自己重新计算。
7. 如果有多个国家，表格必须包含每个国家的行，不能只给整体。
8. notification_risers 必须优先使用 notificationOrTiming.risingMetrics。
9. 表格不要放进代码块。
10. Markdown 表格必须一行一条记录，不要把整张表压成一行，也不要用“||”连接多行。
11. 如果使用 1、2、3 分点，每一点必须单独换行，不要把多个编号写在同一行。
12. 不要半句话结束。
13. 绝对不要输出 JSON、数组或字段名式结构。

JSON 数据：
${JSON.stringify(context)}
`.trim();
}

function aiFormatLocalJsonList(items) {
  return Array.isArray(items)
    ? items.filter(Boolean).map((item) => `- ${item}`).join("\n")
    : "";
}

function aiFormatAnyLocalItem(item) {
  if (item === null || item === undefined) return "";
  if (typeof item === "string") return item;
  if (typeof item !== "object") return String(item);
  if (item.metric || item.oldValue || item.newValue || item.delta || item.direction) {
    const pieces = [
      item.metric,
      item.oldValue !== undefined || item.newValue !== undefined ? `${item.oldValue ?? "NA"} → ${item.newValue ?? "NA"}` : "",
      item.delta,
      item.direction,
    ].filter(Boolean);
    return pieces.join("，");
  }
  if (item.country) {
    const sample = item.sample
      ? `样本 ${Number(item.sample.oldUsers || 0).toLocaleString("zh-CN")} → ${Number(item.sample.newUsers || 0).toLocaleString("zh-CN")}${item.sample.qualified === false ? "，样本偏少" : ""}`
      : "";
    const strongest = item.strongestChange ? `变化最大：${aiFormatAnyLocalItem(item.strongestChange)}` : "";
    const counts = item.positiveMetricCount !== undefined || item.negativeMetricCount !== undefined
      ? `变好 ${item.positiveMetricCount || 0} 个，变差 ${item.negativeMetricCount || 0} 个`
      : "";
    return [item.country, sample, counts, strongest].filter(Boolean).join("；");
  }
  if (item.mainAction || item.specificActions) {
    return [item.mainAction, ...(Array.isArray(item.specificActions) ? item.specificActions : [])].filter(Boolean).join("；");
  }
  return Object.entries(item)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.map(aiFormatAnyLocalItem).join("、") : aiFormatAnyLocalItem(value)}`)
    .join("；");
}

function aiFormatAnyLocalList(items) {
  return Array.isArray(items)
    ? items.map(aiFormatAnyLocalItem).filter(Boolean).map((item) => `- ${item}`).join("\n")
    : "";
}

function aiSectionBlock(title, body, tone = "normal") {
  if (!body) return "";
  const palette = {
    answer: "border-color:rgba(37,99,235,0.22);background:linear-gradient(135deg,rgba(37,99,235,0.08),rgba(255,255,255,0.96));",
    good: "border-color:rgba(15,118,110,0.20);background:rgba(15,118,110,0.06);",
    risk: "border-color:rgba(180,83,9,0.22);background:rgba(245,158,11,0.08);",
    normal: "border-color:rgba(86,102,115,0.14);background:#fff;",
  };
  return `
    <section style="border:1px solid rgba(86,102,115,0.14); ${palette[tone] || palette.normal} border-radius:18px; padding:18px 20px;">
      <div class="eyebrow" style="font-size:12px; letter-spacing:0; margin-bottom:8px;">${escapeAttr(title)}</div>
      <div style="white-space:pre-wrap; line-height:1.85; color:var(--ink);">${escapeAttr(body)}</div>
    </section>
  `;
}

function aiFormatLocalAiJson(parsed) {
  const sections = [];
  if (parsed.direct_answer) {
    sections.push(aiSectionBlock("直接结论", parsed.direct_answer, "answer"));
  }
  const overall = aiFormatAnyLocalList(parsed.overall);
  if (overall) {
    sections.push(aiSectionBlock("整体指标", overall, "normal"));
  }
  const risers = aiFormatAnyLocalList(parsed.notification_risers);
  if (risers) {
    sections.push(aiSectionBlock("上涨的文案/时机", risers, "good"));
  }
  if (parsed.retention_explanation) {
    sections.push(aiSectionBlock("留存解释", parsed.retention_explanation, "risk"));
  }
  const countryItems = parsed.country_signals || parsed.topCountries || parsed.top_countries || [];
  const countries = aiFormatAnyLocalList(countryItems);
  if (countries) {
    sections.push(aiSectionBlock("头部国家", countries, "normal"));
  }
  const recommendationItems = parsed.next_actions
    || parsed.nextActions
    || (parsed.recommendations
      ? [parsed.recommendations.mainAction].concat(parsed.recommendations.specificActions || []).filter(Boolean)
      : []);
  const actions = aiFormatAnyLocalList(recommendationItems);
  if (actions) {
    sections.push(aiSectionBlock("建议动作", actions, "answer"));
  }
  if (!sections.length) {
    return `<div data-ai-formatted="1" style="white-space:pre-wrap; line-height:1.9;">${escapeAttr(JSON.stringify(parsed, null, 2))}</div>`;
  }
  return `<div data-ai-formatted="1" style="display:grid; gap:14px;">${sections.join("")}</div>`;
}

function aiParseLocalAiJsonContent(content) {
  const raw = String(content || "").trim();
  const withoutFence = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFence.slice(firstBrace, lastBrace + 1)
    : withoutFence;
  const cleaned = jsonText
    .replace(/\\_/g, "_")
    .replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(cleaned);
}

function aiDedupeLocalText(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  const parts = raw
    .split(/(?<=。)|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const seen = new Set();
  const deduped = [];
  parts.forEach((part) => {
    const key = aiNormalizeText(part);
    if (!key || seen.has(key)) return;
    seen.add(key);
    deduped.push(part);
  });
  return deduped.join("\n");
}

function aiReadDeepSeekApiKey() {
  if (appState.aiDeepSeekApiKey) return appState.aiDeepSeekApiKey;
  if (window.FR_DEEPSEEK_API_KEY) return String(window.FR_DEEPSEEK_API_KEY || "").trim();
  try {
    return window.localStorage.getItem("frDeepSeekApiKey") || "";
  } catch (error) {
    return "";
  }
}

function aiSaveDeepSeekApiKey(value) {
  const key = String(value || "").trim();
  if (!key) return;
  appState.aiDeepSeekApiKey = key;
  try {
    window.localStorage.setItem("frDeepSeekApiKey", key);
  } catch (error) {}
}

function aiRenderDeepSeekKeyInput() {
  const hasKey = !!aiReadDeepSeekApiKey();
  return `
    <label style="display:block; margin:0;">
      <span class="label-row" style="margin-bottom:8px;"><span>DeepSeek API Key</span></span>
      <input
        id="ai-deepseek-key"
        type="password"
        placeholder="${hasKey ? "已保存，可留空继续使用" : "请输入 DeepSeek API Key"}"
        autocomplete="off"
        style="width:100%; border:1px solid rgba(86,102,115,0.18); border-radius:14px; padding:12px 14px; font:inherit; background:#fff; min-height:46px;"
      />
    </label>
  `;
}

function aiTopChangedText(changes, limit = 3) {
  return aiSortChangesByMagnitude(changes)
    .slice(0, limit)
    .map((change) => `${change.metric}：${formatMetric(change.metric, change.oldValue)} → ${formatMetric(change.metric, change.newValue)}（${aiFormatDelta(change)}，${aiChangeTone(change)}）`)
    .join("；");
}

function aiShouldUseProjectCompare(analysis) {
  const text = String(analysis.intent.rawText || "");
  const projects = aiMentionedProjects(text);
  return projects.length >= 2 && /对比|比较|差距|差异|表现|所有数据|全部数据/i.test(text);
}

function aiProjectCompareMetrics(intent) {
  const allMetrics = sortCompareMetrics((dashboardData.main.metrics || []).filter((metric) =>
    COMPARE_METRICS.includes(metric)
  ));
  const focusedDayMetrics = aiFocusedDayMetrics(intent?.focusDays || []).filter((metric) => allMetrics.includes(metric));
  if (intent?.strictDayFocus && focusedDayMetrics.length) {
    return uniqueArray(["新增用户数"].concat(focusedDayMetrics));
  }
  const wantsAll = /所有|全部|全量|all/i.test(intent.rawText || "");
  if (wantsAll || !(intent.focusMetrics || []).length) {
    return allMetrics;
  }
  return uniqueArray(["新增用户数"].concat(intent.focusMetrics)).filter((metric) => allMetrics.includes(metric));
}

function aiProjectCompareResultHtml(params) {
  const {
    baseProject,
    compareProject,
    country,
    dates,
    changes,
    usersChange,
    compareBetter,
    baseBetter,
    strongest,
  } = params;
  const qualityChanges = changes.filter((change) => change.metric !== "新增用户数");
  const compareBetterCount = compareBetter.length;
  const baseBetterCount = baseBetter.length;
  const directConclusion = compareBetterCount > baseBetterCount
    ? `${compareProject} 在质量指标上整体更占优，但仍需重点确认弱项。`
    : baseBetterCount > compareBetterCount
    ? `${baseProject} 在质量指标上整体更占优，${compareProject} 的部分指标需要关注。`
    : `两个项目整体表现比较接近，建议优先看差距最大的指标。`;
  const topGapText = strongest.length
    ? strongest.slice(0, 3).map((change) =>
      `${change.metric}：${compareProject} 相对 ${baseProject} ${aiFormatDelta(change)}，${aiChangeTone(change)}`
    ).join("；")
    : "当前质量指标差距不明显。";
  const metricRows = changes.map((change) => {
    const tone = aiChangeTone(change);
    const winner = change.metric === "新增用户数"
      ? "样本规模"
      : tone === "变好"
      ? `${compareProject} 更好`
      : tone === "变差"
      ? `${baseProject} 更好`
      : "基本持平";
    const toneStyle = change.metric === "新增用户数"
      ? "background:rgba(37,99,235,0.08);color:var(--accent);"
      : tone === "变好"
      ? "background:rgba(15,118,110,0.10);color:#0f766e;"
      : tone === "变差"
      ? "background:rgba(245,158,11,0.14);color:#92400e;"
      : "background:rgba(86,102,115,0.08);color:var(--muted);";
    return `
      <tr>
        <td style="font-weight:800;">${escapeAttr(change.metric)}</td>
        <td>${escapeAttr(formatMetric(change.metric, change.oldValue))}</td>
        <td>${escapeAttr(formatMetric(change.metric, change.newValue))}</td>
        <td style="font-weight:800;">${escapeAttr(aiFormatDelta(change))}</td>
        <td><span style="display:inline-flex; border-radius:999px; padding:5px 10px; font-weight:800; ${toneStyle}">${escapeAttr(winner)}</span></td>
      </tr>
    `;
  }).join("");
  const listBlock = (title, items, emptyText, tone) => {
    const color = tone === "good" ? "#0f766e" : "#92400e";
    const bg = tone === "good" ? "rgba(15,118,110,0.06)" : "rgba(245,158,11,0.08)";
    const border = tone === "good" ? "rgba(15,118,110,0.18)" : "rgba(245,158,11,0.22)";
    return `
      <section style="border:1px solid ${border}; border-radius:18px; padding:18px 20px; background:${bg};">
        <div class="eyebrow" style="font-size:12px; letter-spacing:0; color:${color};">${escapeAttr(title)}</div>
        <h4 style="margin:8px 0 12px; font-size:20px;">${items.length ? `${items.length} 个指标` : "暂无明显指标"}</h4>
        <div style="display:grid; gap:9px;">
          ${items.length ? aiSortChangesForList(items).slice(0, 8).map((change) => `
            <div style="display:flex; justify-content:space-between; gap:12px; border-top:1px solid rgba(86,102,115,0.10); padding-top:9px;">
              <strong>${escapeAttr(change.metric)}</strong>
              <span>${escapeAttr(aiFormatDelta(change))}</span>
            </div>
          `).join("") : `<p class="muted" style="margin:0;">${escapeAttr(emptyText)}</p>`}
        </div>
      </section>
    `;
  };
  return `
    <div data-ai-formatted="1" style="display:grid; gap:18px;">
      <section style="border:1px solid rgba(37,99,235,0.20); border-radius:20px; padding:20px 22px; background:linear-gradient(135deg,rgba(37,99,235,0.08),rgba(255,255,255,0.96));">
        <div class="eyebrow" style="font-size:12px; letter-spacing:0;">直接结论</div>
        <h3 style="margin:8px 0 10px; font-size:23px;">${escapeAttr(directConclusion)}</h3>
        <p class="muted" style="margin:0; line-height:1.75;">
          口径：${escapeAttr(baseProject)} vs ${escapeAttr(compareProject)} / ${escapeAttr(country)} / ${escapeAttr(dates.join("、") || "无日期")}。
          ${usersChange ? `新增用户：${escapeAttr(baseProject)} ${escapeAttr(formatMetric(usersChange.metric, usersChange.oldValue))}，${escapeAttr(compareProject)} ${escapeAttr(formatMetric(usersChange.metric, usersChange.newValue))}，差值 ${escapeAttr(aiFormatDelta(usersChange))}。` : ""}
        </p>
        <p style="margin:12px 0 0; line-height:1.75;"><strong>最大差距：</strong>${escapeAttr(topGapText)}</p>
      </section>
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px;">
        ${listBlock(`${compareProject} 更好的指标`, compareBetter, "暂未看到明显领先项。", "good")}
        ${listBlock(`${baseProject} 更好的指标`, baseBetter, "暂未看到明显领先项。", "risk")}
      </div>
      <section style="border:1px solid rgba(86,102,115,0.14); border-radius:20px; padding:18px 20px; background:#fff;">
        <div class="eyebrow" style="font-size:12px; letter-spacing:0;">所有指标对比表</div>
        <p class="muted" style="margin:6px 0 14px;">率类和人均类已按新增用户数加权；卸载率越低越好，其他质量指标通常越高越好。</p>
        <div class="table-wrap">
          <table class="metric-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>${escapeAttr(baseProject)}</th>
                <th>${escapeAttr(compareProject)}</th>
                <th>差值</th>
                <th>结论</th>
              </tr>
            </thead>
            <tbody>${metricRows}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function aiBuildFastProjectCompareAnswer(analysis) {
  if (!aiShouldUseProjectCompare(analysis)) return "";
  const projects = aiMentionedProjects(analysis.intent.rawText).slice(0, 2);
  const [baseProject, compareProject] = projects;
  const country = aiMentionedCountry(analysis.intent);
  const dates = aiProjectCompareDates(projects, country);
  const metrics = aiProjectCompareMetrics(analysis.intent);
  const baseData = aiAggregateProject(baseProject, dates, country, metrics);
  const compareData = aiAggregateProject(compareProject, dates, country, metrics);
  if (!baseData.aggregated || !compareData.aggregated) {
    return [
      "直接结论：当前筛选口径下没有足够数据完成这次项目对比。",
      `已识别项目：${projects.join(" vs ")}；国家：${country}；日期：${dates.join("、") || "无可用日期"}。`,
      "建议先确认这两个项目在最新报表日期里是否都有该国家、全部版本、全部广告组的数据。"
    ].join("\n\n");
  }
  const changes = metrics.map((metric) =>
    aiMetricChange(metric, baseData.aggregated?.[metric], compareData.aggregated?.[metric])
  ).filter(Boolean);
  const qualityChanges = changes.filter((change) => change.metric !== "新增用户数" && Math.abs(change.delta) >= 0.0001);
  const compareBetter = qualityChanges.filter((change) => aiChangeTone(change) === "变好");
  const baseBetter = qualityChanges.filter((change) => aiChangeTone(change) === "变差");
  const strongest = aiSortChangesByMagnitude(qualityChanges).slice(0, 6);
  const usersChange = changes.find((change) => change.metric === "新增用户数");
  return aiProjectCompareResultHtml({
    baseProject,
    compareProject,
    country,
    dates,
    changes,
    usersChange,
    compareBetter,
    baseBetter,
    strongest,
  });
}

function aiBuildProjectComparisonSlice(baseProject, compareProject, country, metrics) {
  const dates = aiProjectCompareDates([baseProject, compareProject], country);
  const baseData = aiAggregateProject(baseProject, dates, country, metrics);
  const compareData = aiAggregateProject(compareProject, dates, country, metrics);
  const changes = metrics.map((metric) =>
    aiMetricChange(metric, baseData.aggregated?.[metric], compareData.aggregated?.[metric])
  ).filter(Boolean);
  const qualityChanges = changes.filter((change) => change.metric !== "新增用户数" && Math.abs(change.delta) >= 0.0001);
  return {
    country,
    dates,
    hasData: !!baseData.aggregated && !!compareData.aggregated,
    sample: {
      baseUsers: Math.round(baseData.aggregated?.["新增用户数"] || 0),
      compareUsers: Math.round(compareData.aggregated?.["新增用户数"] || 0),
    },
    metrics: changes.map(aiCompactChange).filter(Boolean),
    tableRows: changes.map((change) => ({
      range: country === "全部" ? "整体" : country,
      metric: change.metric,
      baseObject: baseProject,
      baseValue: formatMetric(change.metric, change.oldValue),
      compareObject: compareProject,
      compareValue: formatMetric(change.metric, change.newValue),
      delta: aiFormatDelta(change),
      judgment: change.metric === "新增用户数"
        ? "样本背景"
        : aiChangeTone(change) === "变好"
        ? `${compareProject} 更好`
        : aiChangeTone(change) === "变差"
        ? `${baseProject} 更好`
        : "基本持平",
    })),
    compareProjectBetter: aiSortChangesForList(qualityChanges.filter((change) => aiChangeTone(change) === "变好"))
      .slice(0, 8)
      .map(aiCompactChange)
      .filter(Boolean),
    baseProjectBetter: aiSortChangesForList(qualityChanges.filter((change) => aiChangeTone(change) === "变差"))
      .slice(0, 8)
      .map(aiCompactChange)
      .filter(Boolean),
  };
}

function aiBuildProjectCompareContext(analysis) {
  if (!aiShouldUseProjectCompare(analysis)) return null;
  const projects = aiMentionedProjects(analysis.intent.rawText).slice(0, 2);
  const [baseProject, compareProject] = projects;
  const metrics = aiProjectCompareMetrics(analysis.intent);
  const outputPreference = aiBuildOutputPreference(analysis.intent.rawText, analysis.intent);
  const requestedCountries = aiMentionedCountries(analysis.intent);
  const primaryCountry = requestedCountries.length === 1 ? requestedCountries[0] : "全部";
  const overall = aiBuildProjectComparisonSlice(baseProject, compareProject, primaryCountry, metrics);
  const countrySeeds = requestedCountries.length
    ? requestedCountries
    : outputPreference.wantsCountryDetail
    ? aiProjectCompareTopCountries(projects, 5)
    : [];
  const countryComparisons = uniqueArray(countrySeeds)
    .filter((country) => country !== "全部")
    .map((country) => aiBuildProjectComparisonSlice(baseProject, compareProject, country, metrics));
  const featureProjectCompare = aiBuildFeatureProjectCompareContext(
    baseProject,
    compareProject,
    overall.dates,
    requestedCountries,
    analysis.intent
  );
  const commonMetricTableRows = [overall].concat(countryComparisons)
    .flatMap((item) => item.tableRows || [])
    .slice(0, 80);
  const preferredTableRows = featureProjectCompare?.hasData && analysis.intent.wantsFeature
    ? featureProjectCompare.comparisonTableRows
    : commonMetricTableRows;
  return {
    taskType: "项目间对比",
    baseProject,
    compareProject,
    country: primaryCountry,
    dates: overall.dates,
    requestedCountries,
    outputPreference,
    focusDays: analysis.intent.focusDays || [],
    strictDayFocus: !!analysis.intent.strictDayFocus,
    metrics: overall.metrics,
    compareProjectBetter: overall.compareProjectBetter,
    baseProjectBetter: overall.baseProjectBetter,
    countryComparisons,
    featureProjectCompare,
    commonMetricTableRows,
    comparisonTableRows: preferredTableRows,
  };
}

function aiBuildFastNotificationAnswer(analysis) {
  if (!analysis.intent.wantsNotification) return "";
  const notificationChanges = aiQualityChanges(analysis)
    .filter((change) => aiNotificationMetrics(analysis.intent).includes(change.metric));
  const notificationUp = notificationChanges.filter((change) => change.delta > 0);
  const notificationRisk = notificationChanges.filter((change) => aiChangeTone(change) === "变差");
  const retention = aiChangeByMetric(analysis.changes, "D1留存率");
  const uninstall = aiChangeByMetric(analysis.changes, "卸载率_D0");
  const riserItems = (analysis.timingFocus || [])
    .map((item) => {
      const rising = aiSortChangesByMagnitude((item.changes || []).filter((change) => change.delta > 0))[0] || null;
      const risk = aiSortChangesByMagnitude((item.changes || []).filter((change) => aiChangeTone(change) === "变差"))[0] || null;
      return {
        item,
        rising,
        risk,
        score: (rising?.magnitude || 0) + (item.analysisType === "通知文案" ? 1 : 0),
      };
    })
    .filter((entry) => entry.rising)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const countryRisks = (analysis.topCountries || [])
    .filter((item) => item.valid && item.negative >= item.positive)
    .slice(0, 4);
  const sections = [];
  sections.push(`直接结论：新版本通知指标确实整体上涨，但 D1 留存没有同步上涨；目前更像是触达变强带来了更多展示/点击，而不是带来了更高质量的次日回访。`);
  sections.push(`整体通知指标：${notificationUp.length ? aiTopChangedText(notificationUp, 4) : "当前没有明显上涨的通知指标"}。${notificationRisk.length ? `同时要注意 ${aiTopChangedText(notificationRisk, 2)}。` : ""}`);
  sections.push(`上涨的文案/时机：${riserItems.length ? riserItems.map((entry) => `${entry.item.analysisType}-${entry.item.objectName} 的 ${entry.rising.metric} 从 ${formatMetric(entry.rising.metric, entry.rising.oldValue)} 涨到 ${formatMetric(entry.rising.metric, entry.rising.newValue)}（${aiFormatDelta(entry.rising)}）`).join("；") : "当前没有找到可稳定点名的文案/时机上涨项"}。`);
  sections.push(`为什么留存没涨：${retention ? `D1留存从 ${formatMetric(retention.metric, retention.oldValue)} 到 ${formatMetric(retention.metric, retention.newValue)}（${aiFormatDelta(retention)}，${aiChangeTone(retention)}）` : "D1留存当前缺少可比数据"}；${uninstall ? `同时卸载率从 ${formatMetric(uninstall.metric, uninstall.oldValue)} 到 ${formatMetric(uninstall.metric, uninstall.newValue)}（${aiFormatDelta(uninstall)}，${aiChangeTone(uninstall)}），说明新增触达可能有一定打扰成本。` : "当前卸载率证据不足。"}`);
  sections.push(`头部国家：${countryRisks.length ? countryRisks.map((item) => `${item.country} 有 ${item.negative} 个风险指标`).join("；") : "头部国家暂时没有明显负向集中"}，建议优先看这些国家里上涨文案是否同时带来卸载率或 D1 留存压力。`);
  sections.push(`建议动作：先把上涨最明显的安装/卸载类文案拆出来看展示次数、点击率和点击转化率是否同步提升；如果只是展示和点击变多但留存不涨，优先加频控、冷却时间或按国家灰度回退。`);
  return sections.join("\n\n");
}

function aiShouldUseFastAnswer(analysis) {
  const text = String(analysis.intent.rawText || "");
  return analysis.intent.wantsNotification && (/留存|D1|文案|哪些|为什么|原因|没涨|没有提升/i.test(text) || analysis.intent.wantsCauseDiagnosis);
}

function aiProviderInfo(mode) {
  if (mode === "deepseek") {
    return {
      providerName: "DeepSeek",
      statusSuccess: "DeepSeek 总结",
      statusError: "DeepSeek 暂不可用",
      loadingText: "正在调用 DeepSeek 生成总结，通常需要几秒到十几秒。",
      idleText: "点击“立即分析”后，会直接调用 DeepSeek；如果还没填写 API Key，请先在上方输入并保存。",
      title: "基于当前筛选和问题的 DeepSeek 分析",
      pill: "DeepSeek 分析",
      errorPrefix: "DeepSeek 调用失败",
    };
  }
  return {
    providerName: "AI",
    statusSuccess: "AI 总结",
    statusError: "AI 暂不可用",
    loadingText: "正在生成总结，通常需要几秒到十几秒。",
    idleText: "点击“立即分析”后，会根据当前筛选生成总结。",
    title: "基于当前筛选和问题的 AI 分析",
    pill: "AI 分析",
    errorPrefix: "AI 调用失败",
  };
}

function aiParseMarkdownTableLine(line) {
  const text = String(line || "").trim();
  if (!text.includes("|")) return null;
  const cells = text
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
  return cells.length >= 2 ? cells : null;
}

function aiIsMarkdownTableDivider(line) {
  const cells = aiParseMarkdownTableLine(line);
  return !!cells && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, "")));
}

function aiRenderInlineMarkdown(text) {
  return escapeAttr(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function aiRenderPlainTextBlock(lines) {
  const html = [];
  let paragraph = [];
  let listItems = [];
  let orderedItems = [];
  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) {
      html.push(`<p style="margin:0 0 18px; line-height:1.9; font-size:17px; color:var(--ink);">${aiRenderInlineMarkdown(text)}</p>`);
    }
    paragraph = [];
  };
  const flushOrderedList = () => {
    if (orderedItems.length) {
      html.push(`
        <ol style="margin:4px 0 24px 0; padding-left:0; list-style:none; display:grid; gap:14px; counter-reset:ai-step;">
          ${orderedItems.map((item) => `
            <li style="counter-increment:ai-step; position:relative; padding-left:38px; line-height:1.85; font-size:16px; color:var(--ink);">
              <span style="position:absolute; left:0; top:0.32em; width:26px; height:26px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; background:rgba(37,99,235,0.10); color:var(--accent); font-weight:900; font-size:13px;">${item.index}</span>
              ${aiRenderInlineMarkdown(item.text)}
            </li>
          `).join("")}
        </ol>
      `);
    }
    orderedItems = [];
  };
  const flushList = () => {
    if (listItems.length) {
      html.push(`
        <ul style="margin:4px 0 22px 0; padding:0; list-style:none; display:grid; gap:12px;">
          ${listItems.map((item) => `
            <li style="position:relative; padding-left:22px; line-height:1.85; font-size:16px; color:var(--ink);">
              <span style="position:absolute; left:0; top:0.72em; width:7px; height:7px; border-radius:999px; background:rgba(37,99,235,0.72);"></span>
              ${aiRenderInlineMarkdown(item)}
            </li>
          `).join("")}
        </ul>
      `);
    }
    listItems = [];
  };
  const flushLists = () => {
    flushOrderedList();
    flushList();
  };
  lines.forEach((line) => {
    const text = String(line || "").trim();
    if (!text) {
      flushParagraph();
      flushLists();
      return;
    }
    const headingMatch = text.match(/^\*\*([^*]+)\*\*[:：]?$/) || text.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushLists();
      html.push(`<h4 style="margin:24px 0 12px; font-size:19px; line-height:1.5; font-weight:900; color:var(--accent);">${escapeAttr(headingMatch[1])}</h4>`);
      return;
    }
    const bulletMatch = text.match(/^[-*]\s*(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      flushOrderedList();
      listItems.push(bulletMatch[1]);
      return;
    }
    const orderedMatches = [...text.matchAll(/(?:^|\s)(\d+)[.、]\s+(.+?)(?=\s+\d+[.、]\s+|$)/g)];
    if (orderedMatches.length >= 2 || (orderedMatches.length === 1 && text.match(/^\d+[.、]\s+/))) {
      flushParagraph();
      flushList();
      orderedMatches.forEach((match) => {
        orderedItems.push({ index: match[1], text: match[2].trim() });
      });
      return;
    }
    flushLists();
    paragraph.push(text);
  });
  flushParagraph();
  flushLists();
  return html.filter(Boolean).join("");
}

function aiRenderMarkdownTable(headers, rows) {
  if (!headers.length || !rows.length) return "";
  return `
    <div class="table-wrap" style="margin:10px 0 24px; overflow:auto;">
      <table class="metric-table">
        <thead>
          <tr>${headers.map((cell) => `<th style="white-space:nowrap;">${aiRenderInlineMarkdown(cell)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>${headers.map((_, index) => `<td style="min-width:120px; vertical-align:top;">${aiRenderInlineMarkdown(row[index] || "")}</td>`).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function aiNormalizeFlattenedMarkdownTables(text) {
  const raw = String(text || "");
  const tableStart = raw.search(/\|\s*(范围|国家|对象|指标|分析类型)\s*\|/);
  if (tableStart < 0) {
    return raw;
  }
  const prefix = raw.slice(0, tableStart).trim();
  const rest = raw.slice(tableStart).trim();
  const suffixMatch = rest.match(/\s+(?=(?:\*\*|#{1,4}\s*)?(主要差异|重点风险|可能原因|建议动作|总结|结论)(?:\*\*)?[:：]?)/);
  const tableText = suffixMatch ? rest.slice(0, suffixMatch.index).trim() : rest;
  const suffix = suffixMatch ? rest.slice(suffixMatch.index).trim() : "";
  const parts = tableText.includes("||")
    ? tableText.split(/\s*\|\|\s*/).map((part) => part.trim()).filter(Boolean)
    : [];
  const allCells = tableText
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);
  let headers = parts.length ? aiParseMarkdownTableLine(parts[0]) : [];
  if (!headers.length) {
    const terminalHeaderIndex = allCells.findIndex((cell) => ["判断", "方向"].includes(cell));
    const deltaHeaderIndex = allCells.findIndex((cell) => cell === "差值" || cell === "变化");
    const width = terminalHeaderIndex >= 0
      ? terminalHeaderIndex + 1
      : deltaHeaderIndex >= 0
      ? Math.min(deltaHeaderIndex + 2, allCells.length)
      : 0;
    headers = width ? allCells.slice(0, width) : [];
  }
  if (!headers || !headers.some((cell) => cell.includes("指标") || cell.includes("范围") || cell.includes("国家"))) {
    return raw;
  }
  let rows = parts.length
    ? parts.slice(1).map(aiParseMarkdownTableLine).filter((row) => row && row.length >= 2)
    : [];
  if (!rows.length) {
    const width = headers.length;
    const bodyCells = allCells.slice(width);
    if (width >= 3 && bodyCells.length >= width) {
      rows = [];
      for (let index = 0; index + width <= bodyCells.length; index += width) {
        rows.push(bodyCells.slice(index, index + width));
      }
    }
  }
  if (!rows.length) return raw;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const normalizedTable = [
    `| ${headers.join(" | ")} |`,
    divider,
    ...rows.map((row) => `| ${headers.map((_, index) => row[index] || "").join(" | ")} |`),
  ].join("\n");
  return [prefix, normalizedTable, suffix].filter(Boolean).join("\n\n");
}

function aiRenderTextWithMarkdownTables(text) {
  const lines = aiNormalizeFlattenedMarkdownTables(text).split(/\r?\n/);
  const blocks = [];
  let buffer = [];
  for (let index = 0; index < lines.length; index += 1) {
    const headers = aiParseMarkdownTableLine(lines[index]);
    if (headers && aiIsMarkdownTableDivider(lines[index + 1] || "")) {
      blocks.push(aiRenderPlainTextBlock(buffer));
      buffer = [];
      index += 2;
      const rows = [];
      while (index < lines.length) {
        const row = aiParseMarkdownTableLine(lines[index]);
        if (!row) {
          index -= 1;
          break;
        }
        rows.push(row);
        index += 1;
      }
      blocks.push(aiRenderMarkdownTable(headers, rows));
      continue;
    }
    buffer.push(lines[index]);
  }
  blocks.push(aiRenderPlainTextBlock(buffer));
  return `<div style="display:grid; gap:8px; max-width:1320px;">${blocks.filter(Boolean).join("")}</div>`;
}

function aiRenderLocalAiPanel(analysis, mode = "deepseek") {
  const currentKey = aiLocalAnalysisKey(analysis);
  const isStale = appState.aiLocalRequestKey && appState.aiLocalRequestKey !== currentKey;
  const status = isStale ? "stale" : appState.aiLocalStatus;
  const provider = aiProviderInfo(mode);
  const statusLabel = {
    idle: "待生成",
    loading: "正在分析",
    success: provider.statusSuccess,
    error: provider.statusError,
    stale: "条件已变化",
  }[status] || "待生成";
  const body = (() => {
    if (status === "loading") {
      return `<div class="empty-state">${provider.loadingText}</div>`;
    }
    if (status === "success" && appState.aiLocalAnswer) {
      if (String(appState.aiLocalAnswer).includes("data-ai-formatted")) {
        return appState.aiLocalAnswer;
      }
      return aiRenderTextWithMarkdownTables(appState.aiLocalAnswer);
    }
    if (status === "error") {
      return `
        <div class="empty-state">
          ${provider.errorPrefix}：${escapeAttr(appState.aiLocalError || "未知错误")}<br/>
          请检查 API Key、网络或稍后重试。
        </div>
      `;
    }
    if (status === "stale") {
      return `<div class="empty-state">你已经修改了项目、版本、日期或问题，点击“立即分析”后会重新生成 AI 总结。</div>`;
    }
    return `<div class="empty-state">${provider.idleText}</div>`;
  })();
  return `
    <div style="border:2px solid rgba(37,99,235,0.18); border-radius:24px; padding:24px 28px; margin:0 0 28px; background:linear-gradient(135deg, rgba(37,99,235,0.08), rgba(255,255,255,0.96)); box-shadow:0 18px 42px rgba(15,23,42,0.06);">
      <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:16px;">
        <div>
          <div class="eyebrow">${statusLabel}</div>
          <h3 style="margin:8px 0 0; font-size:24px; line-height:1.45;">${provider.title}</h3>
        </div>
        <span class="pill">${provider.pill}</span>
      </div>
      ${body}
    </div>
  `;
}

async function aiRunDeepSeekAnalysis(analysis, requestKey) {
  const apiKey = aiReadDeepSeekApiKey();
  const context = aiBuildLocalAiContext(analysis);
  const prompt = aiBuildLocalAiPrompt(context);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 120000);
  try {
    if (!apiKey) {
      throw new Error("还没有填写 DeepSeek API Key。");
    }
    const response = await fetch(DEEPSEEK_AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEEPSEEK_AI_MODEL,
        stream: false,
        temperature: 0.25,
        max_tokens: 2600,
        thinking: { type: "disabled" },
        messages: [
          {
            role: "system",
            content: "你是严谨的中文业务数据分析助手。只能基于输入数据分析，不能编造指标、国家、版本或项目。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content?.trim();
    let answer = content;
    try {
      const parsed = aiParseLocalAiJsonContent(content);
      answer = aiFormatLocalAiJson(parsed);
    } catch (parseError) {
      answer = /^\s*[{[]/.test(String(content || ""))
        ? "模型返回了不完整的结构化结果，暂时无法展示成分析卡片。建议点击重新分析，或把问题写得更具体一些。"
        : aiDedupeLocalText(content);
    }
    if (!answer) {
      throw new Error("DeepSeek 没有返回正文，请稍后重试。");
    }
    if (appState.aiLocalRequestKey === requestKey) {
      appState.aiLocalStatus = "success";
      appState.aiLocalAnswer = answer;
      appState.aiLocalError = "";
      rerender();
    }
  } catch (error) {
    if (appState.aiLocalRequestKey === requestKey) {
      appState.aiLocalStatus = "error";
      appState.aiLocalAnswer = "";
      appState.aiLocalError = error?.name === "AbortError"
        ? "DeepSeek 分析超过 120 秒，建议减少分析方向后再试。"
        : (error?.message || String(error));
      rerender();
    }
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function aiRunLocalAnalysis(analysis, requestKey) {
  if (appState.aiAnalysisMode === "deepseek") {
    return aiRunDeepSeekAnalysis(analysis, requestKey);
  }
  const context = aiBuildLocalAiContext(analysis);
  const prompt = aiBuildLocalAiPrompt(context);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(LOCAL_AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      signal: controller.signal,
      body: JSON.stringify({
        model: LOCAL_AI_MODEL,
        stream: false,
        think: false,
        options: {
          num_ctx: 4096,
          num_predict: 220,
          temperature: 0.25,
        },
        messages: [
          {
            role: "system",
            content: "你是严谨的中文数据分析助手，必须只根据用户提供的数据作答。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    const json = await response.json();
    const content = json?.message?.content?.trim();
    let answer = content;
    try {
      const parsed = aiParseLocalAiJsonContent(content);
      answer = aiFormatLocalAiJson(parsed);
    } catch (parseError) {
      answer = /^\s*[{[]/.test(String(content || ""))
        ? "模型返回了不完整的结构化结果，暂时无法展示成分析卡片。建议点击重新分析，或把问题写得更具体一些。"
        : aiDedupeLocalText(content);
    }
    if (!answer) {
      throw new Error("模型没有返回正文，请稍后重试。");
    }
    if (appState.aiLocalRequestKey === requestKey) {
      appState.aiLocalStatus = "success";
      appState.aiLocalAnswer = answer;
      appState.aiLocalError = "";
      rerender();
    }
  } catch (error) {
    if (appState.aiLocalRequestKey === requestKey) {
      appState.aiLocalStatus = "error";
      appState.aiLocalAnswer = "";
      appState.aiLocalError = error?.name === "AbortError"
        ? "本地模型分析超过 120 秒，建议减少分析方向后再试。"
        : (error?.message || String(error));
      rerender();
    }
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function computeAiIterationAnalysis() {
  ensureAiAssistantDefaults();
  const intent = aiDetectIntent(appState.aiIterationText);
  const mentionedProjects = aiMentionedProjects(intent.rawText);
  const project = mentionedProjects.length === 1 ? mentionedProjects[0] : appState.aiProject;
  const mentionedVersions = aiMentionedVersions(intent.rawText, project);
  const oldVersion = mentionedVersions.length >= 2 ? mentionedVersions[0] : appState.aiOldVersion;
  const newVersion = mentionedVersions.length >= 2 ? mentionedVersions[1] : appState.aiNewVersion;
  const validDates = aiDateOptions(project, oldVersion, newVersion);
  const selectedDates = appState.aiDates.filter((date) => validDates.includes(date));
  const dates = (selectedDates.length ? selectedDates : aiDefaultDateSelection(validDates)).slice().sort();
  const metrics = aiMetricList(intent);
  const oldData = aiAggregateVersion(project, oldVersion, dates, "全部", metrics);
  const newData = aiAggregateVersion(project, newVersion, dates, "全部", metrics);
  const changes = metrics.map((metric) =>
    aiMetricChange(metric, oldData.aggregated?.[metric], newData.aggregated?.[metric])
  ).filter(Boolean);
  const rankedChanges = changes.slice().sort((a, b) => b.magnitude - a.magnitude);
  const qualityChanges = changes.filter((change) => change.metric !== "新增用户数" && Math.abs(change.delta) >= 0.0001);
  const improvedCount = qualityChanges.filter((change) => change.improved).length;
  const worsenedCount = qualityChanges.filter((change) => change.improved === false).length;
  const topCountryCandidates = aiTopCountries(project, oldVersion, newVersion, dates, 10);
  const topCountryUserMap = new Map(topCountryCandidates.map((item) => [item.country, item.users]));
  const mentionedCountries = aiMentionedCountries(intent);
  const topCountrySeeds = uniqueArray(mentionedCountries.concat(topCountryCandidates.map((item) => item.country)))
    .slice(0, Math.max(5, mentionedCountries.length));
  const topCountries = topCountrySeeds.map((country) => ({ country, users: topCountryUserMap.get(country) || 0 })).map((item) => {
    const oldCountry = aiAggregateVersion(project, oldVersion, dates, item.country, metrics);
    const newCountry = aiAggregateVersion(project, newVersion, dates, item.country, metrics);
    const countryMetricCandidates = intent.wantsDayFocus
      ? aiFocusedDayMetrics(intent.focusDays)
      : ["D1留存率", "卸载率_D0", "通知授权率_D0", "通知展示率_D0", "通知点击率_D0"];
    const countryChanges = countryMetricCandidates
      .filter((metric) => metrics.includes(metric))
      .map((metric) => aiMetricChange(metric, oldCountry.aggregated?.[metric], newCountry.aggregated?.[metric]))
      .filter(Boolean);
    const oldUsers = oldCountry.aggregated?.["新增用户数"] || 0;
    const newUsers = newCountry.aggregated?.["新增用户数"] || 0;
    const valid = Math.min(oldUsers, newUsers) >= 200;
    const negative = countryChanges.filter((change) => change.metric !== "新增用户数" && change.improved === false).length;
    const positive = countryChanges.filter((change) => change.metric !== "新增用户数" && change.improved).length;
    const strongest = countryChanges.slice().sort((a, b) => b.magnitude - a.magnitude)[0] || null;
    return {
      ...item,
      oldUsers,
      newUsers,
      valid,
      positive,
      negative,
      strongest,
      changes: countryChanges,
    };
  });
  const timingObjects = aiTimingObjectsForIntent(project, oldVersion, newVersion, dates, intent);
  const timingFocus = timingObjects.map((objectItem) =>
    aiTimingChange(project, oldVersion, newVersion, dates, objectItem, "全部", intent)
  );
  const timingCountryFocus = timingObjects.slice(0, 2).map((objectItem) => ({
    ...objectItem,
    countries: topCountries
      .filter((item) => item.valid)
      .slice(0, 5)
      .map((countryItem) => {
        const timing = aiTimingChange(project, oldVersion, newVersion, dates, objectItem, countryItem.country, intent);
        const primaryDay = intent.focusDays?.[0] || "D0";
        const keyChange = timing.changes.find((change) => change.metric === `${primaryDay}通知点击率`)
          || timing.changes.find((change) => change.metric === `${primaryDay}展示用户率`)
          || timing.rankedChanges[0]
          || null;
        return { country: countryItem.country, keyChange, timing };
      })
      .filter((item) => item.keyChange),
  }));
  const featureFocus = aiBuildFeatureFocus(project, oldVersion, newVersion, dates, intent);
  return {
    project,
    oldVersion,
    newVersion,
    dates,
    intent,
    metrics,
    oldData,
    newData,
    changes,
    rankedChanges,
    improvedCount,
    worsenedCount,
    topCountries,
    timingFocus,
    timingCountryFocus,
    featureFocus,
    notificationSummary: aiBuildNotificationSummary(changes),
  };
}

function renderAiIterationAssistant(host) {
  const analysis = computeAiIterationAnalysis();
  const projects = aiAvailableProjects();
  const versions = aiVersionOptions(analysis.project);
  const dates = aiDateOptions(analysis.project, analysis.oldVersion, analysis.newVersion);
  const oldUsers = analysis.oldData.aggregated?.["新增用户数"] || 0;
  const newUsers = analysis.newData.aggregated?.["新增用户数"] || 0;
  const topChanges = analysis.rankedChanges.filter((change) => change.metric !== "新增用户数").slice(0, 6);
  const qualityTop = topChanges;
  const strongestText = qualityTop.length
    ? `${qualityTop[0].metric} 变化最明显：${formatMetric(qualityTop[0].metric, qualityTop[0].oldValue)} → ${formatMetric(qualityTop[0].metric, qualityTop[0].newValue)}（${aiFormatDelta(qualityTop[0])}，${aiChangeTone(qualityTop[0])}）。`
    : "当前没有足够的质量指标变化可判断。";
  const recommendation = aiBuildRecommendation(analysis);

  const hasGenerated = !!appState.aiHasGenerated;
  const resultsHtml = hasGenerated ? aiRenderLocalAiPanel(analysis, "deepseek") : "";

  host.innerHTML = `
    <section style="margin-bottom:22px; border:1px solid rgba(37,99,235,0.14); border-radius:20px; padding:18px 20px; background:linear-gradient(135deg, rgba(37,99,235,0.05), rgba(255,255,255,0.98)); box-shadow:0 12px 30px rgba(15,23,42,0.04);">
      <div style="display:grid; grid-template-columns:minmax(240px,0.8fr) minmax(320px,1.2fr); gap:18px; align-items:end;">
        <div>
          <div class="eyebrow">DeepSeek 设置</div>
          <h3 style="margin:4px 0 6px; font-size:20px;">AI 分析需填写 API Key</h3>
          <p class="muted" style="margin:0; font-size:14px; line-height:1.7;">Key 只保存在当前浏览器本地；已保存时可留空，直接分析。</p>
        </div>
        ${aiRenderDeepSeekKeyInput()}
      </div>
    </section>

    <div class="feature-overview" style="margin-bottom:22px;">
      <div class="panel-title" style="margin-bottom:18px;">
        <div>
          <div class="eyebrow">开始分析</div>
          <h2 style="margin:4px 0 0;">输入你想问的问题</h2>
          <p class="muted">请尽量写清楚项目、版本、国家、指标或你想排查的问题；如果没写具体方向，DeepSeek 会按整体指标、头部国家、通知专项和功能模块综合判断。</p>
        </div>
      </div>
      <div style="display:grid; grid-template-columns: minmax(260px, 0.62fr) minmax(360px, 1.38fr); gap:16px;">
        <label class="control-block" style="margin:0;">
          <span class="label-row"><span>首次访问日期</span></span>
          <div id="ai-dates" style="display:flex; flex-wrap:wrap; gap:8px; min-height:128px; border:1px solid rgba(86,102,115,0.18); border-radius:14px; padding:10px 12px; background:#fff; align-content:flex-start;">
            ${dates.map((date) => `
              <label style="display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(86,102,115,0.18); border-radius:999px; padding:7px 10px; cursor:pointer; background:${analysis.dates.includes(date) ? "rgba(35, 99, 235, 0.10)" : "#fff"};">
                <input class="ai-date-check" type="checkbox" value="${escapeAttr(date)}" ${analysis.dates.includes(date) ? "checked" : ""} style="margin:0;">
                <span>${date}</span>
              </label>
            `).join("")}
          </div>
          <p class="muted" style="font-size:13px; margin:8px 0 0;">默认跳过最新日期，取前面最近 5 个日期；如需看最新数据，可手动勾选后点击“立即分析”。</p>
        </label>
        <label class="control-block" style="margin:0;">
          <span class="label-row"><span>你想问的问题</span></span>
          <textarea id="ai-iteration-text" rows="5" placeholder="例如：对比FRXXX和FRXXX在XXX国家的所有数据差距。" style="width:100%; min-height:128px; border:1px solid rgba(86,102,115,0.18); border-radius:14px; padding:12px 14px; resize:vertical; font:inherit; background:#fff;">${escapeAttr(appState.aiIterationText)}</textarea>
          <div style="margin-top:10px;">
            <div class="eyebrow" style="font-size:12px; letter-spacing:0; margin-bottom:8px;">输入示例</div>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${[
                "对比FRXXX和FRXXX在XXX国家的所有数据差距。",
                "比较FRXXX和FRXXX的D0通知指标，帮我看哪个项目表现更好。",
                "对比FRXXX项目的XXX版本和XXX版本，看看新版本哪些指标变好或变差。",
                "这次XXX版本整体效果怎么样？哪些指标变好，哪些变差？",
                "新版本XXX指标变差，XXX指标没有提升，帮我找可能原因。",
                "新版本优化了XXX文案/XXX时机，帮我看整体通知指标和专项表现。",
                "这次改了XXX功能，帮我看XXX漏斗哪里流失最大。"
              ].map((item) => `<button type="button" class="ai-example-chip" data-example="${escapeAttr(item)}" style="border:1px solid rgba(37,99,235,0.18); border-radius:999px; padding:7px 10px; background:#fff; color:var(--ink); cursor:pointer; font:inherit; font-size:13px;">${item}</button>`).join("")}
            </div>
          </div>
          ${aiRenderInputRecognition(analysis)}
        </label>
      </div>
      <div style="display:flex; justify-content:flex-end; margin-top:14px;">
        <button type="button" id="ai-generate" style="border:0; border-radius:999px; padding:12px 18px; background:var(--accent); color:white; font-weight:800; cursor:pointer;">立即分析</button>
      </div>
    </div>

    ${resultsHtml}
  `;
  bindAiIterationAssistant();
}

function bindAiIterationAssistant() {
  const dateChecks = document.querySelectorAll(".ai-date-check");
  const countryButtons = document.querySelectorAll(".ai-country-button");
  const featureButtons = document.querySelectorAll(".ai-feature-button");
  const exampleButtons = document.querySelectorAll(".ai-example-chip");
  const textArea = document.querySelector("#ai-iteration-text");
  const generateButton = document.querySelector("#ai-generate");
  const resetAiResult = () => {
    appState.aiHasGenerated = false;
    appState.aiLocalStatus = "idle";
    appState.aiLocalAnswer = "";
    appState.aiLocalError = "";
    appState.aiLocalRequestKey = "";
  };
  dateChecks.forEach((node) => {
    node.onchange = () => {
      appState.aiDates = Array.from(document.querySelectorAll(".ai-date-check:checked")).map((option) => option.value);
      resetAiResult();
    };
  });
  countryButtons.forEach((node) => {
    node.onclick = () => {
      appState.aiCountry = node.dataset.country || "";
      resetAiResult();
      rerender();
    };
  });
  featureButtons.forEach((node) => {
    node.onclick = () => {
      appState.aiFeatureAnalysisType = node.dataset.featureType || "";
      resetAiResult();
      rerender();
    };
  });
  if (textArea) {
    textArea.oninput = (event) => {
      appState.aiIterationText = event.target.value;
      resetAiResult();
      window.clearTimeout(window.__frAiInputTimer);
      window.__frAiInputTimer = window.setTimeout(() => {
        window.__frAiRefocusInput = true;
        rerender();
      }, 800);
    };
  }
  if (window.__frAiRefocusInput && textArea) {
    window.__frAiRefocusInput = false;
    textArea.focus();
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
  }
  exampleButtons.forEach((node) => {
    node.onclick = () => {
      appState.aiIterationText = node.dataset.example || "";
      resetAiResult();
      if (textArea) {
        textArea.value = appState.aiIterationText;
      }
      rerender();
    };
  });
  if (generateButton) {
    generateButton.onpointerdown = () => {
      window.clearTimeout(window.__frAiInputTimer);
      window.__frAiRefocusInput = false;
    };
    generateButton.onclick = (event) => {
      event.preventDefault();
      window.clearTimeout(window.__frAiInputTimer);
      window.__frAiRefocusInput = false;
      appState.aiIterationText = textArea?.value || appState.aiIterationText;
      const deepSeekInput = document.querySelector("#ai-deepseek-key");
      if (deepSeekInput?.value) {
        aiSaveDeepSeekApiKey(deepSeekInput.value);
        deepSeekInput.value = "";
      }
      const analysis = computeAiIterationAnalysis();
      const requestKey = aiLocalAnalysisKey(analysis);
      appState.aiHasGenerated = true;
      appState.aiLocalAnswer = "";
      appState.aiLocalError = "";
      appState.aiLocalRequestKey = requestKey;
      appState.aiLocalStatus = "loading";
      rerender();
      aiRunLocalAnalysis(analysis, requestKey);
    };
  }
}

function renderDataOverviewSummary(host) {
  renderAiIterationAssistant(host);
}

function renderCompareSummary(analysis) {
  const host = document.querySelector("#compare-summary");
  if (appState.activeWorkspace === "data_overview") {
    renderDataOverviewSummary(host);
    return;
  }
  if (!analysis.filteredRows.length) {
    host.innerHTML = `<div class="empty-state">当前筛选下没有可对比的数据。</div>`;
    return;
  }
  if (appState.activeWorkspace === "paid_country") {
    renderPaidCountrySummary(host, analysis);
    return;
  }
  if (appState.activeWorkspace === "paid_adgroup") {
    renderPaidCountrySummary(host, analysis, "广告组", "广告组");
    return;
  }
  if (appState.activeWorkspace === "country_opt") {
    renderCountryOptimizationSummary(host, analysis);
    return;
  }
  if (appState.activeWorkspace === "cross_project") {
    renderCrossProjectSummary(host, analysis);
    return;
  }
  if (appState.analysisMode === "single_project") {
    renderSingleProjectSummary(host, analysis);
    return;
  }
  const topMetrics = analysis.overallMetricDiffs.slice(0, 5);
  const cards = topMetrics.map((item) => {
    const diffText = item.kind === "rate"
      ? `${(item.diff * 100).toFixed(2)} pct`
      : item.kind === "count"
      ? Math.round(item.diff).toLocaleString("zh-CN")
      : item.diff.toFixed(2);
    return `
      <div class="stat-card">
        <div class="eyebrow">${dashboardData.metricMeta[item.metric]?.category || "指标差异"}</div>
        <div class="stat-title">${item.metric}</div>
        <div class="stat-value">${diffText}</div>
        <div class="muted">最大值 ${formatMetric(item.metric, item.max)} / 最小值 ${formatMetric(item.metric, item.min)}</div>
      </div>
    `;
  }).join("");
  const structureNotice = analysis.showStructureWarning
    ? `
      <div class="warning-banner">
        当前是跨项目的多国家汇总口径，并且国家选择了“全部”。指标差异可能同时受买量结构影响，不完全等同于同国家质量差异。
      </div>
    `
    : appState.countryMode === "single_country"
    ? `<div class="success-banner">当前为单国家精确对比口径，结果更适合直接横向比较。</div>`
    : "";
  host.innerHTML = `
    ${structureNotice}
    <div class="stats-grid">${cards}</div>
    <div class="hint">按当前筛选，系统会优先把差异最大的指标排到前面，方便你先看“最不一样”的地方。</div>
  `;
}

function renderCrossProjectSummary(host, analysis) {
  const selectedDates = appState.filters["首次访问日期"]?.length
    ? appState.filters["首次访问日期"].slice()
    : optionsForRows(analysis.filteredRows, "首次访问日期");
  const selectedProjects = analysis.compareValues.length
    ? analysis.compareValues.slice()
    : (appState.filters["项目代号"] || []).filter((item) => item !== "全部");
  const latestSelectedFirstVisitDate = selectedDates.length
    ? selectedDates.slice().sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true })).slice(-1)[0]
    : null;

  const projectChecks = selectedProjects.map((project) => {
    const dateUsers = selectedDates.map((date) => {
      const rows = analysis.filteredRows.filter((row) => row["项目代号"] === project && row["首次访问日期"] === date);
      const users = rows.length ? (aggregateRows(rows, ["新增用户数"])?.["新增用户数"] || 0) : 0;
      return { date, users };
    });
    const qualifiedDates = dateUsers.filter((item) => item.users > 200);
    const weakDates = dateUsers.filter((item) => item.users <= 200);
    return {
      project,
      dateUsers,
      qualifiedDates,
      weakDates,
      excluded: qualifiedDates.length === 0,
    };
  });

  const qualifiedProjects = projectChecks.filter((item) => !item.excluded);
  const excludedProjects = projectChecks.filter((item) => item.excluded);
  const qualifiedDateMap = new Map(qualifiedProjects.map((item) => [item.project, new Set(item.qualifiedDates.map((point) => point.date))]));

  const metricInsights = sortCompareMetrics(analysis.compareMetrics.filter((metric) => metric !== "新增用户数"))
    .map((metric) => {
      const values = qualifiedProjects.map((item) => {
        let rows = analysis.filteredRows.filter((row) =>
          row["项目代号"] === item.project && qualifiedDateMap.get(item.project)?.has(row["首次访问日期"])
        );
        if (shouldExcludeLatestFirstVisit(metric) && latestSelectedFirstVisitDate) {
          rows = rows.filter((row) => row["首次访问日期"] !== latestSelectedFirstVisitDate);
        }
        const value = rows.length ? aggregateRows(rows, [metric])?.[metric] : null;
        return value === null || value === undefined || Number.isNaN(value) ? null : { project: item.project, value };
      }).filter(Boolean);
      if (values.length < 2) {
        return null;
      }
      const lowerBetter = metric.includes("卸载率");
      const ranked = values.slice().sort((a, b) => lowerBetter ? a.value - b.value : b.value - a.value);
      const best = ranked[0];
      const worst = ranked[ranked.length - 1];
      return {
        metric,
        best,
        worst,
        lowerBetter,
        kind: dashboardData.metricMeta[metric]?.kind,
        diff: Math.abs((best?.value || 0) - (worst?.value || 0)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.diff - a.diff);

  const leadMap = new Map(qualifiedProjects.map((item) => [item.project, []]));
  const weakMap = new Map(qualifiedProjects.map((item) => [item.project, []]));
  metricInsights.forEach((item) => {
    leadMap.get(item.best.project)?.push(item.metric);
    weakMap.get(item.worst.project)?.push(item.metric);
  });

  const rankedProjects = qualifiedProjects
    .map((item) => ({
      project: item.project,
      leads: leadMap.get(item.project) || [],
      weak: weakMap.get(item.project) || [],
      qualifiedDates: item.qualifiedDates,
      weakDates: item.weakDates,
    }))
    .sort((a, b) => {
      if (b.leads.length !== a.leads.length) return b.leads.length - a.leads.length;
      return a.weak.length - b.weak.length;
    });

  const bestProject = rankedProjects[0] || null;
  const weakProject = rankedProjects.slice().sort((a, b) => {
    if (b.weak.length !== a.weak.length) return b.weak.length - a.weak.length;
    return a.leads.length - b.leads.length;
  })[0] || null;

  const firstStepBlock = `
    <div class="narrative-block" style="margin-bottom: 18px;">
      <h3>第一点：先排除样本量过少的项目</h3>
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-top:14px;">
        <div class="stat-card" style="padding:22px 24px;">
          <div class="eyebrow">纳入分析项目</div>
          <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${qualifiedProjects.length ? "可参与比较" : "暂无达标项目"}</div>
          <div class="muted" style="line-height:1.9;">
            ${
              qualifiedProjects.length
                ? qualifiedProjects.map((item) => {
                    const allQualified = item.weakDates.length === 0;
                    return `<div><strong>${item.project}</strong>：${allQualified ? "所选日期全部 > 200" : `仅使用 ${item.qualifiedDates.map((point) => point.date).join("、")} 进行分析`}</div>`;
                  }).join("")
                : "当前没有项目在所选日期里留下可分析的样本。"
            }
          </div>
        </div>
        <div class="stat-card" style="padding:22px 24px;">
          <div class="eyebrow">待排除项目</div>
          <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${excludedProjects.length ? "样本不足" : "无"}</div>
          <div class="muted" style="line-height:1.9;">
            ${
              excludedProjects.length
                ? excludedProjects.map((item) => `<div><strong>${item.project}</strong>：${item.dateUsers.map((point) => `${point.date} ${Math.round(point.users)}`).join("、")}</div>`).join("")
                : "当前所选项目都至少有一部分日期可进入分析。"
            }
          </div>
        </div>
      </div>
    </div>
  `;

  const secondStepBlock = qualifiedProjects.length < 2 || !metricInsights.length
    ? `
      <div class="empty-state">
        当前可纳入分析的项目不足 2 个，或者有效指标不足，第二点暂时不输出项目优劣结论。
      </div>
    `
    : `
      <div class="stat-card" style="padding:22px 24px; margin-top:14px;">
        <div class="eyebrow">综合结论</div>
        <div class="stat-title" style="font-size:24px; line-height:1.35;">${bestProject?.project || "NA"} 当前更优</div>
        <div class="muted" style="margin-top:10px; line-height:1.9;">
          ${
            bestProject?.leads.length
              ? `主要好在：${bestProject.leads.join("、")}。`
              : "当前没有形成特别明显的领先指标。"
          }
          ${
            weakProject?.project
              ? `<br/>${weakProject.project} 相对偏弱，主要短板是：${weakProject.weak.length ? weakProject.weak.join("、") : "暂无明显短板"}。`
              : ""
          }
        </div>
      </div>
      <div class="stats-grid" style="margin-top:14px;">
        ${rankedProjects.map((item) => `
          <div class="stat-card">
            <div class="eyebrow">项目状态</div>
            <div class="stat-title">${item.project}</div>
            <div class="stat-value">${item.leads.length} 项领先 / ${item.weak.length} 项偏弱</div>
            <div class="muted">
              优势：${item.leads.length ? item.leads.join("、") : "暂无明显优势"}<br/>
              短板：${item.weak.length ? item.weak.join("、") : "暂无明显短板"}
            </div>
          </div>
        `).join("")}
      </div>
      <div class="table-wrap" style="margin-top:16px;">
        <table class="metric-table">
          <thead>
            <tr>
              <th>指标</th>
              <th>表现更好</th>
              <th>当前值</th>
              <th>需要关注</th>
              <th>当前值</th>
              <th>差异</th>
            </tr>
          </thead>
          <tbody>
            ${metricInsights.slice(0, 6).map((item) => `
              <tr>
                <th>${item.metric}</th>
                <td>${item.best.project}</td>
                <td>${formatMetric(item.metric, item.best.value)}</td>
                <td>${item.worst.project}</td>
                <td>${formatMetric(item.metric, item.worst.value)}</td>
                <td>${item.kind === "rate" ? `${(item.diff * 100).toFixed(2)}%` : formatMetric(item.metric, item.diff)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

  host.innerHTML = `
    ${firstStepBlock}
    <div class="narrative-block">
      <h3>第二点：再分析项目间的核心指标差异</h3>
      ${secondStepBlock}
    </div>
  `;
}

function renderPaidCountrySummary(host, analysis, dimensionField = "国家", dimensionLabel = "国家") {
  const scopedRows = analysis.filteredRows.filter((row) => row["版本号"] === "全部");
  const selectedProjects = sortDimensionValues("项目代号", [...new Set(scopedRows.map((row) => row["项目代号"]))].filter(Boolean));
  const selectedDates = sortDimensionValues("首次访问日期", [...new Set(scopedRows.map((row) => row["首次访问日期"]))].filter(Boolean));
  const topItems = (dimensionField === "国家" ? topCountriesByUsers(scopedRows) : topValuesByUsers(scopedRows, dimensionField)).slice(0, 10);
  const totalUsersForRows = (rows) => {
    const aggregateValue = aggregateRows(rows.filter((row) => row[dimensionField] === "全部"), ["新增用户数"])?.["新增用户数"] || 0;
    if (aggregateValue > 0) {
      return aggregateValue;
    }
    return aggregateRows(rows.filter((row) => row[dimensionField] !== "全部"), ["新增用户数"])?.["新增用户数"] || 0;
  };
  const verticalCards = topItems.map((itemName) => {
    const series = selectedProjects.map((project) => {
      const points = selectedDates.map((date) => {
        const rows = scopedRows.filter((row) => row["项目代号"] === project && row["首次访问日期"] === date);
        const totalUsers = totalUsersForRows(rows);
        const itemUsers = aggregateRows(rows.filter((row) => row[dimensionField] === itemName), ["新增用户数"])?.["新增用户数"] || 0;
        return {
          date,
          value: totalUsers > 0 ? itemUsers / totalUsers : null,
        };
      });
      return {
        project,
        points,
      };
    }).filter((item) => item.points.some((point) => point.value !== null && point.value !== undefined));
    const flattenedPoints = series.flatMap((item) => item.points).filter((point) => point.value !== null && point.value !== undefined);
    if (!flattenedPoints.length) {
      return "";
    }
    const summaryParts = series.map((item) => {
      const validPoints = item.points.filter((point) => point.value !== null && point.value !== undefined);
      if (!validPoints.length) {
        return null;
      }
      const firstPoint = validPoints[0];
      const lastPoint = validPoints[validPoints.length - 1];
        return `<div><strong>${item.project}</strong>：${formatMetric("通知授权率_D0", firstPoint.value)} -> ${formatMetric("通知授权率_D0", lastPoint.value)}</div>`;
    }).filter(Boolean).join("");
    return `
      <div class="stat-card" style="padding:22px 24px;">
        <div class="eyebrow">竖向对比</div>
        <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${itemName}</div>
        <div class="chart-legend" style="margin-top:4px; margin-bottom:8px;">
          ${series.map((item, index) => `
            <span class="chart-legend-item">
              <i style="background:${SERIES_COLORS[index % SERIES_COLORS.length]}"></i>${item.project}
            </span>
          `).join("")}
        </div>
        ${paidCountryLineChartSvg(itemName, selectedDates, series)}
        <div class="muted" style="margin-top:10px; line-height:1.8;">
          ${summaryParts}
        </div>
      </div>
    `;
  }).filter(Boolean).join("");

  const verticalSummaryCards = selectedProjects.map((project) => {
    const countryDeltas = topItems.map((itemName) => {
      const validPoints = selectedDates.map((date) => {
        const rows = scopedRows.filter((row) => row["项目代号"] === project && row["首次访问日期"] === date);
        const totalUsers = totalUsersForRows(rows);
        const itemUsers = aggregateRows(rows.filter((row) => row[dimensionField] === itemName), ["新增用户数"])?.["新增用户数"] || 0;
        return {
          date,
          value: totalUsers > 0 ? itemUsers / totalUsers : null,
        };
      }).filter((point) => point.value !== null && point.value !== undefined && !Number.isNaN(point.value));
      if (validPoints.length < 2) {
        return null;
      }
      const firstPoint = validPoints[0];
      const lastPoint = validPoints[validPoints.length - 1];
      return {
        country: itemName,
        firstPoint,
        lastPoint,
        delta: lastPoint.value - firstPoint.value,
      };
    }).filter(Boolean);

    if (!countryDeltas.length) {
      return `
        <div class="stat-card" style="padding:22px 24px;">
          <div class="eyebrow">竖向总结</div>
          <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${project}</div>
          <div class="muted" style="line-height:1.8;">当前只选了 1 个首次访问日期，暂时看不出${dimensionLabel}占比的明显变化。</div>
        </div>
      `;
    }

    const rising = countryDeltas
      .filter((item) => item.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 3);
    const falling = countryDeltas
      .filter((item) => item.delta < 0)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 3);

    const renderDeltaList = (items, direction) => {
      if (!items.length) {
        return `<div style="padding:10px 12px; border-radius:12px; background:rgba(86,102,115,0.06); color:#5c6c76;">暂无明显${direction === "up" ? "上升" : "下降"}${dimensionLabel}</div>`;
      }
      return items.map((item) => `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding:10px 12px; border-radius:12px; background:${direction === "up" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"};">
          <div style="min-width:0;">
            <strong style="font-size:15px; color:#24323b;">${item.country}</strong>
            <div style="margin-top:4px; color:#5c6c76;">${formatMetric("通知授权率_D0", item.firstPoint.value)} -> ${formatMetric("通知授权率_D0", item.lastPoint.value)}</div>
          </div>
          <div style="white-space:nowrap; font-size:14px; font-weight:700; color:${direction === "up" ? "#237a43" : "#b33c35"};">
            ${direction === "up" ? "+" : "-"}${Math.abs(item.delta * 100).toFixed(2)}%
          </div>
        </div>
      `).join("");
    };

    return `
      <div class="stat-card" style="padding:22px 24px;">
        <div class="eyebrow">竖向总结</div>
        <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${project}</div>
        <div class="muted" style="line-height:1.85;">
          <div><strong>占比上升明显：</strong></div>
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">${renderDeltaList(rising, "up")}</div>
          <div style="margin-top:12px;"><strong>占比下降明显：</strong></div>
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">${renderDeltaList(falling, "down")}</div>
        </div>
      </div>
    `;
  }).join("");

  const projectTopCountryRows = selectedProjects.map((project) => {
    const rows = scopedRows.filter((row) => row["项目代号"] === project);
    const totalUsers = totalUsersForRows(rows);
    const countryStats = (dimensionField === "国家" ? topCountriesByUsers(rows) : topValuesByUsers(rows, dimensionField))
      .slice(0, 10)
      .map((country) => {
        const users = aggregateRows(rows.filter((row) => row[dimensionField] === country), ["新增用户数"])?.["新增用户数"] || 0;
        return {
          country,
          users,
          share: totalUsers > 0 ? users / totalUsers : 0,
        };
      })
      .filter((item) => item.users > 0)
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);
    return {
      project,
      totalUsers,
      countryStats,
    };
  }).filter((item) => item.totalUsers > 0);

  const projectCards = projectTopCountryRows.map((item) => {
    return `
      <div class="stat-card" style="padding:22px 24px;">
        <div class="eyebrow">横向对比</div>
        <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${item.project}</div>
        <div class="stat-value" style="font-size:16px; margin-top:0;">top 10 ${dimensionLabel}结构</div>
        <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
          ${item.countryStats.map((stat, index) => `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px; border-radius:12px; background:rgba(37,99,235,0.06);">
              <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                <div style="width:24px; height:24px; border-radius:999px; background:rgba(37,99,235,0.12); color:#1d4ed8; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">${index + 1}</div>
                <strong style="font-size:15px; color:#24323b;">${stat.country}</strong>
              </div>
              <div style="font-size:14px; color:#5c6c76; white-space:nowrap;">${formatMetric("通知授权率_D0", stat.share)}</div>
            </div>
          `).join("")}
        </div>
        <div class="muted" style="margin-top:14px; line-height:1.8;">
          当前按新增用户数从高到低展示该项目的 top 10 ${dimensionLabel}结构。
        </div>
      </div>
    `;
  }).join("");

  host.innerHTML = `
    <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px;">
      ${projectCards}
    </div>
    <div class="narrative-block" style="margin-top:18px;">
      <h3>先看各项目里哪些${dimensionLabel}占比变化最明显</h3>
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:18px; margin-top:14px;">
        ${verticalSummaryCards}
      </div>
    </div>
    <div class="narrative-block" style="margin-top:18px;">
      <h3>竖向看单${dimensionLabel}占全部用户的比例变化</h3>
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(520px, 1fr)); gap:22px; margin-top:14px;">
        ${verticalCards || '<div class="empty-state">当前筛选下还没有足够数据形成竖向变化。</div>'}
      </div>
    </div>
  `;
}

function paidCountryLineChartSvg(country, dates, series) {
  const width = 920;
  const height = 340;
  const padLeft = 62;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 58;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const validValues = series
    .flatMap((item) => item.points.map((point) => point.value))
    .filter((value) => value !== null && value !== undefined && !Number.isNaN(value));
  if (!dates.length || !validValues.length) {
    return `<div class="empty-state">当前筛选下没有 ${country} 的折线图数据。</div>`;
  }
  const maxValue = Math.max(...validValues);
  const scaleMax = maxValue > 0 ? maxValue * 1.12 : 1;
  const stepX = dates.length > 1 ? chartWidth / (dates.length - 1) : 0;
  const xForIndex = (index) => padLeft + stepX * index;
  const yForValue = (value) => padTop + chartHeight - (chartHeight * (value / scaleMax));
  const ticks = Array.from({ length: 5 }, (_, index) => scaleMax * (index / 4));
  const grids = ticks.map((tick) => {
    const y = yForValue(tick);
    return `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="rgba(86,102,115,0.12)" stroke-width="1" />
      <text x="${padLeft - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="#6b7b85">${(tick * 100).toFixed(0)}%</text>
    `;
  }).join("");
  const xLabels = dates.map((date, index) => `
    <text x="${xForIndex(index)}" y="${height - 18}" text-anchor="middle" font-size="12" fill="#6b7b85">${date.slice(5)}</text>
  `).join("");
  const lines = series.map((item, seriesIndex) => {
    const color = SERIES_COLORS[seriesIndex % SERIES_COLORS.length];
    const validPoints = item.points
      .map((point, index) => ({ ...point, index }))
      .filter((point) => point.value !== null && point.value !== undefined && !Number.isNaN(point.value));
    if (!validPoints.length) {
      return "";
    }
    const polyline = validPoints
      .map((point) => `${xForIndex(point.index)},${yForValue(point.value)}`)
      .join(" ");
    const circles = validPoints
      .map((point) => `<circle cx="${xForIndex(point.index)}" cy="${yForValue(point.value)}" r="3.5" fill="${color}" />`)
      .join("");
    return `
      <polyline fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polyline}" />
      ${circles}
    `;
  }).join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" class="timing-chart-svg" role="img" aria-label="${country} 占比变化折线图">
      ${grids}
      <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" stroke="rgba(86,102,115,0.22)" stroke-width="1" />
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${height - padBottom}" stroke="rgba(86,102,115,0.22)" stroke-width="1" />
      ${lines}
      ${xLabels}
    </svg>
  `;
}

function countryOptMetricLineChartSvg(metric, dates, series) {
  const width = 920;
  const height = 340;
  const padLeft = 72;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 58;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const validValues = series
    .flatMap((item) => item.points.map((point) => point.value))
    .filter((value) => value !== null && value !== undefined && !Number.isNaN(value));
  if (!dates.length || !validValues.length) {
    return `<div class="empty-state">当前筛选下没有 ${metric} 的趋势数据。</div>`;
  }
  const metricKind = dashboardData.metricMeta[metric]?.kind;
  const maxValue = Math.max(...validValues);
  const scaleMax = maxValue > 0 ? maxValue * 1.12 : 1;
  const stepX = dates.length > 1 ? chartWidth / (dates.length - 1) : 0;
  const xForIndex = (index) => padLeft + stepX * index;
  const yForValue = (value) => padTop + chartHeight - (chartHeight * (value / scaleMax));
  const ticks = Array.from({ length: 5 }, (_, index) => scaleMax * (index / 4));
  const formatTick = (value) => {
    if (metricKind === "count") {
      return Math.round(value).toLocaleString("zh-CN");
    }
    if (metricKind === "rate") {
      return `${(value * 100).toFixed(0)}%`;
    }
    return Number(value).toFixed(2);
  };
  const grids = ticks.map((tick) => {
    const y = yForValue(tick);
    return `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="rgba(86,102,115,0.12)" stroke-width="1" />
      <text x="${padLeft - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="#6b7b85">${formatTick(tick)}</text>
    `;
  }).join("");
  const xLabels = dates.map((date, index) => `
    <text x="${xForIndex(index)}" y="${height - 18}" text-anchor="middle" font-size="12" fill="#6b7b85">${date.slice(5)}</text>
  `).join("");
  const lines = series.map((item, seriesIndex) => {
    const color = SERIES_COLORS[seriesIndex % SERIES_COLORS.length];
    const validPoints = item.points
      .map((point, index) => ({ ...point, index }))
      .filter((point) => point.value !== null && point.value !== undefined && !Number.isNaN(point.value));
    if (!validPoints.length) {
      return "";
    }
    const polyline = validPoints
      .map((point) => `${xForIndex(point.index)},${yForValue(point.value)}`)
      .join(" ");
    const circles = validPoints
      .map((point) => `<circle cx="${xForIndex(point.index)}" cy="${yForValue(point.value)}" r="3.5" fill="${color}" />`)
      .join("");
    return `
      <polyline fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polyline}" />
      ${circles}
    `;
  }).join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" class="timing-chart-svg" role="img" aria-label="${metric} 国家趋势图">
      ${grids}
      <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" stroke="rgba(86,102,115,0.22)" stroke-width="1" />
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${height - padBottom}" stroke="rgba(86,102,115,0.22)" stroke-width="1" />
      ${lines}
      ${xLabels}
    </svg>
  `;
}

function renderCountryOptimizationSummary(host, analysis) {
  const qualityInsights = analysis.rankedMetricInsights.filter((item) => item.metric !== "新增用户数");
  const subjectStats = new Map(analysis.subjectSampleStats.map((item) => [item.subject, item.users]));
  const sortedSampleStats = analysis.subjectSampleStats.slice().sort((a, b) => b.users - a.users);
  const laggingMap = new Map();
  for (const item of qualityInsights) {
    const lagging = item.worst?.subject;
    if (!lagging) continue;
    const current = laggingMap.get(lagging) || { count: 0, metrics: [], totalGap: 0 };
    current.count += 1;
    current.metrics.push(item.metric);
    current.totalGap += item.kind === "rate" ? item.diff * 100 : item.diff;
    laggingMap.set(lagging, current);
  }
  const priorityCountry = [...laggingMap.entries()]
    .sort((a, b) => (b[1].count - a[1].count) || (b[1].totalGap - a[1].totalGap))[0];
  const topGap = qualityInsights[0] || null;
  const lowSampleCountries = analysis.subjectSampleStats.filter((item) => !isConclusionEligible(item.users));
  const minSample = sortedSampleStats.length ? sortedSampleStats[sortedSampleStats.length - 1].users : 0;
  const maxSample = sortedSampleStats.length ? sortedSampleStats[0].users : 0;

  const compareRows = analysis.filteredRows.filter((row) => analysis.compareValues.includes(row[analysis.compareField]));
  const selectedFirstVisitDates = appState.filters["首次访问日期"]?.length
    ? appState.filters["首次访问日期"].slice()
    : [...new Set(compareRows.map((row) => row["首次访问日期"]))].sort();
  const sampleThreshold = 200;
  const countryAverageRows = analysis.compareValues.map((country) => {
    const rows = compareRows.filter((row) => row["国家"] === country);
    const dateUsers = selectedFirstVisitDates.map((date) => {
      const dateRows = rows.filter((row) => row["首次访问日期"] === date);
      return {
        date,
        users: aggregateRows(dateRows, ["新增用户数"])?.["新增用户数"] || 0,
      };
    });
    const qualifiedDates = dateUsers.filter((item) => item.users > sampleThreshold);
    const weakDates = dateUsers.filter((item) => item.users <= sampleThreshold);
    return {
      country,
      dateUsers,
      qualifiedDates,
      weakDates,
    };
  });
  const qualifiedCountries = countryAverageRows.filter((item) => item.qualifiedDates.length);
  const weakSampleCountries = countryAverageRows.filter((item) => !item.qualifiedDates.length);
  const qualifiedCountryDateMap = new Map(qualifiedCountries.map((item) => [item.country, new Set(item.qualifiedDates.map((point) => point.date))]));

  const benchmarkMetricOrder = [
    "D1留存率",
    "卸载率_D0",
    "通知授权率_D0",
    "通知展示率_D0",
    "人均展示次数_D0",
    "通知点击率_D0",
    "人均点击次数_D0",
    "常驻通知栏点击率_D0",
    "常驻通知栏人均点击次数_D0",
  ];

  const benchmarkRows = analysis.filteredRows;
  const formatCountryMetricList = (items) => {
    if (!items.length) {
      return "无";
    }
    return `
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
        ${items.map((item) => `<div><strong>${item.country}</strong>（${formatMetric(item.metric, item.value)}）</div>`).join("")}
      </div>
    `;
  };
  const benchmarkMetrics = benchmarkMetricOrder
    .filter((metric) => analysis.compareMetrics.includes(metric))
    .map((metric) => {
      const metricRows = benchmarkRows.filter((row) => {
        const qualifiedDates = qualifiedCountryDateMap.get(row["国家"]);
        if (!qualifiedDates?.has(row["首次访问日期"])) {
          return false;
        }
        return !(shouldExcludeLatestFirstVisit(metric) && selectedFirstVisitDates.length && row["首次访问日期"] === selectedFirstVisitDates[selectedFirstVisitDates.length - 1]);
      });
      const overall = aggregateRows(metricRows, [metric])?.[metric];
      const countryValues = qualifiedCountries.map((item) => {
        const rows = compareRows.filter((row) =>
          row["国家"] === item.country &&
          qualifiedCountryDateMap.get(item.country)?.has(row["首次访问日期"]) &&
          !(shouldExcludeLatestFirstVisit(metric) && selectedFirstVisitDates.length && row["首次访问日期"] === selectedFirstVisitDates[selectedFirstVisitDates.length - 1])
        );
        const value = rows.length ? aggregateRows(rows, [metric])?.[metric] : null;
        return { country: item.country, value, metric };
      }).filter((item) => item.value !== null && item.value !== undefined);
      const lowerBetter = metric === "卸载率_D0";
      const better = lowerBetter
        ? countryValues.filter((item) => item.value < overall)
        : countryValues.filter((item) => item.value > overall);
      const weaker = lowerBetter
        ? countryValues.filter((item) => item.value > overall)
        : countryValues.filter((item) => item.value < overall);
      return { metric, overall, better, weaker, lowerBetter };
    });
  const trendMetricOptions = sortCompareMetrics(analysis.compareMetrics.slice());
  if (!appState.countryOptTrendMetric || !trendMetricOptions.includes(appState.countryOptTrendMetric)) {
    appState.countryOptTrendMetric = trendMetricOptions[0] || null;
  }
  const selectedTrendMetric = appState.countryOptTrendMetric;
  const selectedTrendBenchmark = benchmarkMetrics.find((item) => item.metric === selectedTrendMetric) || null;
  const trendDates = selectedFirstVisitDates
    .filter((date) => !(shouldExcludeLatestFirstVisit(selectedTrendMetric) && date === selectedFirstVisitDates[selectedFirstVisitDates.length - 1]));
  const trendCountries = qualifiedCountries.map((item) => item.country).filter((country) => {
    const rows = compareRows.filter((row) => row["国家"] === country);
    return trendDates.some((date) => qualifiedCountryDateMap.get(country)?.has(date) && rows.some((row) => row["首次访问日期"] === date));
  });
  const trendSeries = trendCountries.map((country) => {
    const rows = compareRows.filter((row) => row["国家"] === country);
    const points = trendDates.map((date) => {
      const dateRows = qualifiedCountryDateMap.get(country)?.has(date)
        ? rows.filter((row) => row["首次访问日期"] === date)
        : [];
      return {
        date,
        value: dateRows.length ? aggregateRows(dateRows, [selectedTrendMetric])?.[selectedTrendMetric] : null,
      };
    });
    return { country, points };
  }).filter((item) => item.points.some((point) => point.value !== null && point.value !== undefined));
  const selectedTrendConclusion = selectedTrendBenchmark
    ? `
      <div class="stat-card" style="padding:22px 24px;">
        <div class="eyebrow">横向对比结论</div>
        <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${selectedTrendMetric}</div>
        <div class="stat-value" style="font-size:16px; margin-top:0;">综合值 ${formatMetric(selectedTrendMetric, selectedTrendBenchmark.overall)}</div>
        <div class="muted" style="margin-top:14px; line-height:1.8;">
          <strong style="color:#2e6b3f;">表现更好：</strong>
          ${formatCountryMetricList(selectedTrendBenchmark.better)}
        </div>
        <div class="muted" style="margin-top:12px; line-height:1.8;">
          <strong style="color:#8a3d22;">需要关注：</strong>
          ${formatCountryMetricList(selectedTrendBenchmark.weaker)}
        </div>
      </div>
    `
    : `
      <div class="empty-state">当前选中的指标还没有足够的数据，暂时无法输出横向对比结论。</div>
    `;

  const formatQualifiedCountrySample = (item) => {
    const qualifiedDateText = item.qualifiedDates.map((point) => `${point.date} ${Math.round(point.users).toLocaleString("zh-CN")}`).join("、");
    return item.weakDates.length
      ? `仅使用 ${qualifiedDateText} 进行分析`
      : `所选日期全部 > ${sampleThreshold}（${qualifiedDateText}）`;
  };
  const sampleConclusion = qualifiedCountries.length
    ? `达标国家共 ${qualifiedCountries.length} 个：${qualifiedCountries.map((item) => `${item.country}（${formatQualifiedCountrySample(item)}）`).join("、")}。`
    : `当前没有国家在所选日期里留下可分析的样本。`;
  const weakConclusion = weakSampleCountries.length
    ? `未达标国家共 ${weakSampleCountries.length} 个：${weakSampleCountries.map((item) => `${item.country}（${item.dateUsers.map((point) => `${point.date} ${Math.round(point.users).toLocaleString("zh-CN")}`).join("、")}）`).join("、")}。这些国家先作为线索，不建议直接拿来做强结论。`
    : "当前参与对比的国家都至少有一部分日期可进入分析。";
  const formatSampleCountryList = (items, mode) => {
    if (!items.length) {
      return "";
    }
    return `
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
        ${items.map((item) => {
          const detail = mode === "qualified"
            ? formatQualifiedCountrySample(item)
            : item.dateUsers.map((point) => `${point.date} ${Math.round(point.users).toLocaleString("zh-CN")}`).join("、");
          return `<div><strong>${item.country}</strong>（${detail}）</div>`;
        }).join("")}
      </div>
    `;
  };
  const sampleCards = `
    <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; margin-top: 14px;">
      <div class="stat-card" style="padding: 22px 24px;">
        <div class="eyebrow">纳入分析国家</div>
        <div class="stat-title" style="font-size:20px; line-height:1.35; margin-bottom:8px;">至少一天新增大于 200</div>
        <div class="stat-value" style="font-size:16px; margin-top:0;">${qualifiedCountries.length} 个国家</div>
        <div class="muted" style="margin-top: 10px;">${qualifiedCountries.length ? `达标国家共 ${qualifiedCountries.length} 个。` : sampleConclusion}</div>
        ${formatSampleCountryList(qualifiedCountries, "qualified")}
      </div>
      <div class="stat-card" style="padding: 22px 24px;">
        <div class="eyebrow">待排除国家</div>
        <div class="stat-title" style="font-size:20px; line-height:1.35; margin-bottom:8px;">所选日期都未超过 200</div>
        <div class="stat-value" style="font-size:16px; margin-top:0;">${weakSampleCountries.length} 个国家</div>
        <div class="muted" style="margin-top: 10px;">${weakSampleCountries.length ? `这些国家先作为线索，不建议直接拿来做强结论。` : weakConclusion}</div>
        ${formatSampleCountryList(weakSampleCountries, "weak")}
      </div>
    </div>
  `;

  const benchmarkNarrative = benchmarkMetrics.length
    ? `
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top: 14px;">
        ${benchmarkMetrics.map((item) => `
          <div class="stat-card" style="padding: 24px 26px; min-height: 220px;">
            <div class="eyebrow">${item.lowerBetter ? "越低越好" : "越高越好"}</div>
            <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${item.metric}</div>
            <div class="stat-value" style="font-size:16px; margin-top:0;">综合值 ${formatMetric(item.metric, item.overall)}</div>
            <div class="muted" style="margin-top: 14px; line-height: 1.8;">
              <strong style="color:#2e6b3f;">表现更好：</strong>
              ${formatCountryMetricList(item.better)}
            </div>
            <div class="muted" style="margin-top: 12px; line-height: 1.8;">
              <strong style="color:#8a3d22;">需要关注：</strong>
              ${formatCountryMetricList(item.weaker)}
            </div>
          </div>
        `).join("")}
      </div>
    `
    : `<div class="empty-state">当前勾选的关注指标里，还没有这批默认分析指标，所以暂时无法输出国家高低说明。</div>`;
  const countryTuningScores = qualifiedCountries.map((item) => {
    const weakerMetrics = benchmarkMetrics
      .filter((metricItem) => metricItem.weaker.some((entry) => entry.country === item.country))
      .map((metricItem) => metricItem.metric);
    const betterMetrics = benchmarkMetrics
      .filter((metricItem) => metricItem.better.some((entry) => entry.country === item.country))
      .map((metricItem) => metricItem.metric);
    return {
      country: item.country,
      weakerMetrics,
      betterMetrics,
      weakerCount: weakerMetrics.length,
      betterCount: betterMetrics.length,
    };
  }).sort((a, b) => (b.weakerCount - a.weakerCount) || (a.betterCount - b.betterCount) || a.country.localeCompare(b.country, "zh-CN"));
  const primaryTuningCountry = countryTuningScores[0] || null;
  const classifyPriority = (weakerCount) => {
    if (weakerCount >= 6) return "P0";
    if (weakerCount >= 3) return "P1";
    if (weakerCount >= 1) return "P2";
    return null;
  };
  const priorityBuckets = {
    P0: countryTuningScores.filter((item) => classifyPriority(item.weakerCount) === "P0"),
    P1: countryTuningScores.filter((item) => classifyPriority(item.weakerCount) === "P1"),
    P2: countryTuningScores.filter((item) => classifyPriority(item.weakerCount) === "P2"),
    OK: countryTuningScores.filter((item) => classifyPriority(item.weakerCount) === null),
  };
  const priorityStyles = {
    P0: {
      badge: "background:#7f1d1d; color:#fff;",
      card: "background:rgba(153,27,27,0.08); border:1px solid rgba(153,27,27,0.16); border-radius:18px; padding:14px 16px;",
    },
    P1: {
      badge: "background:#9a3412; color:#fff;",
      card: "background:rgba(234,88,12,0.08); border:1px solid rgba(234,88,12,0.16); border-radius:18px; padding:14px 16px;",
    },
    P2: {
      badge: "background:#1d4ed8; color:#fff;",
      card: "background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.16); border-radius:18px; padding:14px 16px;",
    },
    OK: {
      badge: "background:#166534; color:#fff;",
      card: "background:rgba(22,101,52,0.08); border:1px solid rgba(22,101,52,0.16); border-radius:18px; padding:14px 16px;",
    },
  };
  const formatPriorityGroup = (label, items, desc) => {
    const style = priorityStyles[label] || priorityStyles.P2;
    if (!items.length) {
      return `
        <div style="${style.card} margin-top:12px;">
          <div style="display:inline-flex; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; ${style.badge}">${label}</div>
          <div style="margin-top:8px; font-weight:700;">${desc}</div>
          <div style="margin-top:8px; color:#5b6b73;">暂无</div>
        </div>
      `;
    }
    return `
      <div style="${style.card} margin-top:12px;">
        <div style="display:inline-flex; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; ${style.badge}">${label}</div>
        <div style="margin-top:8px; font-weight:700;">${desc}</div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
          ${items.map((item) => `<div><strong>${item.country}</strong>（${item.weakerCount} 项低于平均值${item.weakerMetrics.length ? `：${item.weakerMetrics.join("、")}` : ""}）</div>`).join("")}
        </div>
      </div>
    `;
  };
  const tuningConclusion = !primaryTuningCountry || primaryTuningCountry.weakerCount === 0
    ? "当前达标国家在这批关键指标上没有明显的系统性落后项，暂时没有特别需要优先调优的国家。"
    : `
      <div><strong>优先建议先看 ${primaryTuningCountry.country}</strong>，它在第二点所选关键指标里有 <strong>${primaryTuningCountry.weakerCount}</strong> 项低于平均值。</div>
      ${formatPriorityGroup("P0", priorityBuckets.P0, "6-9 个指标低于平均值，建议优先处理")}
      ${formatPriorityGroup("P1", priorityBuckets.P1, "3-5 个指标低于平均值，建议排进下一轮优化")}
      ${formatPriorityGroup("P2", priorityBuckets.P2, "1-2 个指标低于平均值，先持续观察")}
      ${formatPriorityGroup("OK", priorityBuckets.OK, "0 个指标低于平均值，当前表现相对稳定")}
    `;
  const tuningCards = `
    <div class="stats-grid" style="grid-template-columns: 1fr; gap: 18px; margin-top: 14px;">
      <div class="stat-card" style="padding: 22px 24px;">
        <div class="eyebrow">结论</div>
        <div class="stat-title" style="font-size:20px; line-height:1.5; margin-bottom:8px;">本轮国家优化建议</div>
        <div class="muted" style="margin-top: 10px; line-height: 1.9;">${tuningConclusion}</div>
      </div>
    </div>
  `;

  const cards = [
    {
      eyebrow: "分析范围",
      title: "同项目分国家对比",
      value: `${analysis.compareValues.length || 0} 个国家`,
      desc: "固定项目、版本和日期后，比较不同国家的指标差距，优先找拖后腿的国家和指标。",
    },
    priorityCountry ? {
      eyebrow: "优先关注国家",
      title: priorityCountry[0],
      value: `${priorityCountry[1].count} 个指标偏弱`,
      desc: `当前更常出现在尾部的指标有：${priorityCountry[1].metrics.slice(0, 3).join("、")}。`,
    } : null,
    topGap ? {
      eyebrow: "最大国家差距",
      title: topGap.metric,
      value: `${topGap.worst?.subject || "NA"} 相对偏弱`,
      desc: `${topGap.best?.subject || "NA"} 与 ${topGap.worst?.subject || "NA"} 之间相差 ${topGap.kind === "rate" ? `${(topGap.diff * 100).toFixed(2)} pct` : formatMetric(topGap.metric, topGap.diff)}。`,
    } : null,
    {
      eyebrow: "样本范围",
      title: `${Math.round(maxSample).toLocaleString("zh-CN")} / ${Math.round(minSample).toLocaleString("zh-CN")}`,
      value: "最大国家 / 最小国家",
      desc: "国家分析先看新增用户数，再看质量指标；样本过小的国家只适合作为线索，不适合直接下结论。",
    },
    {
      eyebrow: "样本提醒",
      title: lowSampleCountries.length ? "部分国家样本偏少" : "国家样本基本可用",
      value: lowSampleCountries.length ? `${lowSampleCountries.length} 个国家低于门槛` : "可优先看质量差异",
      desc: lowSampleCountries.length
        ? `低于 ${MIN_CONCLUSION_SAMPLE} 新增用户的国家：${lowSampleCountries.map((item) => `${item.subject}(${Math.round(item.users)})`).join("、")}`
        : "当前国家对比更适合作为优化优先级参考。",
    },
  ].filter(Boolean);

  const rows = qualityInsights.slice(0, 6).map((item) => `
    <tr>
      <th>${item.metric}</th>
      <td>${item.worst?.subject || "NA"}</td>
      <td>${formatMetric(item.metric, item.worst?.value)}</td>
      <td>${Math.round(subjectStats.get(item.worst?.subject) || 0).toLocaleString("zh-CN")}</td>
      <td>${item.best?.subject || "NA"}</td>
      <td>${formatMetric(item.metric, item.best?.value)}</td>
      <td>${item.kind === "rate" ? `${(item.diff * 100).toFixed(2)} pct` : formatMetric(item.metric, item.diff)}</td>
    </tr>
  `).join("");
  const sampleRows = sortedSampleStats.map((item) => `
    <tr>
      <th>${item.subject}</th>
      <td>${Math.round(item.users).toLocaleString("zh-CN")}</td>
      <td>${isConclusionEligible(item.users) ? "可纳入结论" : "样本偏少，谨慎解读"}</td>
    </tr>
  `).join("");

  host.innerHTML = `
    <div class="narrative-block" style="margin-bottom: 18px;">
      <h3>第一点：先排除样本过少的国家</h3>
      ${sampleCards}
    </div>
    <div class="narrative-block">
      <h3>第二点：再分析样本达标国家的关键指标</h3>
      ${benchmarkNarrative}
    </div>
    <div class="narrative-block" style="margin-top: 18px;">
      <h3>第三点：输出调优结论</h3>
      ${tuningCards}
    </div>
  `;
}

function renderSingleProjectSummary(host, analysis) {
  const compareLabel = analysis.compareField;
  const comparedSubjects = analysis.compareValues.length
    ? analysis.compareValues
    : optionsForRows(analysis.compareBaseRows, analysis.compareField);
  const isVersionIteration = appState.activeWorkspace === "version_iteration" && compareLabel === "版本号";
  const isAdGroupIteration = appState.activeWorkspace === "adgroup_iteration" && compareLabel === "广告组";
  const isSubjectIteration = isVersionIteration || isAdGroupIteration;
  const subjectLabel = isAdGroupIteration ? "广告组" : "版本";
  const subjectField = compareLabel;
  const qualityInsights = analysis.eligibleInsights.filter((item) => item.metric !== "新增用户数");
  const bestOpportunity = qualityInsights[0] || null;
  const retentionMetric = analysis.eligibleInsights.find((item) => ["D1留存率", "D2留存率"].includes(item.metric));
  const sampleAssessment = analysis.sampleAssessment;
  const comparisonContext = evaluateProjectComparisonContext(analysis);
  const eligibleSubjects = analysis.subjectSampleStats.filter((item) => isConclusionEligible(item.users));
  const excludedSubjects = analysis.subjectSampleStats.filter((item) => !isConclusionEligible(item.users));
  const selectedDates = appState.filters["首次访问日期"]?.length
    ? appState.filters["首次访问日期"].slice()
    : optionsForRows(analysis.filteredRows, "首次访问日期");

  const versionIterationChecks = isSubjectIteration
    ? comparedSubjects.map((subject) => {
        const dateUsers = selectedDates.map((date) => {
          const scopedRows = analysis.filteredRows.filter((row) => row[subjectField] === subject && row["首次访问日期"] === date);
          const users = scopedRows.length
            ? aggregateRows(scopedRows, ["新增用户数"])?.["新增用户数"] || 0
            : 0;
          return { date, users };
        });
        const qualifiedDates = dateUsers.filter((item) => item.users > 200);
        const weakDates = dateUsers.filter((item) => item.users <= 200);
        return {
          subject,
          dateUsers,
          qualifiedDates,
          weakDates,
          qualified: qualifiedDates.length > 0,
        };
      })
    : [];
  const qualifiedVersionSubjects = versionIterationChecks.filter((item) => item.qualified);
  const lowSampleVersionSubjects = versionIterationChecks.filter((item) => !item.qualified);
  const qualifiedVersionDateMap = new Map(qualifiedVersionSubjects.map((item) => [item.subject, new Set(item.qualifiedDates.map((point) => point.date))]));
  const latestSelectedFirstVisitDate = selectedDates.length
    ? selectedDates.slice().sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true })).slice(-1)[0]
    : null;

  if (isSubjectIteration) {
    const qualifiedSubjects = qualifiedVersionSubjects.map((item) => item.subject);
    const metricInsights = sortCompareMetrics(analysis.compareMetrics.filter((metric) => metric !== "新增用户数"))
      .map((metric) => {
        const values = qualifiedSubjects.map((subject) => {
          let rows = analysis.filteredRows.filter((row) =>
            row[subjectField] === subject && qualifiedVersionDateMap.get(subject)?.has(row["首次访问日期"])
          );
          if (shouldExcludeLatestFirstVisit(metric) && latestSelectedFirstVisitDate) {
            rows = rows.filter((row) => row["首次访问日期"] !== latestSelectedFirstVisitDate);
          }
          const value = rows.length ? aggregateRows(rows, [metric])?.[metric] : null;
          return value === null || value === undefined || Number.isNaN(value) ? null : { subject, value };
        }).filter(Boolean);
        if (values.length < 2) {
          return null;
        }
        const lowerBetter = metric.includes("卸载率");
        const ranked = values.slice().sort((a, b) => lowerBetter ? a.value - b.value : b.value - a.value);
        const best = ranked[0];
        const worst = ranked[ranked.length - 1];
        return {
          metric,
          best,
          worst,
          lowerBetter,
          kind: dashboardData.metricMeta[metric]?.kind,
          diff: Math.abs((best?.value || 0) - (worst?.value || 0)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.diff - a.diff);

    const leadMap = new Map(qualifiedSubjects.map((subject) => [subject, []]));
    const weakMap = new Map(qualifiedSubjects.map((subject) => [subject, []]));
    metricInsights.forEach((item) => {
      leadMap.get(item.best.subject)?.push(item.metric);
      weakMap.get(item.worst.subject)?.push(item.metric);
    });

    const rankedVersions = qualifiedSubjects
      .map((subject) => ({
        subject,
        leads: leadMap.get(subject) || [],
        weak: weakMap.get(subject) || [],
      }))
      .sort((a, b) => {
        if (b.leads.length !== a.leads.length) return b.leads.length - a.leads.length;
        return a.weak.length - b.weak.length;
      });

    const bestVersion = rankedVersions[0] || null;
    const weakVersion = rankedVersions.slice().sort((a, b) => {
      if (b.weak.length !== a.weak.length) return b.weak.length - a.weak.length;
      return a.leads.length - b.leads.length;
    })[0] || null;

    const subjectNameForCard = (subject) => isAdGroupIteration
      ? subjectLabelHtml(subject, "adgroup-card-subject")
      : escapeAttr(subject);
    const metricCards = metricInsights.slice(0, 4).map((item) => `
      <div class="stat-card">
        <div class="eyebrow">关键指标差异</div>
        <div class="stat-title">${item.metric}</div>
        <div class="stat-value ${isAdGroupIteration ? "adgroup-card-result" : ""}">${subjectNameForCard(item.best.subject)} 更优</div>
        <div class="muted">
          ${subjectNameForCard(item.best.subject)}：${formatMetric(item.metric, item.best.value)}<br/>
          ${subjectNameForCard(item.worst.subject)}：${formatMetric(item.metric, item.worst.value)}<br/>
          差异：${item.kind === "rate" ? `${(item.diff * 100).toFixed(2)} pct` : formatMetric(item.metric, item.diff)}
        </div>
      </div>
    `).join("");

    const secondStepBlock = qualifiedSubjects.length < 2
      ? `
        <div class="empty-state">
          当前样本达标的${subjectLabel}不足 2 个，第二点暂时不输出${subjectLabel}优劣结论。
        </div>
      `
      : `
        <div class="stats-grid" style="margin-top:14px;">
          <div class="stat-card">
            <div class="eyebrow">综合判断</div>
            <div class="stat-title ${isAdGroupIteration ? "adgroup-card-title" : ""}">${bestVersion?.subject ? subjectNameForCard(bestVersion.subject) : "NA"}</div>
            <div class="stat-value">当前更优</div>
            <div class="muted">
              领先指标数：${bestVersion?.leads.length || 0}<br/>
              好在：${bestVersion?.leads.length ? bestVersion.leads.join("、") : "暂无明显领先指标"}
            </div>
          </div>
          <div class="stat-card">
            <div class="eyebrow">需要关注</div>
            <div class="stat-title ${isAdGroupIteration ? "adgroup-card-title" : ""}">${weakVersion?.subject ? subjectNameForCard(weakVersion.subject) : "NA"}</div>
            <div class="stat-value">相对偏弱</div>
            <div class="muted">
              落后指标数：${weakVersion?.weak.length || 0}<br/>
              主要短板：${weakVersion?.weak.length ? weakVersion.weak.join("、") : "暂无明显短板"}
            </div>
          </div>
          ${metricCards}
        </div>
      `;

    host.innerHTML = `
      <div class="narrative-block" style="margin-bottom: 18px;">
        <h3>第一点：先排除样本量过少的${subjectLabel}</h3>
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-top:14px;">
          <div class="stat-card" style="padding:22px 24px;">
            <div class="eyebrow">达标${subjectLabel}</div>
            <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${qualifiedVersionSubjects.length ? "可纳入结论" : `暂无达标${subjectLabel}`}</div>
            <div class="muted" style="line-height:1.9;">
              ${
                qualifiedVersionSubjects.length
                  ? qualifiedVersionSubjects.map((item) => {
                      const allQualified = item.weakDates.length === 0;
                      const qualifiedDateText = item.qualifiedDates.map((point) => `${point.date} ${Math.round(point.users).toLocaleString("zh-CN")}`).join("、");
                      return `<div><strong>${item.subject}</strong>：${allQualified ? `所选日期全部 > 200（${qualifiedDateText}）` : `仅使用 ${qualifiedDateText} 进行分析`}</div>`;
                    }).join("")
                  : `当前没有${subjectLabel}在所选日期里留下可分析的样本。`
              }
            </div>
          </div>
          <div class="stat-card" style="padding:22px 24px;">
            <div class="eyebrow">待排除${subjectLabel}</div>
            <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${lowSampleVersionSubjects.length ? "样本不足" : "无"}</div>
            <div class="muted" style="line-height:1.9;">
              ${
                lowSampleVersionSubjects.length
                  ? lowSampleVersionSubjects.map((item) => {
                      return `<div><strong>${item.subject}</strong>：${item.dateUsers.map((point) => `${point.date} ${Math.round(point.users).toLocaleString("zh-CN")}`).join("、")}</div>`;
                    }).join("")
                  : `当前所选${subjectLabel}都至少有一部分日期可进入分析。`
              }
            </div>
          </div>
        </div>
      </div>
      <div class="narrative-block">
        <h3>第二点：再分析样本达标${subjectLabel}的数据差异</h3>
        ${secondStepBlock}
      </div>
    `;
    return;
  }

  const cards = [
    {
      eyebrow: "分析范围",
      title: `${compareLabel} 内部对比`,
      value: `${comparedSubjects.length} 个主体`,
      desc: `当前在同一项目下比较 ${comparedSubjects.join("、")} 的表现。`,
    },
    {
      eyebrow: "对比口径",
      title: comparisonContext.label,
      value: comparisonContext.exactVersionCohort ? "可谈更优版本" : "看加权总体差异",
      desc: comparisonContext.detail,
    },
    sampleAssessment ? {
      eyebrow: "统计意义",
      title: sampleAssessment.title,
      value: sampleAssessment.level === "high" ? "可做判断" : sampleAssessment.level === "mid" ? "谨慎看结论" : "不宜下结论",
      desc: sampleAssessment.summary,
    } : null,
    {
      eyebrow: "结论纳入",
      title: `${eligibleSubjects.length} 个主体纳入`,
      value: excludedSubjects.length ? `${excludedSubjects.length} 个主体已排除` : "全部主体纳入",
      desc: excludedSubjects.length
        ? `样本低于 ${MIN_CONCLUSION_SAMPLE} 的主体不参与结论判断：${excludedSubjects.map((item) => `${item.subject}(${Math.round(item.users)})`).join("、")}`
        : `当前所有主体样本都达到 ${MIN_CONCLUSION_SAMPLE} 新增用户门槛。`,
    },
    bestOpportunity ? {
      eyebrow: comparisonContext.exactVersionCohort ? "最值得看" : "总体差异最大",
      title: bestOpportunity.metric,
      value: comparisonContext.exactVersionCohort
        ? `${bestOpportunity.best?.subject || "NA"} 更优`
        : `${bestOpportunity.best?.subject || "NA"} 加权总体较高`,
      desc: comparisonContext.exactVersionCohort
        ? `相对 ${bestOpportunity.worst?.subject || "NA"} 拉开 ${bestOpportunity.kind === "rate" ? `${(bestOpportunity.diff * 100).toFixed(2)} pct` : formatMetric(bestOpportunity.metric, bestOpportunity.diff)}。`
        : `当前跨度 ${bestOpportunity.kind === "rate" ? `${(bestOpportunity.diff * 100).toFixed(2)} pct` : formatMetric(bestOpportunity.metric, bestOpportunity.diff)}。${aggregateInterpretation(comparisonContext, bestOpportunity.metric)}`,
    } : null,
    retentionMetric ? {
      eyebrow: comparisonContext.exactVersionCohort ? "留存观察" : "留存总体差异",
      title: retentionMetric.metric,
      value: comparisonContext.exactVersionCohort
        ? `${retentionMetric.best?.subject || "NA"} 更稳`
        : `${retentionMetric.best?.subject || "NA"} 加权总体较高`,
      desc: comparisonContext.exactVersionCohort
        ? `留存最好 ${formatMetric(retentionMetric.metric, retentionMetric.best?.value)}，建议结合规模一起判断稳定性。`
        : `当前跨度 ${(retentionMetric.diff * 100).toFixed(2)} pct。${aggregateInterpretation(comparisonContext, retentionMetric.metric)}`,
    } : null,
  ].filter(Boolean);

  const focusRows = qualityInsights.slice(0, 4).map((item) => `
    <tr>
      <th>${item.metric}</th>
      <td>${comparisonContext.exactVersionCohort ? (item.best?.subject || "NA") : `汇总最高：${item.best?.subject || "NA"}`}</td>
      <td>${formatMetric(item.metric, item.best?.value)}</td>
      <td>${comparisonContext.exactVersionCohort ? (item.worst?.subject || "NA") : `汇总最低：${item.worst?.subject || "NA"}`}</td>
      <td>${formatMetric(item.metric, item.worst?.value)}</td>
      <td>${item.kind === "rate" ? `${(item.diff * 100).toFixed(2)} pct` : formatMetric(item.metric, item.diff)}</td>
      <td>${comparisonContext.exactVersionCohort ? "可结合明细做版本判断" : aggregateInterpretation(comparisonContext, item.metric)}</td>
    </tr>
  `).join("");

  const versionSampleCards = isVersionIteration
    ? `
      <div class="narrative-block" style="margin-bottom: 18px;">
        <h3>第一点：先排除样本量过少的版本</h3>
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-top:14px;">
          <div class="stat-card" style="padding:22px 24px;">
            <div class="eyebrow">达标版本</div>
            <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${qualifiedVersionSubjects.length ? "可纳入结论" : "暂无达标版本"}</div>
            <div class="muted" style="line-height:1.9;">
              ${
                qualifiedVersionSubjects.length
                  ? qualifiedVersionSubjects.map((item) => {
                      const allQualified = item.weakDates.length === 0;
                      const qualifiedDateText = item.qualifiedDates.map((point) => `${point.date} ${Math.round(point.users).toLocaleString("zh-CN")}`).join("、");
                      return `<div><strong>${item.subject}</strong>：${allQualified ? `所选日期全部 > 200（${qualifiedDateText}）` : `仅使用 ${qualifiedDateText} 进行分析`}</div>`;
                    }).join("")
                  : "当前没有版本在所选日期里留下可分析的样本。"
              }
            </div>
          </div>
          <div class="stat-card" style="padding:22px 24px;">
            <div class="eyebrow">待排除版本</div>
            <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${lowSampleVersionSubjects.length ? "样本不足" : "无"}</div>
            <div class="muted" style="line-height:1.9;">
              ${
                lowSampleVersionSubjects.length
                  ? lowSampleVersionSubjects.map((item) => {
                      return `<div><strong>${item.subject}</strong>：${item.dateUsers.map((point) => `${point.date} ${Math.round(point.users).toLocaleString("zh-CN")}`).join("、")}</div>`;
                    }).join("")
                  : "当前所选版本都至少有一部分日期可进入分析。"
              }
            </div>
          </div>
        </div>
      </div>
    `
    : "";

  const noConclusionBlock = !qualityInsights.length
    ? `
      <div class="empty-state">
        当前达到样本门槛的主体较少，结论区先不做优劣判断；下方明细仍会按当前筛选结果直接展示。
      </div>
    `
    : "";

  host.innerHTML = `
    ${versionSampleCards}
    <div class="stats-grid">
      ${cards.map((item) => `
        <div class="stat-card">
          <div class="eyebrow">${item.eyebrow}</div>
          <div class="stat-title">${item.title}</div>
          <div class="stat-value">${item.value}</div>
          <div class="muted">${item.desc}</div>
        </div>
      `).join("")}
    </div>
    <div class="hint">
      <strong>建议先看这几项：</strong> 先判断样本量够不够；只有单国家、单日期下的版本对比，才适合谨慎谈“更优版本”。其余口径统一按加权汇总来理解：新增用户数求和，率类和均值类按新增用户数加权。
    </div>
    ${noConclusionBlock}
    ${qualityInsights.length ? `
      <div class="table-wrap">
        <table class="metric-table">
          <thead>
            <tr>
              <th>重点指标</th>
              <th>${comparisonContext.exactVersionCohort ? "更优主体" : "加权总体较高"}</th>
              <th>${comparisonContext.exactVersionCohort ? "更优值" : "加权值"}</th>
              <th>${comparisonContext.exactVersionCohort ? "较弱主体" : "加权总体较低"}</th>
              <th>${comparisonContext.exactVersionCohort ? "较弱值" : "加权值"}</th>
              <th>跨度</th>
              <th>解读</th>
            </tr>
          </thead>
          <tbody>${focusRows}</tbody>
        </table>
      </div>
    ` : ""}
  `;
}

function renderCountryStructure(analysis) {
  const host = document.querySelector("#country-structure");
  if (!analysis.countryStructure.length || appState.countryMode !== "multi_country") {
    host.innerHTML = "";
    return;
  }
  host.innerHTML = `
    <div class="panel-title">
      <div>
        <h2>国家结构提示</h2>
        <p class="muted">帮助判断结果差异里，有多少可能来自国家买量结构差异。</p>
      </div>
    </div>
    <div class="structure-grid">
      ${analysis.countryStructure.map((item) => `
        <article class="structure-card">
          <div class="compare-title">${item.subject}</div>
          <div class="muted">新增用户 ${Math.round(item.totalUsers).toLocaleString("zh-CN")}</div>
          <div class="structure-list">
            ${item.countryStats.map((stat) => `
              <div class="structure-row">
                <span>${stat.country}</span>
                <span>${(stat.share * 100).toFixed(1)}%</span>
              </div>
            `).join("")}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderCompareDetails(analysis) {
  const host = document.querySelector("#compare-details");
  if (appState.activeWorkspace === "paid_country") {
    host.innerHTML = "";
    return;
  }
  if (!analysis.groups.length) {
    host.innerHTML = `<div class="empty-state">当前筛选下没有数据明细。</div>`;
    return;
  }
  const selectedLatestFirstVisitDate = appState.filters["首次访问日期"]?.length
    ? appState.filters["首次访问日期"].slice().sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true })).slice(-1)[0]
    : null;
  const metricsForSummary = uniqueArray(appState.activeWorkspace === "country_opt"
    ? sortCompareMetrics(["新增用户数", ...analysis.compareMetrics.filter((metric) => metric !== "新增用户数")])
    : sortCompareMetrics(analysis.compareMetrics));
  const metricsForCountryNarrative = metricsForSummary.filter((metric) => metric !== "新增用户数");
  let summaryBlock = "";
  let trendBlock = "";
  if (appState.activeWorkspace === "country_opt" && analysis.compareField === "国家") {
    const compareRows = analysis.filteredRows.filter((row) => analysis.compareValues.includes(row[analysis.compareField]));
    const selectedFirstVisitDates = appState.filters["首次访问日期"]?.length
      ? appState.filters["首次访问日期"].slice()
      : [...new Set(compareRows.map((row) => row["首次访问日期"]))].sort();
    const benchmarkMetricOrder = [
      "D1留存率",
      "卸载率_D0",
      "通知授权率_D0",
      "通知展示率_D0",
      "人均展示次数_D0",
      "通知点击率_D0",
      "人均点击次数_D0",
      "常驻通知栏点击率_D0",
      "常驻通知栏人均点击次数_D0",
    ];
    const benchmarkRows = analysis.filteredRows;
    const formatCountryMetricList = (items) => {
      if (!items.length) {
        return "无";
      }
      return `
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
          ${items.map((item) => `<div><strong>${item.country}</strong>（${formatMetric(item.metric, item.value)}）</div>`).join("")}
        </div>
      `;
    };
    const benchmarkMetrics = benchmarkMetricOrder
      .filter((metric) => analysis.compareMetrics.includes(metric))
      .map((metric) => {
        const metricRows = shouldExcludeLatestFirstVisit(metric) && selectedFirstVisitDates.length
          ? benchmarkRows.filter((row) => row["首次访问日期"] !== selectedFirstVisitDates[selectedFirstVisitDates.length - 1])
          : benchmarkRows;
        const overall = aggregateRows(metricRows, [metric])?.[metric];
        const countryValues = analysis.compareValues.map((country) => {
          const rows = compareRows.filter((row) => row["国家"] === country);
          const dateMetricValues = selectedFirstVisitDates
            .map((date) => {
              if (shouldExcludeLatestFirstVisit(metric) && date === selectedFirstVisitDates[selectedFirstVisitDates.length - 1]) {
                return null;
              }
              const dateRows = rows.filter((row) => row["首次访问日期"] === date);
              return aggregateRows(dateRows, [metric])?.[metric];
            })
            .filter((value) => value !== null && value !== undefined);
          const value = dateMetricValues.length
            ? dateMetricValues.reduce((sum, current) => sum + current, 0) / dateMetricValues.length
            : null;
          return { country, value, metric };
        }).filter((item) => item.value !== null && item.value !== undefined);
        const lowerBetter = metric === "卸载率_D0";
        const better = lowerBetter
          ? countryValues.filter((item) => item.value < overall)
          : countryValues.filter((item) => item.value > overall);
        const weaker = lowerBetter
          ? countryValues.filter((item) => item.value > overall)
          : countryValues.filter((item) => item.value < overall);
        return { metric, overall, better, weaker, lowerBetter };
      });
    const trendMetricOptions = sortCompareMetrics(analysis.compareMetrics.slice());
    if (!appState.countryOptTrendMetric || !trendMetricOptions.includes(appState.countryOptTrendMetric)) {
      appState.countryOptTrendMetric = trendMetricOptions[0] || null;
    }
    const selectedTrendMetric = appState.countryOptTrendMetric;
    const selectedTrendBenchmark = benchmarkMetrics.find((item) => item.metric === selectedTrendMetric) || null;
    const trendDates = selectedFirstVisitDates
      .filter((date) => !(shouldExcludeLatestFirstVisit(selectedTrendMetric) && date === selectedFirstVisitDates[selectedFirstVisitDates.length - 1]));
    const trendCountries = analysis.compareValues.filter((country) => {
      const rows = compareRows.filter((row) => row["国家"] === country);
      return trendDates.some((date) => rows.some((row) => row["首次访问日期"] === date));
    });
    const trendSeries = trendCountries.map((country) => {
      const rows = compareRows.filter((row) => row["国家"] === country);
      const points = trendDates.map((date) => {
        const dateRows = rows.filter((row) => row["首次访问日期"] === date);
        return {
          date,
          value: dateRows.length ? aggregateRows(dateRows, [selectedTrendMetric])?.[selectedTrendMetric] : null,
        };
      });
      return { country, points };
    }).filter((item) => item.points.some((point) => point.value !== null && point.value !== undefined));
    const trendCountryAverages = trendSeries
      .map((series) => {
        const values = series.points
          .map((point) => point.value)
          .filter((value) => value !== null && value !== undefined && !Number.isNaN(value));
        return values.length
          ? {
              country: series.country,
              value: values.reduce((sum, current) => sum + current, 0) / values.length,
            }
          : null;
      })
      .filter(Boolean);
    const selectedTrendCountryCards = selectedTrendBenchmark
      ? trendSeries.map((series) => {
          const benchmarkRow = trendCountryAverages.find((item) => item.country === series.country) || null;
          const currentValue = benchmarkRow?.value ?? null;
          const peerValues = trendCountryAverages
            .filter((item) => item.country !== series.country)
            .map((item) => item.value)
            .filter((value) => value !== null && value !== undefined && !Number.isNaN(value));
          const peerAvg = peerValues.length
            ? peerValues.reduce((sum, current) => sum + current, 0) / peerValues.length
            : null;
          const sortedByValue = trendCountryAverages
            .slice()
            .sort((a, b) => {
              if (selectedTrendBenchmark.lowerBetter) {
                return a.value - b.value;
              }
              return b.value - a.value;
            });
          const rank = sortedByValue.findIndex((item) => item.country === series.country) + 1;
          const validPoints = series.points.filter((point) => point.value !== null && point.value !== undefined && !Number.isNaN(point.value));
          const firstPoint = validPoints[0] || null;
          const lastPoint = validPoints[validPoints.length - 1] || null;
          const horizontalText = currentValue !== null && peerAvg !== null
            ? (() => {
                const better = selectedTrendBenchmark.lowerBetter ? currentValue < peerAvg : currentValue > peerAvg;
                const status = better ? "横向更优" : "横向偏弱";
                return `${status}：${series.country} 的均值 ${formatMetric(selectedTrendMetric, currentValue)}，其余国家均值 ${formatMetric(selectedTrendMetric, peerAvg)}，当前排第 ${rank}/${sortedByValue.length}。`;
              })()
            : "横向对比：当前样本不足，暂时无法稳定比较。";
          const verticalText = firstPoint && lastPoint && validPoints.length >= 2
            ? (() => {
                const delta = lastPoint.value - firstPoint.value;
                const trendWord = delta > 0
                  ? "上升"
                  : delta < 0
                  ? "下降"
                  : "基本持平";
                return `纵向变化：${firstPoint.date} ${formatMetric(selectedTrendMetric, firstPoint.value)} → ${lastPoint.date} ${formatMetric(selectedTrendMetric, lastPoint.value)}，整体${trendWord}${formatMetric(selectedTrendMetric, Math.abs(delta))}。`;
              })()
            : "纵向变化：当前只选了 1 个有效日期，暂时看不出明显趋势。";
          return `
            <div class="stat-card" style="padding:22px 24px;">
              <div class="eyebrow">国家结论</div>
              <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${series.country}</div>
              <div class="muted" style="line-height:1.9;">
                <div>${horizontalText}</div>
                <div style="margin-top:10px;">${verticalText}</div>
              </div>
            </div>
          `;
        }).join("")
      : "";
    const selectedTrendConclusion = selectedTrendBenchmark
      ? `
        <div class="narrative-block" style="margin-top:18px;">
          <h3>${selectedTrendMetric} 的国家结论</h3>
          <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-top:14px;">
            ${selectedTrendCountryCards}
          </div>
        </div>
      `
      : `
        <div class="empty-state">当前选中的指标还没有足够的数据，暂时无法输出国家结论。</div>
      `;
    trendBlock = selectedTrendMetric
      ? `
        <div class="narrative-block" style="margin-bottom: 18px;">
          <h3>按指标看国家趋势</h3>
          <div class="stat-card" style="padding:22px 24px; margin-top:14px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
              <div>
                <div class="eyebrow">指标切换</div>
                <div class="stat-title" style="font-size:22px; line-height:1.35; margin-top:6px;">${selectedTrendMetric}</div>
              </div>
              <div>
                <select id="country-opt-trend-metric" style="min-width:220px; border:1px solid rgba(86,102,115,0.18); border-radius:12px; padding:10px 14px; font-size:14px; background:#fff;">
                  ${trendMetricOptions.map((metric) => `<option value="${metric}" ${metric === selectedTrendMetric ? "selected" : ""}>${metric}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="chart-legend" style="margin-top:14px; margin-bottom:8px;">
              ${trendSeries.map((item, index) => `
                <span class="chart-legend-item">
                  <i style="background:${SERIES_COLORS[index % SERIES_COLORS.length]}"></i>${item.country}
                </span>
              `).join("")}
            </div>
            ${countryOptMetricLineChartSvg(selectedTrendMetric, trendDates, trendSeries)}
          </div>
          ${selectedTrendConclusion}
        </div>
      `
      : "";
    summaryBlock = trendBlock;
  }
  const shouldSortDetailGroupsByLatestDate = ["cross_project", "version_iteration"].includes(appState.activeWorkspace);
  const detailGroups = shouldSortDetailGroupsByLatestDate
    ? analysis.groups.slice().sort((a, b) => {
        const aDateLabel = a.labels.find((label) => label.startsWith("首次访问日期:")) || "";
        const bDateLabel = b.labels.find((label) => label.startsWith("首次访问日期:")) || "";
        const aDate = aDateLabel.split(":")[1]?.trim() || "";
        const bDate = bDateLabel.split(":")[1]?.trim() || "";
        const dateDiff = String(bDate).localeCompare(String(aDate), "zh-Hans-CN", { numeric: true });
        if (dateDiff !== 0) return dateDiff;
        return (b.strongestDiff?.diff || 0) - (a.strongestDiff?.diff || 0);
      })
    : analysis.groups;
  const cards = detailGroups.slice(0, 18).map((group) => {
    const isAdGroupCompareTable = analysis.compareField === "广告组";
    const selectedContext = [];
    const selectedCountry = appState.filters["国家"]?.length === 1 ? appState.filters["国家"][0] : null;
    const selectedVersion = appState.filters["版本号"]?.length === 1 ? appState.filters["版本号"][0] : null;
    if (
      selectedCountry &&
      selectedCountry !== "全部" &&
      analysis.compareField !== "国家" &&
      !group.labels.some((label) => label.startsWith("国家:"))
    ) {
      selectedContext.push(`国家：${selectedCountry}`);
    }
    if (
      selectedVersion &&
      selectedVersion !== "全部" &&
      analysis.compareField !== "版本号" &&
      !group.labels.some((label) => label.startsWith("版本号:"))
    ) {
      selectedContext.push(`版本号：${selectedVersion}`);
    }
    const titleSuffix = selectedContext.length ? `（${selectedContext.join("，")}）` : "";
    const metricsForTable = metricsForSummary;
    const subjectCount = group.validSubjects.length;
    const comparisonColumns = comparisonColumnsForSubjects(subjectCount);
    const metricRows = metricsForTable.map((metric) => {
      const comparisonInfo = comparisonCellsForMetric(
        group.validSubjects,
        metric,
        (subject) => group.aggregated[subject]?.[metric],
        formatMetric
      );
      const values = group.validSubjects.map((subject) => {
        const value = group.aggregated[subject][metric];
        const cellClass = comparisonInfo.valueClasses.get(subject) || "";
        return `<td class="${cellClass}">${formatMetric(metric, value)}</td>`;
      }).join("");
      const rowClass = group.strongestDiff?.metric === metric || (appState.activeWorkspace === "country_opt" && metric === "新增用户数")
        ? "highlight-row"
        : "";
      return `
        <tr class="${rowClass}">
          <th>${metric}</th>
          ${values}
          ${comparisonInfo.cells}
        </tr>
      `;
    }).join("");

    return `
      <article class="compare-card">
        <div class="compare-head">
          <div>
            <div class="compare-title">${group.labels.length ? group.labels.join(" / ") : "全量分组"}${titleSuffix}</div>
          </div>
          <div class="pill">${analysis.compareField} 对比</div>
        </div>
        <div class="table-wrap ${isAdGroupCompareTable ? "compact-table-wrap" : ""}">
          <table class="metric-table ${isAdGroupCompareTable ? "compact-compare-table adgroup-compare-table" : ""}">
            <thead>
              <tr>
                <th>指标</th>
                ${group.validSubjects.map((subject) => `<th>${isAdGroupCompareTable ? subjectLabelHtml(subject, "thead-subject-label") : subject}</th>`).join("")}
                ${comparisonColumns}
              </tr>
            </thead>
            <tbody>${metricRows}</tbody>
          </table>
        </div>
      </article>
    `;
  }).join("");
  host.innerHTML = summaryBlock + cards;
  const trendMetricSelect = host.querySelector("#country-opt-trend-metric");
  if (trendMetricSelect) {
    trendMetricSelect.onchange = (event) => {
      appState.countryOptTrendMetric = event.target.value;
      rerender();
    };
  }
}

function computeFunnelData() {
  const compareField = funnelAvailableCompareFields().includes(appState.funnelCompareField)
    ? appState.funnelCompareField
    : "项目代号";
  appState.funnelCompareField = compareField;
  const filters = {
    报表日期: appState.funnelDate,
    项目代号: compareField === "项目代号" ? [] : (appState.funnelProject ? [appState.funnelProject] : []),
    首次访问日期: appState.funnelFirstVisitDate,
    国家: appState.funnelCountry,
    版本号: compareField === "版本号" ? [] : appState.funnelVersion,
  };
  const rows = applyDimensionFilters(dashboardData.main.rows, filters);
  const compareCandidates = compareCandidateValues(rows, compareField);
  const compareValues = appState.funnelCompareValues.length
    ? appState.funnelCompareValues.filter((value) => compareCandidates.includes(value))
    : compareCandidates;
  appState.funnelCompareValues = compareValues;
  const metrics = appState.funnelMetrics.slice();
  const subjects = compareValues
    .map((subject) => ({
      subject,
      rows: rows.filter((row) => row[compareField] === subject),
    }))
    .filter((item) => item.rows.length)
    .map((item) => ({
      subject: item.subject,
      aggregated: aggregateRows(item.rows, metrics),
      rows: item.rows,
    }));
  return { rows, metrics, compareField, subjects, aggregated: subjects[0]?.aggregated || null };
}

function stagePercent(metric, value) {
  const kind = dashboardData.metricMeta[metric]?.kind;
  if (kind === "rate") {
    return value * 100;
  }
  return value;
}

function timingChartSvg(metric, timingBreakdown, subjects) {
  const sortedBreakdown = timingBreakdown
    .slice()
    .sort((a, b) => {
      const avgForGroup = (group) => {
        const values = group.subjects
          .map((item) => item.aggregated?.[metric])
          .filter((value) => value !== null && value !== undefined && !Number.isNaN(value));
        if (!values.length) {
          return -Infinity;
        }
        return values.reduce((sum, value) => sum + value, 0) / values.length;
      };
      return avgForGroup(b) - avgForGroup(a);
    });
  const width = 760;
  const labelGroups = sortedBreakdown.map((item) => TIMING_SHORT_LABELS[item.timing] || [item.timing]);
  const maxLabelChars = Math.max(...labelGroups.flat().map((line) => line.length), 4);
  const maxLabelLines = Math.max(...labelGroups.map((lines) => lines.length), 1);
  const rowHeight = Math.max(subjects.length * 26 + 18, 54 + (maxLabelLines - 1) * 10);
  const height = Math.max(280, sortedBreakdown.length * rowHeight + 66);
  const padLeft = Math.min(230, Math.max(150, maxLabelChars * 11 + 36));
  const padRight = 72;
  const padTop = 22;
  const padBottom = 34;
  const chartWidth = width - padLeft - padRight;
  const categories = sortedBreakdown.map((item) => item.timing);
  const valueRows = sortedBreakdown.flatMap((group) =>
    subjects.map((subject) => {
      const found = group.subjects.find((item) => item.subject === subject.subject);
      return found ? found.aggregated[metric] : null;
    })
  ).filter((value) => value !== null && value !== undefined);

  if (!categories.length || !valueRows.length) {
    return `<div class="empty-state">当前筛选下没有 ${metric} 的图表数据。</div>`;
  }

  const maxValue = Math.max(...valueRows);
  const scaleMin = 0;
  const scaleMax = maxValue > 0 ? maxValue * 1.18 : 1;

  const xForValue = (value) => (
    padLeft + chartWidth * ((value - scaleMin) / (scaleMax - scaleMin))
  );
  const yForIndex = (index) => (
    padTop + rowHeight * index + rowHeight / 2
  );

  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, index) => scaleMin + (scaleMax - scaleMin) * (index / (tickCount - 1)));
  const grids = yTicks.map((tick) => {
    const x = xForValue(tick);
    return `
      <line x1="${x}" y1="${padTop}" x2="${x}" y2="${height - padBottom}" class="chart-grid-line" />
      <text x="${x}" y="${height - 10}" text-anchor="middle" class="chart-axis-text">${formatMetric(metric, tick)}</text>
    `;
  }).join("");

  const xLabels = categories.map((label, index) => {
    const y = yForIndex(index);
    const shortLines = labelGroups[index];
    return `
      <text x="${padLeft - 10}" y="${y - (shortLines.length - 1) * 6}" text-anchor="end" class="chart-axis-text chart-y-label">
        ${shortLines.map((line, lineIndex) => `<tspan x="${padLeft - 10}" dy="${lineIndex === 0 ? 0 : 12}">${line}</tspan>`).join("")}
      </text>
    `;
  }).join("");

  const compactMetricValue = (value) => {
    const kind = dashboardData.metricMeta[metric]?.kind;
    if (kind === "rate") {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (Math.abs(value) >= 100) {
      return `${Math.round(value)}`;
    }
    return value.toFixed(2);
  };

  const clusterHeight = Math.min(rowHeight * 0.72, Math.max(subjects.length * 16, 28));
  const barGap = 4;
  const barHeight = Math.max((clusterHeight - barGap * (subjects.length - 1)) / Math.max(subjects.length, 1), 8);

  const bars = sortedBreakdown.map((group, groupIndex) => {
    const centerY = yForIndex(groupIndex);
    const startY = centerY - clusterHeight / 2;
    return subjects.map((subject, subjectIndex) => {
      const found = group.subjects.find((item) => item.subject === subject.subject);
      if (!found) return "";
      const value = found.aggregated[metric];
      const x = padLeft;
      const y = startY + subjectIndex * (barHeight + barGap);
      const barWidth = Math.max(xForValue(value) - padLeft, 2);
      const color = SERIES_COLORS[subjectIndex % SERIES_COLORS.length];
      const preferOutside = x + barWidth + 8 <= width - padRight + 20;
      const valueX = preferOutside ? x + barWidth + 6 : x + barWidth - 6;
      const valueAnchor = preferOutside ? "start" : "end";
      const valueClass = `chart-value-text${preferOutside ? "" : " chart-value-text-inner"}`;
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" />
        <text x="${valueX}" y="${y + barHeight / 2 + 4}" text-anchor="${valueAnchor}" class="${valueClass}">${compactMetricValue(value)}</text>
      `;
    }).join("");
  }).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="timing-chart-svg" role="img" aria-label="${metric} 项目对比图">
      ${grids}
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${height - padBottom}" class="chart-axis-line" />
      <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" class="chart-axis-line" />
      ${bars}
      ${xLabels}
    </svg>
  `;
}

function timingOverviewGridClass(count) {
  if (count >= 4) {
    return "timing-overview-grid wide";
  }
  if (count >= 2) {
    return "timing-overview-grid medium";
  }
  return "timing-overview-grid";
}

function renderFunnel() {
  const host = document.querySelector("#funnel-stage-list");
  const meta = document.querySelector("#funnel-meta");
  const { rows, metrics, compareField, subjects, aggregated } = computeFunnelData();
  if (!rows.length || !subjects.length || !aggregated) {
    host.innerHTML = `<div class="empty-state">漏斗筛选下没有数据。</div>`;
    meta.innerHTML = "";
    return;
  }

  if (subjects.length === 1) {
    const normalizedBase = Math.max(...metrics.map((metric) => Math.max(stagePercent(metric, aggregated[metric] || 0), 0.0001)));
    const stages = metrics.map((metric, index) => {
      const value = aggregated[metric];
      const width = Math.max((stagePercent(metric, value || 0) / normalizedBase) * 100, 6);
      const prevMetric = index > 0 ? metrics[index - 1] : null;
      const prevValue = prevMetric ? stagePercent(prevMetric, aggregated[prevMetric] || 0) : null;
      const currentValue = stagePercent(metric, value || 0);
      const ratio = prevValue ? currentValue / prevValue : null;
      return `
        <div class="funnel-row">
          <div class="funnel-label">
            <div class="stage-index">${index + 1}</div>
            <div>
              <div class="stage-name">${metric}</div>
              <div class="muted">${formatMetric(metric, value)}</div>
            </div>
          </div>
          <div class="funnel-bar-shell">
            <div class="funnel-bar" style="width:${width}%"></div>
          </div>
          <div class="funnel-ratio">${ratio ? `${(ratio * 100).toFixed(1)}%` : "基准"}</div>
        </div>
      `;
    }).join("");
    host.innerHTML = stages;
  } else {
    const cards = subjects.map((subject) => {
      const normalizedBase = Math.max(...metrics.map((metric) => Math.max(stagePercent(metric, subject.aggregated[metric] || 0), 0.0001)));
      const stages = metrics.map((metric, index) => {
        const value = subject.aggregated[metric];
        const width = Math.max((stagePercent(metric, value || 0) / normalizedBase) * 100, 6);
        const prevMetric = index > 0 ? metrics[index - 1] : null;
        const prevValue = prevMetric ? stagePercent(prevMetric, subject.aggregated[prevMetric] || 0) : null;
        const currentValue = stagePercent(metric, value || 0);
        const ratio = prevValue ? currentValue / prevValue : null;
        return `
          <div class="funnel-row compact">
            <div class="funnel-label">
              <div class="stage-index">${index + 1}</div>
              <div>
                <div class="stage-name">${metric}</div>
                <div class="muted">${formatMetric(metric, value)}</div>
              </div>
            </div>
            <div class="funnel-bar-shell">
              <div class="funnel-bar" style="width:${width}%"></div>
            </div>
            <div class="funnel-ratio">${ratio ? `${(ratio * 100).toFixed(1)}%` : "基准"}</div>
          </div>
        `;
      }).join("");
      return `
        <article class="compare-card">
          <div class="compare-head">
            <div>
              <div class="compare-title">${subject.subject}</div>
              <div class="muted">${compareField} 对比漏斗</div>
            </div>
          </div>
          ${stages}
        </article>
      `;
    }).join("");
    host.innerHTML = `<div class="funnel-compare-grid">${cards}</div>`;
  }
  meta.innerHTML = `
    <div class="hint">
      当前按 <strong>${compareField}</strong> 对比漏斗，使用 ${rows.length} 条底层记录聚合。率类和均值类延续当前页面的加权口径。
    </div>
  `;
}

function computeTimingData() {
  const compareField = timingAvailableCompareFields().includes(appState.timingCompareField)
    ? appState.timingCompareField
    : "项目代号";
  appState.timingCompareField = compareField;
  const filters = {
    报表日期: appState.timingReportDate,
    项目代号: appState.timingProject,
    首次访问日期: appState.timingFirstVisitDate,
    国家: appState.timingCountry,
    版本号: appState.timingVersion,
    分析类型: [activeTimingAnalysisType()],
    通知时机: appState.timingTiming,
  };
  const rows = dashboardData.timing.rows.filter((row) =>
    Object.entries(filters).every(([field, allowed]) => {
      if (!dashboardData.timing.dimensions.includes(field)) {
        return true;
      }
      if (!allowed.length) {
        return true;
      }
      if (isAggregateSelection(allowed)) {
        return row[field] === "全部";
      }
      return allowed.includes(row[field]);
    })
  );
  const compareCandidates = compareCandidateValues(rows, compareField);
  const compareValues = compareCandidates;
  appState.timingCompareValues = compareValues;
  const subjects = compareValues
    .map((subject) => {
      const subjectRows = rows.filter((row) => row[compareField] === subject);
      return {
        subject,
        rows: subjectRows,
        aggregated: aggregateRows(subjectRows, dashboardData.timing.metrics),
      };
    })
    .filter((item) => item.rows.length && item.aggregated);
  const timingBreakdown = appState.timingTiming
    .filter((timing) => timing !== "全部")
    .map((timing) => {
      const timingSubjects = compareValues
        .map((subject) => {
          const timingRows = rows.filter((row) => row["通知时机"] === timing && row[compareField] === subject);
          return {
            subject,
            rows: timingRows,
            aggregated: timingRows.length ? aggregateRows(timingRows, dashboardData.timing.metrics) : null,
          };
        })
        .filter((item) => item.aggregated);
      return {
        timing,
        subjects: timingSubjects,
      };
    })
    .filter((item) => item.subjects.length);
  const detailDimensions = appState.timingGroupDimensions.filter((field) => dashboardData.timing.dimensions.includes(field));
  const detailGroupMap = new Map();
  rows.forEach((row) => {
    const labels = [...detailDimensions.map((field) => `${field}: ${row[field] || "全部"}`), `${activeTimingObjectLabel()}: ${row["通知时机"] || "全部"}`];
    const key = JSON.stringify(labels);
    if (!detailGroupMap.has(key)) {
      detailGroupMap.set(key, {
        key,
        labels,
        subjectRows: {},
      });
    }
    const group = detailGroupMap.get(key);
    const subject = row[compareField];
    if (!group.subjectRows[subject]) {
      group.subjectRows[subject] = [];
    }
    group.subjectRows[subject].push(row);
  });
  const detailGroups = [...detailGroupMap.values()]
    .map((group) => ({
      ...group,
      subjects: compareValues
        .map((subject) => {
          const subjectRows = group.subjectRows[subject] || [];
          return {
            subject,
            rows: subjectRows,
            aggregated: subjectRows.length ? aggregateRows(subjectRows, dashboardData.timing.metrics) : null,
          };
        })
        .filter((item) => item.aggregated),
    }))
    .filter((group) => group.subjects.length)
    .sort((a, b) => {
      const aDate = a.labels.find((label) => label.startsWith("首次访问日期:"))?.split(":")[1]?.trim() || "";
      const bDate = b.labels.find((label) => label.startsWith("首次访问日期:"))?.split(":")[1]?.trim() || "";
      const dateDiff = String(bDate).localeCompare(String(aDate), "zh-Hans-CN", { numeric: true });
      if (dateDiff !== 0) return dateDiff;
      return a.labels.join(" / ").localeCompare(b.labels.join(" / "), "zh-Hans-CN", { numeric: true });
    });
  return { rows, subjects, timingBreakdown, detailGroups, compareField };
}

function buildTimingOverview(rows, subjects, timingBreakdown, compareField) {
  const objectLabel = activeTimingObjectLabel();
  const selectedDates = appState.timingFirstVisitDate?.length
    ? appState.timingFirstVisitDate.slice()
    : timingOptionsFor("首次访问日期");
  const dateProjectChecks = subjects.map((subject) => {
    const dateUsers = selectedDates.map((date) => {
      const subjectRows = rows.filter((row) => row[compareField] === subject.subject && row["首次访问日期"] === date);
      const users = subjectRows.length ? (aggregateRows(subjectRows, ["新增用户数"])?.["新增用户数"] || 0) : 0;
      return { date, users };
    });
    return {
      subject: subject.subject,
      dateUsers,
      qualifiedDates: dateUsers.filter((item) => item.users > 200),
      weakDates: dateUsers.filter((item) => item.users <= 200),
    };
  });

  const qualifiedProjects = dateProjectChecks.filter((item) => item.qualifiedDates.length);
  const excludedProjects = dateProjectChecks.filter((item) => !item.qualifiedDates.length);
  const qualifiedDateMap = new Map(qualifiedProjects.map((item) => [item.subject, new Set(item.qualifiedDates.map((point) => point.date))]));

  const firstStepBlock = `
    <div class="narrative-block" style="margin-bottom:18px;">
      <h3>第一点：先排除样本量过少的日期</h3>
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-top:14px;">
        <div class="stat-card" style="padding:22px 24px;">
          <div class="eyebrow">纳入分析</div>
          <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${qualifiedProjects.length ? "可参与判断" : "暂无达标数据"}</div>
          <div class="muted" style="line-height:1.9;">
            ${
              qualifiedProjects.length
                ? qualifiedProjects.map((item) => `<div><strong>${item.subject}</strong>：${item.qualifiedDates.map((point) => point.date).join("、")}</div>`).join("")
                : `当前所选${compareField}在所选日期里都没有 > 200 的新增用户样本。`
            }
          </div>
        </div>
        <div class="stat-card" style="padding:22px 24px;">
          <div class="eyebrow">已排除日期</div>
          <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${dateProjectChecks.some((item) => item.weakDates.length) ? "低样本日期已剔除" : "无"}</div>
          <div class="muted" style="line-height:1.9;">
            ${
              dateProjectChecks.some((item) => item.weakDates.length)
                ? dateProjectChecks.filter((item) => item.weakDates.length).map((item) => `<div><strong>${item.subject}</strong>：${item.weakDates.map((point) => `${point.date} ${Math.round(point.users)}`).join("、")}</div>`).join("")
                : "当前所有所选日期都达到 200 新增用户门槛。"
            }
          </div>
        </div>
      </div>
    </div>
  `;

  if (qualifiedProjects.length === 0) {
    return {
      summaryHtml: `
        ${firstStepBlock}
        <div class="narrative-block">
          <h3>第二点：数据结论</h3>
          <div class="stat-card" style="padding:22px 24px; margin-top:14px;">
            <div class="empty-state">当前没有可用于${objectLabel}结论判断的样本。</div>
          </div>
        </div>
      `,
    };
  }

  const qualifiedRows = rows.filter((row) => qualifiedDateMap.get(row[compareField])?.has(row["首次访问日期"]));
  const displayMetric = "D0展示用户率";
  const clickMetric = "D0通知点击率";

  let secondStepBlock = "";
  if (qualifiedProjects.length === 1) {
    const subject = qualifiedProjects[0].subject;
    const timingValues = timingBreakdown
      .map((item) => {
        const subjectData = item.subjects.find((entry) => entry.subject === subject);
        if (!subjectData?.aggregated) return null;
        return {
          timing: item.timing,
          display: subjectData.aggregated[displayMetric],
          click: subjectData.aggregated[clickMetric],
        };
      })
      .filter(Boolean);

    const displayRanked = timingValues.slice().sort((a, b) => (b.display || 0) - (a.display || 0));
    const clickRanked = timingValues.slice().sort((a, b) => (b.click || 0) - (a.click || 0));
    const bestDisplay = displayRanked[0] || null;
    const weakDisplay = displayRanked[displayRanked.length - 1] || null;
    const bestClick = clickRanked[0] || null;
    const weakClick = clickRanked[clickRanked.length - 1] || null;

    secondStepBlock = `
      <div class="stats-grid" style="margin-top:14px;">
        <div class="stat-card">
          <div class="eyebrow">展示率更好</div>
          <div class="stat-title">${bestDisplay?.timing || "NA"}</div>
          <div class="stat-value">${bestDisplay ? formatMetric(displayMetric, bestDisplay.display) : "NA"}</div>
          <div class="muted">相对偏弱：${weakDisplay?.timing || "NA"}（${weakDisplay ? formatMetric(displayMetric, weakDisplay.display) : "NA"}）</div>
        </div>
        <div class="stat-card">
          <div class="eyebrow">点击率更好</div>
          <div class="stat-title">${bestClick?.timing || "NA"}</div>
          <div class="stat-value">${bestClick ? formatMetric(clickMetric, bestClick.click) : "NA"}</div>
          <div class="muted">相对偏弱：${weakClick?.timing || "NA"}（${weakClick ? formatMetric(clickMetric, weakClick.click) : "NA"}）</div>
        </div>
      </div>
    `;
  } else {
    const compareValues = qualifiedProjects.map((item) => {
      const subjectRows = qualifiedRows.filter((row) => row[compareField] === item.subject);
      const aggregated = aggregateRows(subjectRows, [displayMetric, clickMetric]);
      return {
        subject: item.subject,
        display: aggregated?.[displayMetric],
        click: aggregated?.[clickMetric],
      };
    }).filter((item) => item.display !== null || item.click !== null);

    const bestDisplay = compareValues.slice().sort((a, b) => (b.display || 0) - (a.display || 0))[0] || null;
    const bestClick = compareValues.slice().sort((a, b) => (b.click || 0) - (a.click || 0))[0] || null;
    const rankedSubjects = compareValues.map((item) => {
      let leads = [];
      if (bestDisplay && item.subject === bestDisplay.subject) leads.push("展示率");
      if (bestClick && item.subject === bestClick.subject) leads.push("点击率");
      return { ...item, leads };
    }).sort((a, b) => b.leads.length - a.leads.length || (b.display || 0) - (a.display || 0));

    secondStepBlock = `
      <div class="stat-card" style="padding:22px 24px; margin-top:14px;">
        <div class="eyebrow">综合结论</div>
        <div class="stat-title" style="font-size:24px; line-height:1.35;">${rankedSubjects[0]?.subject || "NA"} 当前更优</div>
        <div class="muted" style="margin-top:10px; line-height:1.9;">
          ${
            rankedSubjects[0]?.leads.length
              ? `主要好在：${rankedSubjects[0].leads.join("、")}。`
              : "当前没有拉开明显的展示率 / 点击率差异。"
          }
        </div>
      </div>
      <div class="stats-grid" style="margin-top:14px;">
        ${rankedSubjects.map((item) => `
          <div class="stat-card">
            <div class="eyebrow">${compareField}表现</div>
            <div class="stat-title">${item.subject}</div>
            <div class="stat-value">${item.leads.length ? `${item.leads.join(" / ")}领先` : "暂无明显领先"}</div>
            <div class="muted">
              展示率：${formatMetric(displayMetric, item.display)}<br/>
              点击率：${formatMetric(clickMetric, item.click)}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  return {
    summaryHtml: `
      ${firstStepBlock}
      <div class="narrative-block">
        <h3>第二点：数据结论</h3>
        <div class="stat-card" style="padding:22px 24px; margin-top:14px;">
          ${secondStepBlock}
        </div>
      </div>
    `,
  };
}

function renderTiming() {
  const host = document.querySelector("#timing-bars");
  const meta = document.querySelector("#timing-meta");
  const objectLabel = activeTimingObjectLabel();
  const { rows, subjects, timingBreakdown, detailGroups, compareField } = computeTimingData();
  if (!rows.length || !subjects.length) {
    host.innerHTML = `<div class="empty-state">${objectLabel}区域当前没有数据。</div>`;
    if (meta) {
      meta.innerHTML = "";
    }
    return;
  }
  const selectedTimingMetrics = (appState.timingMetrics || [])
    .filter((metric) => dashboardData.timing.metrics.includes(metric));
  const sortedSelectedTimingMetrics = sortTimingMetrics(selectedTimingMetrics);
  const overviewMetrics = selectedTimingMetrics.length
    ? sortedSelectedTimingMetrics
    : sortTimingMetrics(DEFAULT_TIMING_METRICS.filter((metric) => dashboardData.timing.metrics.includes(metric)));
  const overviewCharts = overviewMetrics.map((metric) => `
    <article class="compare-card">
      <div class="compare-head">
        <div>
          <div class="compare-title">${metric}</div>
          <div class="muted">纵轴是${objectLabel}，横轴是指标值，系列是${compareField}</div>
        </div>
      </div>
      <div class="chart-legend">
        ${subjects.map((subject, index) => `
          <span class="chart-legend-item">
            <i style="background:${SERIES_COLORS[index % SERIES_COLORS.length]}"></i>${subject.subject}
          </span>
        `).join("")}
      </div>
      ${timingChartSvg(metric, timingBreakdown, subjects)}
    </article>
  `).join("");

  const detailMetrics = overviewMetrics.filter((metric) => !metric.startsWith("D2"));
  const timingCards = detailGroups.map((group) => {
    const subjectKeys = subjects.map((subject) => subject.subject);
    const subjectDataByKey = new Map(group.subjects.map((item) => [item.subject, item]));
    const comparisonColumns = comparisonColumnsForSubjects(subjectKeys.length);
    const metricRows = detailMetrics.map((metric) => {
      const comparisonInfo = comparisonCellsForMetric(
        subjectKeys,
        metric,
        (subject) => subjectDataByKey.get(subject)?.aggregated?.[metric],
        formatMetric
      );
      return `
        <tr>
          <th>${metric}</th>
          ${subjectKeys.map((subject) => {
            const subjectData = subjectDataByKey.get(subject);
            const cellClass = comparisonInfo.valueClasses.get(subject) || "";
            return `<td class="${cellClass}">${subjectData ? formatMetric(metric, subjectData.aggregated[metric]) : "NA"}</td>`;
          }).join("")}
          ${comparisonInfo.cells}
        </tr>
      `;
    }).join("");
    return `
      <article class="compare-card">
        <div class="compare-head">
          <div>
            <div class="compare-title">${group.labels.join(" / ")}</div>
            <div class="muted">按所选维度拆开的分${compareField}指标对比</div>
          </div>
          <div class="pill">细分${objectLabel}</div>
        </div>
        <div class="table-wrap">
          <table class="metric-table">
            <thead>
              <tr>
                <th>指标</th>
                ${subjectKeys.map((subject) => `<th>${subject}</th>`).join("")}
                ${comparisonColumns}
              </tr>
            </thead>
            <tbody>${metricRows}</tbody>
          </table>
        </div>
      </article>
    `;
  }).join("");
  const timingOverview = buildTimingOverview(rows, subjects, timingBreakdown, compareField);
  host.innerHTML = `
    ${timingOverview.summaryHtml}
    <div class="stat-card" style="padding:22px 24px; margin-top:20px;">
      <div class="panel-title" style="margin-top:0;">
        <div>
          <h2>所有${objectLabel}总览</h2>
          <p class="muted">纵轴是${objectLabel}，横轴是指标值，不同颜色代表不同${compareField}。</p>
        </div>
      </div>
    <div class="${timingOverviewGridClass(overviewMetrics.length)}">${overviewCharts}</div>
    </div>
    <div class="panel-title">
      <div>
        <h2>细分${objectLabel}对比</h2>
        <p class="muted">再按你选定的拆分维度，加上${objectLabel}本身，查看不同${compareField}之间的实际差异。</p>
      </div>
    </div>
    <div class="timing-detail-stack">${timingCards || `<div class="empty-state">当前${objectLabel}筛选下没有细分数据。</div>`}</div>
  `;
  if (meta) {
    meta.innerHTML = `
      <div class="hint">
        当前先排除低样本日期，再看${objectLabel}的展示率和点击率差异。首次访问日期支持多选，国家默认取全部，${objectLabel}默认全选。
        当前列对比维度为 <strong>${compareField}</strong>。
      </div>
    `;
  }
}

function featureFilterRows() {
  const filters = {
    报表日期: appState.featureReportDate,
    项目代号: appState.featureProject,
    首次访问日期: appState.featureFirstVisitDate,
    国家: appState.featureCountry,
    版本号: appState.featureVersion,
    分析类型: appState.featureAnalysisType,
  };
  return featureRows().filter((row) =>
    Object.entries(filters).every(([field, allowed]) => {
      if (!allowed?.length) return true;
      if (isAggregateSelection(allowed)) return row[field] === "全部";
      return allowed.includes(row[field]);
    })
  );
}

function featureGroupKey(row, fields) {
  const actualFields = fields.length ? fields : ["分析类型"];
  const labels = actualFields.map((field) => `${field}: ${row[field] || "全部"}`);
  const key = actualFields.map((field) => row[field] || "").join("|");
  return { key, labels };
}

function aggregateFeatureObjectRows(rows) {
  const byObject = new Map();
  rows.forEach((row) => {
    const object = row["分析对象"];
    if (object === "新增用户") return;
    if (!byObject.has(object)) {
      byObject.set(object, []);
    }
    byObject.get(object).push(row);
  });
  return [...byObject.entries()].map(([object, objectRows]) => {
    const users = objectRows.reduce((sum, row) => sum + Number(row["新增用户数"] || 0), 0);
    const result = { object, users };
    featureMetrics().filter((metric) => metric !== "新增用户数").forEach((metric) => {
      let weighted = 0;
      let weight = 0;
      objectRows.forEach((row) => {
        const value = Number(row[metric]);
        const rowUsers = Number(row["新增用户数"] || 0);
        if (Number.isNaN(value)) return;
        weighted += value * (rowUsers || 1);
        weight += rowUsers || 1;
      });
      result[metric] = weight ? weighted / weight : null;
    });
    return result;
  });
}

function featureSelectedDays() {
  const days = (appState.featureDays || []).filter((day) => featureMetrics().includes(day));
  return days.length ? days : ["D0"].filter((day) => featureMetrics().includes(day));
}

function featureUsersForRows(rows) {
  const seen = new Set();
  let users = 0;
  rows.forEach((row) => {
    const key = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号", "分析类型"]
      .map((field) => row[field] || "")
      .join("|");
    if (seen.has(key)) return;
    seen.add(key);
    users += Number(row["新增用户数"] || 0);
  });
  return users;
}

function featureSampleUsersForRows(rows) {
  const sampleRows = rows.some((row) => row["分析对象"] === "新增用户")
    ? rows.filter((row) => row["分析对象"] === "新增用户")
    : rows;
  const seen = new Set();
  let users = 0;
  sampleRows.forEach((row) => {
    const key = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"]
      .map((field) => row[field] || "")
      .join("|");
    if (seen.has(key)) return;
    seen.add(key);
    users += Number(row["新增用户数"] || 0);
  });
  return users;
}

function featureValue(metric, value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "NA";
  if (metric === "新增用户数") return Math.round(value).toLocaleString("zh-CN");
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function featureDayHeader(day) {
  const selectedProjects = (appState.featureProject || []).filter((project) => project !== "全部");
  const projectLabel = selectedProjects.length === 1 ? selectedProjects[0] : "项目代号";
  return `${projectLabel}_${day}`;
}

function weightedFeatureValue(rows, object, day) {
  const objectRows = rows.filter((row) => row["分析对象"] === object);
  let weighted = 0;
  let weight = 0;
  objectRows.forEach((row) => {
    const value = Number(row[day]);
    const users = Number(row["新增用户数"] || 0);
    if (Number.isNaN(value)) return;
    weighted += value * (users || 1);
    weight += users || 1;
  });
  return weight ? weighted / weight : null;
}

function bestFeatureCompareField(rows) {
  const selectedProjects = (appState.featureProject || []).filter((item) => item !== "全部");
  const selectedCountries = (appState.featureCountry || []).filter((item) => item !== "全部");
  const selectedVersions = (appState.featureVersion || []).filter((item) => item !== "全部");
  const projects = uniqueValues(rows, "项目代号").filter((item) => item !== "全部");
  if (selectedProjects.length > 1 && projects.length > 1) return "项目代号";
  if (projects.length > 1) return "项目代号";
  const countries = uniqueValues(rows, "国家").filter((item) => item !== "全部");
  if (selectedCountries.length > 1 && countries.length > 1) return "国家";
  if (countries.length > 1 && !isAggregateSelection(appState.featureCountry || [])) return "国家";
  const versions = uniqueValues(rows, "版本号").filter((item) => item !== "全部");
  if (selectedVersions.length > 1 && versions.length > 1) return "版本号";
  if (versions.length > 1 && !isAggregateSelection(appState.featureVersion || [])) return "版本号";
  return null;
}

function featureNoCompareMessage(rows) {
  const selectedProjects = (appState.featureProject || []).filter((item) => item !== "全部");
  const selectedCountries = (appState.featureCountry || []).filter((item) => item !== "全部");
  const selectedVersions = (appState.featureVersion || []).filter((item) => item !== "全部");
  const hasCompareIntent = selectedProjects.length > 1 || selectedCountries.length > 1 || selectedVersions.length > 1;
  if (hasCompareIntent) {
    const validParts = [];
    const validProjects = uniqueValues(rows || [], "项目代号").filter((item) => item !== "全部");
    const validCountries = uniqueValues(rows || [], "国家").filter((item) => item !== "全部");
    const validVersions = uniqueValues(rows || [], "版本号").filter((item) => item !== "全部");
    if (selectedProjects.length > 1) validParts.push(`项目 ${validProjects.join("、") || "无"}`);
    if (selectedCountries.length > 1) validParts.push(`国家 ${validCountries.join("、") || "无"}`);
    if (selectedVersions.length > 1) validParts.push(`版本 ${validVersions.join("、") || "无"}`);
    return `样本过滤后可纳入分析的对比对象不足，暂时不能稳定判断谁更好。当前达标对象：${validParts.join("；") || "无"}。`;
  }
  return "当前只保留了一个整体口径：单个项目，且国家、版本号均为“全部”。如需判断哪个对象表现更好，请至少选择多个项目、多个国家或多个版本。";
}

function featureCountryPreferenceHtml(rows, modules, day) {
  const countries = uniqueValues(rows, "国家").filter((country) => country && country !== "全部");
  if (countries.length <= 1) return "";
  const items = countries.map((country) => {
    const countryRows = rows.filter((row) => row["国家"] === country);
    const topModules = modules.map((object) => ({
      object,
      score: weightedFeatureValue(countryRows, object, day),
    })).filter((item) => item.score !== null).sort((a, b) => b.score - a.score).slice(0, 2);
    return { country, topModules };
  }).filter((item) => item.topModules.length);
  if (!items.length) return "";
  return `
    <p class="muted" style="margin-top:14px;">各国家功能偏好：</p>
    <div class="feature-token-list">
      ${items.map((item) => `<span class="feature-token"><strong>${item.country}</strong>：${item.topModules.map((module) => `${module.object}（${featureValue(day, module.score)}）`).join("、")}</span>`).join("")}
    </div>
  `;
}

function featureSampleFields() {
  const fields = [];
  const selectedProjects = (appState.featureProject || []).filter((item) => item !== "全部");
  if (selectedProjects.length > 1) fields.push("项目代号");
  if (!isAggregateSelection(appState.featureCountry || [])) fields.push("国家");
  if (!isAggregateSelection(appState.featureVersion || [])) fields.push("版本号");
  return fields;
}

function featureSampleLabel(item) {
  const parts = [item.date].concat(item.fields.map((field) => `${field}: ${item.values[field] || "全部"}`));
  return parts.join(" / ");
}

function featureSampleKey(row, fields) {
  return [row["首次访问日期"] || ""].concat(fields.map((field) => row[field] || "")).join("|");
}

function buildFeatureOverview(rows) {
  const selectedDays = featureSelectedDays();
  const sampleFields = featureSampleFields();
  const bySample = new Map();
  rows.forEach((row) => {
    const key = featureSampleKey(row, sampleFields);
    if (!bySample.has(key)) {
      const values = {};
      sampleFields.forEach((field) => {
        values[field] = row[field] || "";
      });
      bySample.set(key, { date: row["首次访问日期"], fields: sampleFields, values, rows: [] });
    }
    bySample.get(key).rows.push(row);
  });
  const dateSamples = [...bySample.values()]
    .map((item) => ({ ...item, users: featureSampleUsersForRows(item.rows) }))
    .sort((a, b) => {
      const dateCompare = String(b.date).localeCompare(String(a.date), "zh-Hans-CN", { numeric: true });
      if (dateCompare !== 0) return dateCompare;
      return featureSampleLabel(a).localeCompare(featureSampleLabel(b), "zh-Hans-CN", { numeric: true });
  });
  const qualified = dateSamples.filter((item) => item.users > 200);
  const excluded = dateSamples.filter((item) => item.users <= 200);
  const analysisRows = qualified.flatMap((item) => item.rows);
  const dateTokens = (items, warn = false) => items.length
    ? items.map((item) => `<span class="feature-token ${warn ? "warn" : ""}">${featureSampleLabel(item)} / ${featureValue("新增用户数", item.users)}</span>`).join("")
    : `<span class="feature-token ${warn ? "warn" : ""}">无</span>`;
  const sampleUnitName = sampleFields.length ? sampleFields.join(" + ") : "首次访问日期";
  const sampleHtml = `
    <article class="feature-overview-card">
      <div class="section-kicker">第一点：样本过滤</div>
      <h3>${qualified.length} 个样本可纳入分析</h3>
      <p class="muted">规则：按 ${sampleUnitName} 分别判断，只分析新增用户数大于 200 的样本；低样本版本或国家不会进入第二点结论。</p>
      <div class="feature-token-list">${dateTokens(qualified)}</div>
      <p class="muted" style="margin-top:14px;">排除样本</p>
      <div class="feature-token-list">${dateTokens(excluded, true)}</div>
    </article>
  `;
  if (!analysisRows.length) {
    return `
      <div class="feature-overview">
        <div class="panel-title" style="margin-top:0;">
          <div>
            <h2>功能模块速览</h2>
            <p class="muted">先排除样本不足的日期，再输出当前功能模块结论。</p>
          </div>
        </div>
        <div class="feature-overview-grid">${sampleHtml}</div>
      </div>
    `;
  }

  const analysisType = appState.featureAnalysisType?.[0] || uniqueValues(analysisRows, "分析类型")[0];
  const compareField = bestFeatureCompareField(analysisRows);
  const compareValues = compareField ? uniqueValues(analysisRows, compareField).filter((value) => value !== "全部") : [];
  const day = selectedDays[0] || "D0";
  let conclusionHtml = "";

  if (String(analysisType || "").includes("漏斗")) {
    const funnelSteps = uniqueValues(analysisRows, "分析对象");
    const targetObject = analysisType === "首次启动流程漏斗"
      ? "首页展示数"
      : (funnelSteps[funnelSteps.length - 1] || "最终步骤");
    const scoreItems = compareField
      ? compareValues.map((value) => {
        const valueRows = analysisRows.filter((row) => row[compareField] === value);
        return { value, score: weightedFeatureValue(valueRows, targetObject, day) };
      }).filter((item) => item.score !== null)
      : [{ value: "当前筛选", score: weightedFeatureValue(analysisRows, targetObject, day) }];
    const best = scoreItems.slice().sort((a, b) => b.score - a.score)[0];
    const worst = scoreItems.slice().sort((a, b) => a.score - b.score)[0];
    const stepValues = funnelSteps.map((object) => ({
      object,
      value: object === "新增用户" ? 1 : weightedFeatureValue(analysisRows, object, day),
    })).filter((item) => item.value !== null);
    const drops = stepValues.slice(1).map((item, index) => ({
      from: stepValues[index].object,
      to: item.object,
      drop: stepValues[index].value - item.value,
    })).sort((a, b) => b.drop - a.drop);
    const mainDrop = drops[0];
    conclusionHtml = `
      <article class="feature-overview-card">
        <div class="section-kicker">第二点：功能结论</div>
        <h3>${compareField ? `${compareField} 对比` : "当前筛选"}：${targetObject}到达率</h3>
        ${compareField
          ? `<div class="feature-focus"><strong>${best?.value || "NA"}</strong> 表现更好，${day} ${targetObject}到达率为 <strong>${featureValue(day, best?.score)}</strong>。</div>`
          : `<div class="feature-focus">${featureNoCompareMessage(analysisRows)}</div>
             <p class="muted">当前整体口径下，${day} ${targetObject}到达率为 <strong>${featureValue(day, best?.score)}</strong>。</p>`}
        ${compareField && worst ? `<p class="muted">相对较弱：${worst.value}（${featureValue(day, worst.score)}）。</p>` : ""}
        ${mainDrop ? `<p class="muted">主要流失步骤：<strong>${mainDrop.from} → ${mainDrop.to}</strong>，下降 ${featureValue(day, mainDrop.drop)}。</p>` : ""}
      </article>
    `;
  } else {
    const modules = uniqueValues(analysisRows, "分析对象").filter((object) => object !== "新增用户");
    const moduleScores = modules.map((object) => ({
      object,
      score: weightedFeatureValue(analysisRows, object, day),
    })).filter((item) => item.score !== null).sort((a, b) => b.score - a.score);
    const topModules = moduleScores.slice(0, 3);
    const countryPreferenceHtml = featureCountryPreferenceHtml(analysisRows, modules, day);
    const scoreItems = compareField
      ? compareValues.map((value) => {
        const valueRows = analysisRows.filter((row) => row[compareField] === value);
        const scores = modules.map((object) => weightedFeatureValue(valueRows, object, day)).filter((value) => value !== null);
        return { value, score: scores.length ? scores.reduce((sum, current) => sum + current, 0) / scores.length : null };
      }).filter((item) => item.score !== null)
      : [];
    const best = scoreItems.slice().sort((a, b) => b.score - a.score)[0];
    conclusionHtml = `
      <article class="feature-overview-card">
        <div class="section-kicker">第二点：功能结论</div>
        <h3>${compareField ? `${compareField} 对比` : "首页模块点击率"}</h3>
        ${compareField
          ? (best ? `<div class="feature-focus"><strong>${best.value}</strong> 整体点击表现更好，${day} 模块平均点击率为 <strong>${featureValue(day, best.score)}</strong>。</div>` : "")
          : `<div class="feature-focus">${featureNoCompareMessage(analysisRows)}</div>`}
        <p class="muted">点击率靠前模块：${topModules.length ? topModules.map((item) => `<strong>${item.object}</strong>（${featureValue(day, item.score)}）`).join("、") : "暂无"}。</p>
        ${countryPreferenceHtml}
      </article>
    `;
  }

  return `
    <div class="feature-overview">
      <div class="panel-title" style="margin-top:0;">
        <div>
          <h2>功能模块速览</h2>
          <p class="muted">先排除样本不足的日期，再输出当前功能模块结论。</p>
        </div>
      </div>
      <div class="feature-overview-grid">${sampleHtml}${conclusionHtml}</div>
    </div>
    <div class="panel-title">
      <div>
        <h2>明细数据</h2>
        <p class="muted">按所选拆分维度查看分析对象表现。</p>
      </div>
    </div>
  `;
}

function featureColumnDimension() {
  const value = (appState.featureColumnDimension || [])[0];
  return ["项目代号", "版本号", "国家"].includes(value) ? value : "项目代号";
}

function featureColumnValues(rows, field) {
  const values = uniqueValues(rows, field);
  const order = featureOptionsFor(field);
  return values.sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
    }
    return String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true });
  });
}

function featureObjectNames(rows) {
  const names = [];
  const seen = new Set();
  rows.forEach((row) => {
    const object = row["分析对象"];
    if (!object || object === "新增用户" || seen.has(object)) return;
    seen.add(object);
    names.push(object);
  });
  return names;
}

function renderFeature() {
  const host = document.querySelector("#feature-content");
  const meta = document.querySelector("#feature-meta");
  if (!host || !meta || !isFeatureWorkspace()) return;
  applyFeatureDefaults();
  const rows = featureFilterRows();
  if (!featureRows().length) {
    host.innerHTML = `<div class="empty-state">当前 data.js 还没有功能模块数据。</div>`;
    meta.innerHTML = "";
    return;
  }
  if (!rows.length) {
    host.innerHTML = `<div class="empty-state">当前筛选下没有功能模块数据。</div>`;
    meta.innerHTML = "";
    return;
  }

  const groupFields = [...new Set([...appState.featureGroupDimensions, "分析类型"])];
  const groups = new Map();
  rows.forEach((row) => {
    const group = featureGroupKey(row, groupFields);
    if (!groups.has(group.key)) {
      groups.set(group.key, { labels: group.labels, rows: [] });
    }
    groups.get(group.key).rows.push(row);
  });

  const selectedDays = featureSelectedDays();
  const sortedGroups = [...groups.values()].sort((a, b) => {
    const aDate = a.rows[0]?.["首次访问日期"] || "";
    const bDate = b.rows[0]?.["首次访问日期"] || "";
    const dateDiff = String(bDate).localeCompare(String(aDate), "zh-Hans-CN", { numeric: true });
    if (dateDiff !== 0) return dateDiff;
    return a.labels.join("|").localeCompare(b.labels.join("|"), "zh-Hans-CN", { numeric: true });
  });
  const cards = sortedGroups.map((group) => {
    const columnDimension = featureColumnDimension();
    const columnValues = featureColumnValues(group.rows, columnDimension);
    const objectNames = featureObjectNames(group.rows);
    const columns = [];
    columnValues.forEach((value) => {
      const valueRows = group.rows.filter((row) => row[columnDimension] === value);
      selectedDays.forEach((day) => {
        columns.push({ value, day, rows: valueRows, label: `${value}_${day}` });
      });
    });
    const columnLabels = columns.map((column) => column.label);
    const columnsByLabel = new Map(columns.map((column) => [column.label, column]));
    const comparisonColumns = comparisonColumnsForSubjects(columnLabels.length);
    const filterLabels = [];
    if (!groupFields.includes("国家")) {
      filterLabels.push(`国家: ${(appState.featureCountry || []).join("、") || "全部"}`);
    }
    if (!groupFields.includes("版本号")) {
      filterLabels.push(`版本号: ${(appState.featureVersion || []).join("、") || "全部"}`);
    }
    const titleLabels = [...group.labels, ...filterLabels];
    const usersComparison = comparisonCellsForMetric(
      columnLabels,
      "新增用户数",
      (label) => featureUsersForRows(columnsByLabel.get(label)?.rows || []),
      featureValue
    );
    const usersRow = `
      <tr>
        <th>新增用户数</th>
        ${columns.map((column) => {
          const cellClass = usersComparison.valueClasses.get(column.label) || "";
          return `<td class="${cellClass}">${featureValue("新增用户数", featureUsersForRows(column.rows))}</td>`;
        }).join("")}
        ${usersComparison.cells}
      </tr>
    `;
    const rowsHtml = objectNames.map((object) => {
      const comparisonMetric = selectedDays[0] || "D0";
      const comparisonInfo = comparisonCellsForMetric(
        columnLabels,
        comparisonMetric,
        (label) => {
          const column = columnsByLabel.get(label);
          return column ? weightedFeatureValue(column.rows, object, column.day) : null;
        },
        featureValue
      );
      return `
        <tr>
          <th>${object}</th>
          ${columns.map((column) => {
            const cellClass = comparisonInfo.valueClasses.get(column.label) || "";
            return `<td class="${cellClass}">${featureValue(column.day, weightedFeatureValue(column.rows, object, column.day))}</td>`;
          }).join("")}
          ${comparisonInfo.cells}
        </tr>
      `;
    }).join("");
    return `
      <article class="compare-card">
        <div class="compare-head">
          <div>
            <div class="compare-title">${titleLabels.join(" \\ ")}</div>
            <div class="muted">按 ${columnDimension} 展开列，查看 ${selectedDays.join("、")}</div>
          </div>
          <div class="pill">功能模块</div>
        </div>
        <div class="table-wrap">
          <table class="metric-table">
            <thead>
              <tr>
                <th>分析对象</th>
                ${columns.map((column) => `<th>${column.label}</th>`).join("")}
                ${comparisonColumns}
              </tr>
            </thead>
            <tbody>${usersRow}${rowsHtml}</tbody>
          </table>
        </div>
      </article>
    `;
  }).join("");
  host.innerHTML = `${buildFeatureOverview(rows)}${cards}`;
  meta.innerHTML = `
    <div class="hint">
      当前功能模块使用 ${rows.length} 条记录；D0/D1 按新增用户数加权聚合。数据源目前来自 FR07 的 feature_export。
    </div>
  `;
}

function renderFeatureControls() {
  if (!isFeatureWorkspace()) return;
  applyFeatureDefaults();
  const controls = [
    ["#feature-report-date", "报表日期", "featureReportDate"],
    ["#feature-project", "项目代号", "featureProject"],
    ["#feature-first-date", "首次访问日期", "featureFirstVisitDate"],
    ["#feature-country", "国家", "featureCountry"],
    ["#feature-version", "版本号", "featureVersion"],
    ["#feature-analysis-type", "分析类型", "featureAnalysisType"],
  ];
  controls.forEach(([selector, field, stateKey]) => {
    const node = document.querySelector(selector);
    if (!node) return;
    const items = featureOptionsFor(field);
    appState[stateKey] = (appState[stateKey] || []).filter((value) => items.includes(value));
    if (!appState[stateKey].length) {
      appState[stateKey] = field === "国家" || field === "版本号"
        ? (items.includes("全部") ? ["全部"] : items.slice(0, 1))
        : items.slice(0, field === "首次访问日期" ? 5 : 1);
    }
    renderMultiSelect(
      node,
      items,
      appState[stateKey],
      (values) => {
        if (field === "国家" || field === "版本号") {
          const hadAllSelected = appState[stateKey].includes("全部");
          let nextValues = values;
          if (nextValues.includes?.("全部")) {
            nextValues = hadAllSelected && nextValues.length > 1
              ? nextValues.filter((item) => item !== "全部")
              : ["全部"];
          } else {
            nextValues = nextValues.filter((item) => item !== "全部");
          }
          appState[stateKey] = nextValues.length ? nextValues : ["全部"];
        } else if (field === "分析类型") {
          const value = Array.isArray(values) ? values[0] : values;
          appState[stateKey] = value ? [value] : items.slice(0, 1);
        } else {
          appState[stateKey] = values.length ? values : items.slice(0, 1);
        }
        rememberProjectDateSelection(appState.activeWorkspace, field);
        rerender();
      },
      {
        multiple: field !== "分析类型",
        size: field === "首次访问日期" ? 8 : 6,
        summary: (values) => values.length ? values.join("、") : "请选择",
      }
    );
  });
  renderMultiSelect(
    document.querySelector("#feature-days"),
    featureMetrics().filter((metric) => /^D\d+$/.test(metric)),
    appState.featureDays,
    (values) => {
      appState.featureDays = values.length ? values : ["D0"].filter((day) => featureMetrics().includes(day));
      rerender();
    },
    {
      multiple: true,
      size: 4,
      summary: (values) => values.length ? values.join("、") : "请选择分析天数",
    }
  );
  renderMultiSelect(
    document.querySelector("#feature-column-dimension"),
    ["项目代号", "版本号", "国家"],
    appState.featureColumnDimension,
    (values) => {
      const value = Array.isArray(values) ? values[0] : values;
      appState.featureColumnDimension = value ? [value] : ["项目代号"];
      rerender();
    },
    {
      multiple: false,
      size: 3,
      summary: (values) => values[0] || "项目代号",
    }
  );
  renderMultiSelect(
    document.querySelector("#feature-group-dimensions"),
    ["首次访问日期", "国家", "版本号", "分析类型"],
    appState.featureGroupDimensions,
    (values) => {
      appState.featureGroupDimensions = values.length ? values : ["首次访问日期"];
      rerender();
    },
    {
      multiple: true,
      size: 5,
      summary: (values) => values.length ? `已选 ${values.length} 个拆分维度` : "不拆分，直接看总表",
    }
  );
}

function buildControlSection() {
  if (isFeatureWorkspace()) {
    renderFeatureControls();
    return;
  }
  const compareFieldBlock = document.querySelector("[data-control='compare-field']");
  const analysisModeBlock = document.querySelector("[data-control='analysis-mode']");
  const countryModeBlock = document.querySelector("[data-control='country-mode']");
  const compareFilterHeaderBlock = document.querySelector("[data-control='compare-filter-header']");
  const compareValuesBlock = document.querySelector("[data-control='compare-values']");
  const groupDimensionsBlock = document.querySelector("[data-control='group-dimensions']");
  const compareMetricsBlock = document.querySelector("[data-control='compare-metrics']");
  const compareValuesWrap = document.querySelector("#compare-values")?.closest(".control-block");
  const compareValuesLabel = compareValuesBlock?.querySelector("label");
  const groupDimensionsWrap = document.querySelector("#group-dimensions")?.closest(".control-block");
  const compareMetricsWrap = document.querySelector("#compare-metrics")?.closest(".control-block");
  const compareCountryLabel = document.querySelector("#compare-controls-panel [data-filter='国家']")?.closest(".control-block")?.querySelector("label");
  const isDataOverview = appState.activeWorkspace === "data_overview";
  const isPaidCountry = appState.activeWorkspace === "paid_country";
  const isPaidShareWorkspace = ["paid_country", "paid_adgroup"].includes(appState.activeWorkspace);
  if (analysisModeBlock) {
    analysisModeBlock.style.display = "none";
  }
  if (compareFieldBlock) {
    compareFieldBlock.style.display = "none";
  }
  if (compareFilterHeaderBlock) {
    compareFilterHeaderBlock.style.display = appState.activeWorkspace === "cross_project" ? "none" : "";
  }
  if (countryModeBlock) {
    countryModeBlock.style.display = "none";
  }
  const shouldHideCompareValues = isDataOverview || isPaidShareWorkspace || appState.activeWorkspace === "version_iteration" || appState.activeWorkspace === "adgroup_iteration" || appState.activeWorkspace === "cross_project";
  if (compareValuesBlock) {
    compareValuesBlock.style.setProperty("display", shouldHideCompareValues ? "none" : "", shouldHideCompareValues ? "important" : "");
    compareValuesBlock.hidden = shouldHideCompareValues;
    compareValuesBlock.classList.toggle("hidden-panel", shouldHideCompareValues);
  }
  if (compareValuesWrap && compareValuesWrap !== compareValuesBlock) {
    compareValuesWrap.style.setProperty("display", shouldHideCompareValues ? "none" : "", shouldHideCompareValues ? "important" : "");
    compareValuesWrap.hidden = shouldHideCompareValues;
    compareValuesWrap.classList.toggle("hidden-panel", shouldHideCompareValues);
  }
  if (compareValuesLabel) {
    compareValuesLabel.textContent = appState.activeWorkspace === "country_opt" ? "国家" : "参与对比的主体值";
  }
  if (groupDimensionsBlock) {
    groupDimensionsBlock.style.display = isDataOverview || isPaidShareWorkspace ? "none" : "";
  }
  if (groupDimensionsWrap) {
    groupDimensionsWrap.style.display = isDataOverview || isPaidShareWorkspace ? "none" : "";
  }
  if (compareMetricsBlock) {
    compareMetricsBlock.style.display = isDataOverview || isPaidShareWorkspace ? "none" : "";
  }
  if (compareMetricsWrap) {
    compareMetricsWrap.style.display = isDataOverview || isPaidShareWorkspace ? "none" : "";
  }
  if (compareCountryLabel) {
    compareCountryLabel.textContent = appState.activeWorkspace === "cross_project" ? "共有国家" : "国家";
  }

  const analysisModeSelect = document.querySelector("#analysis-mode");
  analysisModeSelect.innerHTML = `
    <option value="single_project" ${appState.analysisMode === "single_project" ? "selected" : ""}>项目内分析</option>
    <option value="cross_project" ${appState.analysisMode === "cross_project" ? "selected" : ""}>跨项目分析</option>
  `;
  analysisModeSelect.onchange = (event) => {
    appState.analysisMode = event.target.value;
    if (appState.analysisMode === "single_project") {
      appState.compareField = "版本号";
      appState.countryMode = "single_country";
      appState.filters["项目代号"] = appState.filters["项目代号"].slice(0, 1);
    } else {
      appState.compareField = "项目代号";
      appState.filters["版本号"] = optionsFor("版本号");
    }
    appState.compareValues = [];
    appState.filters["国家"] = [];
    rerender();
  };

  const countryModeSelect = document.querySelector("#country-mode");
  countryModeSelect.innerHTML = `
    <option value="single_country" ${appState.countryMode === "single_country" ? "selected" : ""}>单国家精确对比</option>
    <option value="multi_country" ${appState.countryMode === "multi_country" ? "selected" : ""}>多国家汇总对比</option>
  `;
  countryModeSelect.onchange = (event) => {
    appState.countryMode = event.target.value;
    appState.filters["国家"] = [];
    rerender();
  };

  const compareFieldSelect = document.querySelector("#compare-field");
  compareFieldSelect.innerHTML = availableCompareFields().map((field) => `
    <option value="${field}" ${field === appState.compareField ? "selected" : ""}>${field}</option>
  `).join("");
  compareFieldSelect.onchange = (event) => {
    appState.compareField = event.target.value;
    appState.compareValues = compareCandidateValues(baseRowsForAnalysis(), appState.compareField).slice(0, 3);
    appState.groupDimensions = appState.groupDimensions.filter((field) => field !== appState.compareField);
    if (!appState.groupDimensions.length) {
      appState.groupDimensions = ["首次访问日期"];
    }
    rerender();
  };

  if (appState.activeWorkspace === "paid_country") {
    appState.compareField = "国家";
    appState.countryMode = "multi_country";
    appState.groupDimensions = ["首次访问日期"];
    appState.compareMetrics = filteredMetrics(WORKSPACES.paid_country.compareDefaults.compareMetrics);
  }
  if (appState.activeWorkspace === "data_overview") {
    appState.compareField = "项目代号";
    appState.countryMode = "multi_country";
    appState.groupDimensions = ["首次访问日期"];
    appState.compareMetrics = DATA_OVERVIEW_METRICS.slice();
    appState.compareValues = (appState.filters["项目代号"] || []).filter((item) => item !== "全部");
  }
  if (appState.activeWorkspace === "paid_adgroup") {
    appState.compareField = "广告组";
    appState.countryMode = "multi_country";
    appState.groupDimensions = ["首次访问日期"];
    appState.compareMetrics = filteredMetrics(WORKSPACES.paid_adgroup.compareDefaults.compareMetrics);
  }
  if (appState.activeWorkspace === "adgroup_iteration") {
    appState.compareField = "广告组";
    appState.countryMode = "single_country";
    appState.groupDimensions = appState.groupDimensions.length ? appState.groupDimensions : ["首次访问日期"];
    appState.compareMetrics = filteredMetrics(appState.compareMetrics.length ? appState.compareMetrics : WORKSPACES.adgroup_iteration.compareDefaults.compareMetrics);
  }

  const countryUniverse = getCountryUniverse(appState.compareField, appState.compareValues, baseRowsForAnalysis());
  const rowsForOptionField = (field) => {
    const filters = {};
    for (const otherField of visibleFilterFields(appState.compareField)) {
      if (otherField !== field) {
        filters[otherField] = appState.filters[otherField] || [];
      }
    }
    return applyDimensionFilters(baseRowsForAnalysis(), filters);
  };
  for (const field of DIMENSION_LABELS) {
    const wrap = document.querySelector(`[data-filter="${field}"]`);
    const controlBlock = wrap?.closest(".control-block");
    const shouldShow = visibleFilterFields(appState.compareField).includes(field);
    if (controlBlock) {
      controlBlock.style.display = shouldShow ? "" : "none";
    }
    if (!wrap || !shouldShow) continue;
    let items;
    if (field === "国家") {
      items = countryUniverse;
    } else if (field === "广告组") {
      items = adGroupOptionsForRows(rowsForOptionField("广告组"));
    } else if (field === "版本号" && appState.analysisMode === "single_project") {
      items = versionFilterOptionsForWorkspace(baseRowsForAnalysis());
    } else {
      items = optionsFor(field);
    }
    const isSingleProjectField = field === "项目代号" && appState.analysisMode === "single_project";
    const isSingleCountryField = field === "国家" && appState.countryMode === "single_country";
    const isSingleVersionField = field === "版本号" && appState.activeWorkspace === "adgroup_iteration";
    const selectedForControl = (isSingleProjectField || isSingleCountryField || isSingleVersionField)
      ? appState.filters[field].slice(0, 1)
      : appState.filters[field];
    renderMultiSelect(
      wrap,
      items,
      selectedForControl,
      (value) => {
        if (isSingleProjectField || isSingleCountryField || isSingleVersionField) {
          appState.filters[field] = value ? [value] : [];
        } else {
          let nextValues = value;
          if (field === "国家" || field === "版本号" || field === "广告组") {
            const hadAllSelected = appState.filters[field].includes("全部");
            if (nextValues.includes("全部")) {
              if (hadAllSelected && nextValues.length > 1) {
                nextValues = nextValues.filter((item) => item !== "全部");
              } else {
                nextValues = ["全部"];
              }
            } else {
              nextValues = nextValues.filter((item) => item !== "全部");
            }
          }
          appState.filters[field] = nextValues;
        }
        if (!appState.filters[field].length) {
          if ((field === "国家" || field === "版本号" || field === "广告组") && items.includes("全部")) {
            appState.filters[field] = field === "版本号" && appState.activeWorkspace === "version_iteration"
              ? (defaultRecentVersionValues(baseRowsForAnalysis()).length ? defaultRecentVersionValues(baseRowsForAnalysis()) : items.slice(0, 1))
              : field === "版本号" && appState.activeWorkspace === "adgroup_iteration"
              ? (defaultRecentVersionValues(baseRowsForAnalysis()).slice(-1).length ? defaultRecentVersionValues(baseRowsForAnalysis()).slice(-1) : items.filter((item) => item !== "全部").slice(-1))
              : ["全部"];
          } else {
            appState.filters[field] = items.slice(0, (isSingleProjectField || isSingleVersionField) ? 1 : items.length);
          }
        }
        rememberProjectDateSelection(appState.activeWorkspace, field);
        const shouldResetCompareValues =
          field === appState.compareField ||
          (field === "项目代号" && appState.analysisMode === "single_project");
        if (shouldResetCompareValues) {
          appState.compareValues = [];
        }
        if (field === "项目代号" && appState.analysisMode === "single_project") {
          const nextCountryUniverse = getCountryUniverse(appState.compareField, appState.compareValues, baseRowsForAnalysis());
          if (appState.activeWorkspace === "version_iteration") {
            appState.filters["国家"] = nextCountryUniverse.includes("全部") ? ["全部"] : nextCountryUniverse.slice(0, 1);
            const versionRows = baseRowsForAnalysis().filter((row) => {
              const selectedCountry = appState.filters["国家"]?.[0];
              return !selectedCountry || selectedCountry === "全部" || row["国家"] === selectedCountry;
            });
            const recentVersions = defaultRecentVersionValues(versionRows);
            appState.filters["版本号"] = recentVersions.length ? recentVersions : defaultRecentVersionValues();
            appState.compareValues = appState.filters["版本号"].slice();
          } else if (appState.activeWorkspace === "adgroup_iteration") {
            appState.filters["国家"] = nextCountryUniverse.includes("全部") ? ["全部"] : nextCountryUniverse.slice(0, 1);
            const versionRows = baseRowsForAnalysis().filter((row) => {
              const selectedCountry = appState.filters["国家"]?.[0];
              return !selectedCountry || selectedCountry === "全部" || row["国家"] === selectedCountry;
            });
            const recentVersions = defaultRecentVersionValues(versionRows);
            appState.filters["版本号"] = recentVersions.length ? recentVersions.slice(-1) : defaultRecentVersionValues().slice(-1);
            const adRows = applyDimensionFilters(baseRowsForAnalysis(), {
              报表日期: appState.filters["报表日期"],
              首次访问日期: appState.filters["首次访问日期"],
              国家: appState.filters["国家"],
              版本号: appState.filters["版本号"],
            });
            appState.filters["广告组"] = defaultAdGroupSelections(adRows, 5);
            appState.compareValues = appState.filters["广告组"].slice();
          } else {
            const previousCountry = appState.filters["国家"]?.[0];
            appState.filters["国家"] = previousCountry && nextCountryUniverse.includes(previousCountry)
              ? [previousCountry]
              : (nextCountryUniverse.length ? nextCountryUniverse.slice(0, 1) : []);
            const availableVersions = versionFilterOptionsForWorkspace(baseRowsForAnalysis());
            const previousVersions = (appState.filters["版本号"] || []).filter((item) => availableVersions.includes(item));
            appState.filters["版本号"] = previousVersions.length
              ? previousVersions
              : (availableVersions.includes("全部") ? ["全部"] : availableVersions.slice(0, 1));
          }
          const availableAdGroups = adGroupOptionsForRows(baseRowsForAnalysis());
          const previousAdGroups = (appState.filters["广告组"] || []).filter((item) => availableAdGroups.includes(item) && !isNotSetValue(item));
          appState.filters["广告组"] = previousAdGroups.length
            ? previousAdGroups
            : (availableAdGroups.includes("全部") ? ["全部"] : availableAdGroups.slice(0, 1));
        }
        if (field === "项目代号" && appState.activeWorkspace === "cross_project") {
          appState.compareValues = appState.filters["项目代号"].slice();
          const sharedCountries = getCountryUniverse("项目代号", appState.compareValues, baseRowsForAnalysis());
          const previousCountry = appState.filters["国家"]?.[0];
          appState.filters["国家"] = previousCountry && sharedCountries.includes(previousCountry)
            ? [previousCountry]
            : (sharedCountries.includes("全部") ? ["全部"] : sharedCountries.slice(0, 1));
          const availableAdGroups = adGroupOptionsForRows(baseRowsForAnalysis());
          const previousAdGroups = (appState.filters["广告组"] || []).filter((item) => availableAdGroups.includes(item) && !isNotSetValue(item));
          appState.filters["广告组"] = previousAdGroups.length
            ? previousAdGroups
            : (availableAdGroups.includes("全部") ? ["全部"] : availableAdGroups.slice(0, 1));
        }
        if (appState.activeWorkspace === "version_iteration" && field === "国家") {
          const versionRows = baseRowsForAnalysis().filter((row) => {
            const selectedCountry = appState.filters["国家"]?.[0];
            return !selectedCountry || selectedCountry === "全部" || row["国家"] === selectedCountry;
          });
          const availableVersions = versionOptionsForRows(versionRows);
          const previousVersions = (appState.filters["版本号"] || []).filter((item) => availableVersions.includes(item));
          const recentVersions = defaultRecentVersionValues(versionRows);
          appState.filters["版本号"] = previousVersions.length
            ? previousVersions
            : (recentVersions.length ? recentVersions : defaultRecentVersionValues());
          appState.compareValues = appState.filters["版本号"].slice();
        }
        if (appState.activeWorkspace === "version_iteration" && field === "版本号") {
          appState.compareValues = appState.filters["版本号"].slice();
        }
        if (appState.activeWorkspace === "adgroup_iteration" && ["国家", "版本号"].includes(field)) {
          const adRows = applyDimensionFilters(baseRowsForAnalysis(), {
            报表日期: appState.filters["报表日期"],
            首次访问日期: appState.filters["首次访问日期"],
            国家: appState.filters["国家"],
            版本号: appState.filters["版本号"],
          });
          const availableAdGroups = adGroupOptionsForRows(adRows).filter((item) => item !== "全部");
          const defaultAdGroups = defaultAdGroupSelections(adRows, 5);
          const previousAdGroups = (appState.filters["广告组"] || []).filter((item) => availableAdGroups.includes(item));
          appState.filters["广告组"] = previousAdGroups.length ? previousAdGroups : defaultAdGroups;
          appState.compareValues = appState.filters["广告组"].slice();
        }
        if (appState.activeWorkspace === "adgroup_iteration" && field === "广告组") {
          appState.compareValues = appState.filters["广告组"].filter((item) => item !== "全部");
          if (!appState.compareValues.length && appState.filters["广告组"].includes("全部")) {
            appState.compareValues = ["全部"];
          }
        }
        rerender();
      },
      {
        multiple: !(isSingleProjectField || isSingleCountryField || isSingleVersionField),
        size: field === "首次访问日期" ? 8 : 6,
        placeholder: "请选择",
      }
    );
  }

  const versionControl = document.querySelector("[data-control='version-filter']");
  if (versionControl) {
    versionControl.style.display = isDataOverview || (appState.analysisMode === "single_project" && !isPaidShareWorkspace) ? "" : "none";
  }
  const compareValuesControl = document.querySelector("#compare-values")?.closest(".control-block");
  if (compareValuesControl) {
    compareValuesControl.style.display = shouldHideCompareValues ? "none" : "";
  }

  renderMultiSelect(
    document.querySelector("#compare-values"),
    compareValueOptions(baseRowsForAnalysis(), appState.compareField),
    appState.compareValues,
    (values) => {
      appState.compareValues = values;
      rerender();
    },
    {
      multiple: true,
      size: 6,
      summary: (values) => {
        if (shouldShowAggregateCompareValue()) {
          return values.length ? values.join("、") : "请选择国家";
        }
        return values.length ? `已选 ${values.length} 个${appState.compareField}` : `请选择${appState.compareField}`;
      },
    }
  );

  renderMultiSelect(
    document.querySelector("#group-dimensions"),
    (appState.activeWorkspace === "cross_project" ? ["首次访问日期", "国家"] : DIMENSION_LABELS).filter((field) => {
      if (["报表日期", appState.compareField].includes(field)) return false;
      if (appState.analysisMode === "single_project" && field === "项目代号") return false;
      return true;
    }),
    appState.groupDimensions,
    (values) => {
      appState.groupDimensions = values;
      if (!appState.groupDimensions.length && ["version_iteration", "adgroup_iteration"].includes(appState.activeWorkspace)) {
        appState.groupDimensions = ["首次访问日期"];
      }
      rerender();
    },
    {
      multiple: true,
      size: 5,
      summary: (values) => values.length ? `已选 ${values.length} 个拆分维度` : "不拆分，直接看汇总",
    }
  );

  renderMultiSelect(
    document.querySelector("#compare-metrics"),
    sortCompareMetrics(COMPARE_METRICS),
    appState.compareMetrics,
    (values) => {
      appState.compareMetrics = values;
      if (!appState.compareMetrics.length) {
        appState.compareMetrics = sortCompareMetrics(PREFERRED_COMPARE_METRICS.filter((metric) => COMPARE_METRICS.includes(metric))).slice(0, 6);
      }
      rerender();
    },
    {
      multiple: true,
      size: 8,
      summary: (values) => values.length ? `已选 ${values.length} 个指标` : "请选择指标",
    }
  );

  const funnelProjectSelect = document.querySelector("#funnel-project");
  funnelProjectSelect.innerHTML = optionsFor("项目代号").map((project) => `
    <option value="${project}" ${project === appState.funnelProject ? "selected" : ""}>${project}</option>
  `).join("");
  funnelProjectSelect.onchange = (event) => {
    appState.funnelProject = event.target.value;
    rerender();
  };

  const funnelCompareFieldSelect = document.querySelector("#funnel-compare-field");
  if (funnelCompareFieldSelect) {
    funnelCompareFieldSelect.innerHTML = funnelAvailableCompareFields().map((field) => `
      <option value="${field}" ${field === appState.funnelCompareField ? "selected" : ""}>${field}</option>
    `).join("");
    funnelCompareFieldSelect.onchange = (event) => {
      appState.funnelCompareField = event.target.value;
      appState.funnelCompareValues = compareCandidateValues(dashboardData.main.rows, appState.funnelCompareField).slice(0, 2);
      rerender();
    };
  }

  const funnelProjectBlock = document.querySelector("[data-control='funnel-project-filter']");
  if (funnelProjectBlock) {
    funnelProjectBlock.style.display = appState.funnelCompareField === "项目代号" ? "none" : "";
  }

  const funnelVersionBlock = document.querySelector("[data-control='funnel-version-filter']");
  if (funnelVersionBlock) {
    funnelVersionBlock.style.display = appState.funnelCompareField === "版本号" ? "none" : "";
  }

  renderMultiSelect(
    document.querySelector("#funnel-compare-values"),
    compareCandidateValues(
      dashboardData.main.rows.filter((row) => {
        if (appState.funnelCompareField === "版本号" && appState.funnelProject) {
          return row["项目代号"] === appState.funnelProject;
        }
        return true;
      }),
      appState.funnelCompareField
    ),
    appState.funnelCompareValues,
    (values) => {
      appState.funnelCompareValues = values;
      rerender();
    },
    { multiple: true, size: 6 }
  );

  const funnelControls = [
    ["#funnel-date", "报表日期", "funnelDate"],
    ["#funnel-country", "国家", "funnelCountry"],
    ["#funnel-version", "版本号", "funnelVersion"],
    ["#funnel-first-date", "首次访问日期", "funnelFirstVisitDate"],
  ];
  for (const [selector, field, stateKey] of funnelControls) {
    renderMultiSelect(
      document.querySelector(selector),
      optionsFor(field),
      appState[stateKey],
      (values) => {
        appState[stateKey] = values;
        rerender();
      },
      { multiple: true, size: field === "首次访问日期" ? 8 : 6 }
    );
  }

  renderMultiSelect(
    document.querySelector("#funnel-metrics"),
    COMPARE_METRICS,
    appState.funnelMetrics,
    (values) => {
      appState.funnelMetrics = values;
      if (!appState.funnelMetrics.length) {
        appState.funnelMetrics = dashboardData.main.recommendedFunnelMetrics.filter((metric) => COMPARE_METRICS.includes(metric)).slice();
      }
      rerender();
    },
    { multiple: true, size: 8 }
  );

  renderMultiSelect(
    document.querySelector("#timing-metrics"),
    sortTimingMetrics(dashboardData.timing.metrics),
    appState.timingMetrics,
    (values) => {
      appState.timingMetrics = values.length
        ? values
        : DEFAULT_TIMING_METRICS.filter((metric) => dashboardData.timing.metrics.includes(metric));
      rerender();
    },
    {
      multiple: true,
      size: 8,
      summary: (values) => values.length ? `已选 ${values.length} 个指标` : "请选择关注指标",
    }
  );

  const timingCompareFieldSelect = document.querySelector("#timing-compare-field");
  if (timingCompareFieldSelect) {
    timingCompareFieldSelect.innerHTML = timingAvailableCompareFields().map((field) => `
      <option value="${field}" ${field === appState.timingCompareField ? "selected" : ""}>${field}</option>
    `).join("");
    timingCompareFieldSelect.onchange = (event) => {
      appState.timingCompareField = event.target.value;
      rerender();
    };
  }

  const timingCompareValuesBlock = document.querySelector("[data-control='timing-compare-values']");
  if (timingCompareValuesBlock) {
    timingCompareValuesBlock.style.display = "none";
  }

  renderMultiSelect(
    document.querySelector("#timing-group-dimensions"),
    ["首次访问日期", "国家", "版本号"].filter((field) => dashboardData.timing.dimensions.includes(field)),
    appState.timingGroupDimensions,
    (values) => {
      appState.timingGroupDimensions = values.length ? values : ["首次访问日期"];
      rerender();
    },
    {
      multiple: true,
      size: 5,
      summary: (values) => values.length ? `已选 ${values.length} 个拆分维度` : "不拆分，直接看总表",
    }
  );

  const timingControls = [
    ["#timing-project", "项目代号", "timingProject"],
    ["#timing-report-date", "报表日期", "timingReportDate"],
    ["#timing-first-date", "首次访问日期", "timingFirstVisitDate"],
    ["#timing-country", "国家", "timingCountry"],
    ["#timing-version", "版本号", "timingVersion"],
    ["#timing-event", "通知时机", "timingTiming"],
  ];
  for (const [selector, field, stateKey] of timingControls) {
    const node = document.querySelector(selector);
    if (!node) continue;
    const block = node.closest(".control-block");
    if (field === "通知时机") {
      const label = block?.querySelector("label");
      if (label) {
        label.textContent = activeTimingObjectLabel();
      }
    }
    const shouldShow = dashboardData.timing.dimensions.includes(field);
    if (block) {
      block.style.display = shouldShow ? "" : "none";
    }
    if (!shouldShow) continue;
    const timingItems = timingOptionsFor(field);
    if (!appState[stateKey].every((value) => timingItems.includes(value))) {
      appState[stateKey] = appState[stateKey].filter((value) => timingItems.includes(value));
    }
    if (!appState[stateKey].length) {
      if (field === "国家" || field === "版本号") {
        appState[stateKey] = timingItems.includes("全部") ? ["全部"] : timingItems.slice(0, 1);
      } else if (field === "项目代号") {
        appState[stateKey] = timingItems.includes("全部") ? ["全部"] : timingItems.slice(0, 2);
      } else if (field === "首次访问日期") {
        appState[stateKey] = timingItems.slice(-5);
      } else if (field === "通知时机") {
        appState[stateKey] = timingItems.filter((item) => item !== "全部");
      } else {
        appState[stateKey] = timingItems.slice(-1);
      }
    }
    renderMultiSelect(
      node,
      timingItems,
      appState[stateKey],
      (values) => {
        if (field === "报表日期") {
          appState[stateKey] = values ? [values] : [];
        } else if (field === "国家" || field === "版本号") {
          let nextValues = values;
          const hadAllSelected = appState[stateKey].includes("全部");
          if (nextValues.includes?.("全部")) {
            nextValues = hadAllSelected && nextValues.length > 1
              ? nextValues.filter((item) => item !== "全部")
              : ["全部"];
          } else {
            nextValues = nextValues.filter((item) => item !== "全部");
          }
          appState[stateKey] = nextValues.length ? nextValues : ["全部"];
        } else if (values.includes?.("全部")) {
          appState[stateKey] = ["全部"];
        } else {
          appState[stateKey] = values;
        }
        rememberProjectDateSelection(appState.activeWorkspace, field);
        rerender();
      },
      {
        multiple: field !== "报表日期",
        size: field === "首次访问日期" ? 8 : 6,
        summary: field === "通知时机"
          ? (values) => values.length ? `已选 ${values.length} 个${activeTimingObjectLabel()}` : `请选择${activeTimingObjectLabel()}`
          : field === "首次访问日期"
          ? (values) => values.length ? values.join("、") : "请选择首次访问日期"
          : field === "版本号"
          ? (values) => values.length ? values.join("、") : "请选择版本号"
          : field === "项目代号"
          ? (values) => values.length ? values.join("、") : "请选择项目"
          : field === "国家"
          ? (values) => values.length ? values.join("、") : "请选择国家"
          : null,
      }
    );
  }

  const timingProjectBlock = document.querySelector("[data-control='timing-project-filter']");
  if (timingProjectBlock) {
    timingProjectBlock.style.display = "";
  }
  const timingVersionBlock = document.querySelector("[data-control='timing-version-filter']");
  if (timingVersionBlock) {
    timingVersionBlock.style.display = "";
  }
  const timingCompareFieldBlock = document.querySelector("[data-control='timing-compare-field']");
  if (timingCompareFieldBlock) {
    timingCompareFieldBlock.style.display = "";
  }
}

function rerender() {
  renderWorkspaceChrome();
  buildControlSection();
  if (isFeatureWorkspace()) {
    renderFeature();
    return;
  }
  const analysis = computeCompareAnalysis();
  renderCompareSummary(analysis);
  renderCompareDetails(analysis);
  renderCountryStructure(analysis);
  renderFunnel();
  renderTiming();
}

function formatMissingProjectSummary(missingByProject) {
  const projectCodes = Object.keys(missingByProject || {}).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return projectCodes.map((project) => {
    const tables = missingByProject[project] || [];
    return tables.length ? `${project}（${tables.join("、")}）` : project;
  }).join("、");
}

function renderDataMeta() {
  const meta = document.querySelector("#data-meta");
  if (!meta) return;

  meta.textContent = "";
  const timeText = document.createElement("span");
  timeText.textContent = `最近更新时间：${dashboardData.generatedAt}`;
  meta.appendChild(timeText);

  const syncStatus = dashboardData.syncStatus || {};
  const missingText = formatMissingProjectSummary(syncStatus.missingByProject);
  if (missingText) {
    const missingBadge = document.createElement("span");
    missingBadge.className = "meta-status warning";
    missingBadge.textContent = `未更新项目：${missingText}`;
    meta.appendChild(missingBadge);
    return;
  }

  if (Array.isArray(syncStatus.expectedProjects) && syncStatus.expectedProjects.length) {
    const okBadge = document.createElement("span");
    okBadge.className = "meta-status ok";
    okBadge.textContent = "全部项目已更新";
    meta.appendChild(okBadge);
  }
}

function bootstrap() {
  ensureDefaults();
  applyWorkspaceDefaults(appState.activeWorkspace);
  renderDataMeta();
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".multi-select-shell")) {
      document.querySelectorAll(".multi-select-shell.open").forEach((node) => node.classList.remove("open"));
      document.querySelectorAll(".panel.select-open").forEach((node) => node.classList.remove("select-open"));
      appState.openSelectId = null;
    }
  });
  rerender();
}

bootstrap();

