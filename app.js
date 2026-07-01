const dashboardData = window.FR_DASHBOARD_DATA;

const DIMENSION_LABELS = ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"];
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
  return dayMatches.every((token) => ["D0", "D1", "D2"].includes(token.toUpperCase()));
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
  activeWorkspace: "paid_country",
  analysisMode: "single_project",
  countryMode: "single_country",
  openSelectId: null,
  selectScrollTops: {},
  filters: {
    报表日期: [],
    项目代号: [],
    首次访问日期: [],
    国家: [],
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
  if (field === "版本号") {
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
    版本号: (appState.filters["版本号"] || []).slice(),
    compareMetrics: (appState.compareMetrics || []).slice(),
    groupDimensions: (appState.groupDimensions || []).slice(),
  };
}

function getWorkspaceMemory(workspaceKey) {
  return appState.workspaceMemory[workspaceKey] || {};
}

function projectDateShareGroup(workspaceKey) {
  if (["country_opt", "version_iteration"].includes(workspaceKey)) {
    return "single";
  }
  if (["paid_country", "cross_project", "timing_special", "notification_copy", "feature_module"].includes(workspaceKey)) {
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
        <td class="best-summary-cell">${bestValue ? bestValue.subject : "NA"}</td>
        <td class="weak-summary-cell">${weakestValue ? weakestValue.subject : "NA"}</td>
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

function versionOptionsForRows(rows) {
  return sortDimensionValues(
    "版本号",
    uniqueValues(rows, "版本号").filter((value) => value !== "全部")
  );
}

function versionFilterOptionsForWorkspace(rows) {
  const versions = versionOptionsForRows(rows);
  if (appState.activeWorkspace === "country_opt") {
    return ["全部", ...versions];
  }
  return versions;
}

function topCountriesByUsers(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const country = row["国家"];
    if (!country || country === "全部") return;
    const next = (groups.get(country) || 0) + Number(row["新增用户数"] || 0);
    groups.set(country, next);
  });
  return [...groups.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([country]) => country);
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
  if (workspaceKey === "country_opt") {
    const projects = optionsFor("项目代号").filter((item) => item !== "全部");
    appState.filters["项目代号"] = preferredSingleProjectSelection(appState.filters["项目代号"], projects);
    keepValidSelections("报表日期", optionsFor("报表日期").slice(-1));
    keepValidSelections("首次访问日期", optionsFor("首次访问日期").slice(-5));
    applySharedProjectDateToWorkspace(workspaceKey);
    const countryOptions = getCountryUniverse("国家", appState.compareValues, baseRowsForAnalysis());
    const rememberedCountries = (workspaceMemory["国家"] || []).filter((item) => countryOptions.includes(item));
    appState.filters["国家"] = rememberedCountries.length ? rememberedCountries : countryOptions.slice(0, 1);
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
    appState.compareValues = appState.filters["项目代号"].slice();
  }
  if (workspaceKey === "version_iteration" || workspaceKey === "cross_project") {
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
  if (nav) {
    nav.innerHTML = Object.entries(WORKSPACES).map(([key, item]) => `
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
  const showFunnel = false;
  const showStructure = appState.activeWorkspace === "cross_project";
  const showCompareDetails = showCompare && appState.activeWorkspace !== "paid_country";

  setHidden(sections.compareControls, !showCompare);
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

  if (appState.activeWorkspace === "paid_country") {
    compareControlsTitle.textContent = "买量国家对比控制台";
    summaryTitle.textContent = "买量国家对比速览";
    summaryDesc.textContent = "先看 top 10 国家用户占比在时间维度上的变化，再看不同项目之间的横向差异。";
    detailsTitle.textContent = "分国家指标明细";
    detailsDesc.textContent = "按首次访问日期拆开看 top 10 国家之间的新增用户和质量指标差异。";
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
  if (appState.activeWorkspace === "cross_project") {
    rows = rows.filter((row) => row["版本号"] === "全部");
  }
  return rows;
}

function availableCompareFields() {
  if (appState.activeWorkspace === "paid_country") {
    return ["国家"];
  }
  return appState.analysisMode === "single_project"
    ? ["版本号", "国家", "首次访问日期"]
    : ["项目代号", "国家", "首次访问日期"];
}

function activeFilterFields() {
  if (appState.activeWorkspace === "paid_country") {
    return ["报表日期", "项目代号", "首次访问日期"];
  }
  if (appState.activeWorkspace === "cross_project") {
    return ["项目代号", "国家", "报表日期", "首次访问日期"];
  }
  if (appState.analysisMode === "single_project") {
    return ["报表日期", "项目代号", "首次访问日期", "国家", "版本号"];
  }
  return ["报表日期", "项目代号", "首次访问日期", "国家"];
}

function visibleFilterFields(compareField) {
  if (appState.activeWorkspace === "version_iteration" && compareField === "版本号") {
    return activeFilterFields();
  }
  if (appState.activeWorkspace === "cross_project" && compareField === "项目代号") {
    return activeFilterFields();
  }
  return activeFilterFields().filter((field) => field !== compareField);
}

function getCountryUniverse(compareField, compareValues, rows) {
  const actualCountries = topCountriesByUsers(rows).filter((country) => country !== "全部");
  if (appState.activeWorkspace === "version_iteration") {
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
  if (appState.activeWorkspace === "cross_project") {
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
  const compareSourceRows = appState.activeWorkspace === "paid_country" ? filteredRows : compareBaseRows;
  const compareCandidates = compareValueOptions(compareSourceRows, compareField);
  const compareValues = appState.activeWorkspace === "paid_country"
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

function renderCompareSummary(analysis) {
  const host = document.querySelector("#compare-summary");
  if (!analysis.filteredRows.length) {
    host.innerHTML = `<div class="empty-state">当前筛选下没有可对比的数据。</div>`;
    return;
  }
  if (appState.activeWorkspace === "paid_country") {
    renderPaidCountrySummary(host, analysis);
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

function renderPaidCountrySummary(host, analysis) {
  const scopedRows = analysis.filteredRows.filter((row) => row["版本号"] === "全部");
  const selectedProjects = sortDimensionValues("项目代号", [...new Set(scopedRows.map((row) => row["项目代号"]))].filter(Boolean));
  const selectedDates = sortDimensionValues("首次访问日期", [...new Set(scopedRows.map((row) => row["首次访问日期"]))].filter(Boolean));
  const topCountries = topCountriesByUsers(scopedRows).slice(0, 10);
  const totalUsersForRows = (rows) => {
    const aggregateValue = aggregateRows(rows.filter((row) => row["国家"] === "全部"), ["新增用户数"])?.["新增用户数"] || 0;
    if (aggregateValue > 0) {
      return aggregateValue;
    }
    return aggregateRows(rows.filter((row) => row["国家"] !== "全部"), ["新增用户数"])?.["新增用户数"] || 0;
  };
  const verticalCards = topCountries.map((country) => {
    const series = selectedProjects.map((project) => {
      const points = selectedDates.map((date) => {
        const rows = scopedRows.filter((row) => row["项目代号"] === project && row["首次访问日期"] === date);
        const totalUsers = totalUsersForRows(rows);
        const countryUsers = aggregateRows(rows.filter((row) => row["国家"] === country), ["新增用户数"])?.["新增用户数"] || 0;
        return {
          date,
          value: totalUsers > 0 ? countryUsers / totalUsers : null,
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
      return `<div><strong>${item.project}</strong>：${formatMetric("通知授权率_D0", firstPoint.value)} → ${formatMetric("通知授权率_D0", lastPoint.value)}</div>`;
    }).filter(Boolean).join("");
    return `
      <div class="stat-card" style="padding:22px 24px;">
        <div class="eyebrow">竖向对比</div>
        <div class="stat-title" style="font-size:22px; line-height:1.35; margin-bottom:10px;">${country}</div>
        <div class="chart-legend" style="margin-top:4px; margin-bottom:8px;">
          ${series.map((item, index) => `
            <span class="chart-legend-item">
              <i style="background:${SERIES_COLORS[index % SERIES_COLORS.length]}"></i>${item.project}
            </span>
          `).join("")}
        </div>
        ${paidCountryLineChartSvg(country, selectedDates, series)}
        <div class="muted" style="margin-top:10px; line-height:1.8;">
          ${summaryParts}
        </div>
      </div>
    `;
  }).filter(Boolean).join("");

  const verticalSummaryCards = selectedProjects.map((project) => {
    const countryDeltas = topCountries.map((country) => {
      const validPoints = selectedDates.map((date) => {
        const rows = scopedRows.filter((row) => row["项目代号"] === project && row["首次访问日期"] === date);
        const totalUsers = totalUsersForRows(rows);
        const countryUsers = aggregateRows(rows.filter((row) => row["国家"] === country), ["新增用户数"])?.["新增用户数"] || 0;
        return {
          date,
          value: totalUsers > 0 ? countryUsers / totalUsers : null,
        };
      }).filter((point) => point.value !== null && point.value !== undefined && !Number.isNaN(point.value));
      if (validPoints.length < 2) {
        return null;
      }
      const firstPoint = validPoints[0];
      const lastPoint = validPoints[validPoints.length - 1];
      return {
        country,
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
          <div class="muted" style="line-height:1.8;">当前只选了 1 个首次访问日期，暂时看不出国家占比的明显变化。</div>
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
        return `<div style="padding:10px 12px; border-radius:12px; background:rgba(86,102,115,0.06); color:#5c6c76;">暂无明显${direction === "up" ? "上升" : "下降"}国家</div>`;
      }
      return items.map((item) => `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding:10px 12px; border-radius:12px; background:${direction === "up" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"};">
          <div style="min-width:0;">
            <strong style="font-size:15px; color:#24323b;">${item.country}</strong>
            <div style="margin-top:4px; color:#5c6c76;">${formatMetric("通知授权率_D0", item.firstPoint.value)} → ${formatMetric("通知授权率_D0", item.lastPoint.value)}</div>
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
    const countryStats = topCountriesByUsers(rows)
      .slice(0, 10)
      .map((country) => {
        const users = aggregateRows(rows.filter((row) => row["国家"] === country), ["新增用户数"])?.["新增用户数"] || 0;
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
        <div class="stat-value" style="font-size:16px; margin-top:0;">top 10 国家结构</div>
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
          当前按新增用户数从高到低展示该项目的 top 10 国家结构。
        </div>
      </div>
    `;
  }).join("");

  host.innerHTML = `
    <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px;">
      ${projectCards}
    </div>
    <div class="narrative-block" style="margin-top:18px;">
      <h3>先看各项目里哪些国家占比变化最明显</h3>
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:18px; margin-top:14px;">
        ${verticalSummaryCards}
      </div>
    </div>
    <div class="narrative-block" style="margin-top:18px;">
      <h3>竖向看单国家占全部用户的比例变化</h3>
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

  const versionIterationChecks = isVersionIteration
    ? comparedSubjects.map((subject) => {
        const dateUsers = selectedDates.map((date) => {
          const scopedRows = analysis.filteredRows.filter((row) => row["版本号"] === subject && row["首次访问日期"] === date);
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

  if (isVersionIteration) {
    const qualifiedSubjects = qualifiedVersionSubjects.map((item) => item.subject);
    const metricInsights = sortCompareMetrics(analysis.compareMetrics.filter((metric) => metric !== "新增用户数"))
      .map((metric) => {
        const values = qualifiedSubjects.map((subject) => {
          let rows = analysis.filteredRows.filter((row) =>
            row["版本号"] === subject && qualifiedVersionDateMap.get(subject)?.has(row["首次访问日期"])
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

    const metricCards = metricInsights.slice(0, 4).map((item) => `
      <div class="stat-card">
        <div class="eyebrow">关键指标差异</div>
        <div class="stat-title">${item.metric}</div>
        <div class="stat-value">${item.best.subject} 更优</div>
        <div class="muted">
          ${item.best.subject}：${formatMetric(item.metric, item.best.value)}<br/>
          ${item.worst.subject}：${formatMetric(item.metric, item.worst.value)}<br/>
          差异：${item.kind === "rate" ? `${(item.diff * 100).toFixed(2)} pct` : formatMetric(item.metric, item.diff)}
        </div>
      </div>
    `).join("");

    const secondStepBlock = qualifiedSubjects.length < 2
      ? `
        <div class="empty-state">
          当前样本达标的版本不足 2 个，第二点暂时不输出版本优劣结论。
        </div>
      `
      : `
        <div class="stats-grid" style="margin-top:14px;">
          <div class="stat-card">
            <div class="eyebrow">综合判断</div>
            <div class="stat-title">${bestVersion?.subject || "NA"}</div>
            <div class="stat-value">当前更优</div>
            <div class="muted">
              领先指标数：${bestVersion?.leads.length || 0}<br/>
              好在：${bestVersion?.leads.length ? bestVersion.leads.join("、") : "暂无明显领先指标"}
            </div>
          </div>
          <div class="stat-card">
            <div class="eyebrow">需要关注</div>
            <div class="stat-title">${weakVersion?.subject || "NA"}</div>
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
      <div class="narrative-block">
        <h3>第二点：再分析样本达标版本的数据差异</h3>
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
        <div class="table-wrap">
          <table class="metric-table">
            <thead>
              <tr>
                <th>指标</th>
                ${group.validSubjects.map((subject) => `<th>${subject}</th>`).join("")}
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
  const isPaidCountry = appState.activeWorkspace === "paid_country";
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
  const shouldHideCompareValues = isPaidCountry || appState.activeWorkspace === "version_iteration" || appState.activeWorkspace === "cross_project";
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
    groupDimensionsBlock.style.display = isPaidCountry ? "none" : "";
  }
  if (groupDimensionsWrap) {
    groupDimensionsWrap.style.display = isPaidCountry ? "none" : "";
  }
  if (compareMetricsBlock) {
    compareMetricsBlock.style.display = isPaidCountry ? "none" : "";
  }
  if (compareMetricsWrap) {
    compareMetricsWrap.style.display = isPaidCountry ? "none" : "";
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

  const countryUniverse = getCountryUniverse(appState.compareField, appState.compareValues, baseRowsForAnalysis());
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
    } else if (field === "版本号" && appState.analysisMode === "single_project") {
      items = versionFilterOptionsForWorkspace(baseRowsForAnalysis());
    } else {
      items = optionsFor(field);
    }
    const isSingleProjectField = field === "项目代号" && appState.analysisMode === "single_project";
    const isSingleCountryField = field === "国家" && appState.countryMode === "single_country";
    const selectedForControl = (isSingleProjectField || isSingleCountryField)
      ? appState.filters[field].slice(0, 1)
      : appState.filters[field];
    renderMultiSelect(
      wrap,
      items,
      selectedForControl,
      (value) => {
        if (isSingleProjectField || isSingleCountryField) {
          appState.filters[field] = value ? [value] : [];
        } else {
          let nextValues = value;
          if (field === "国家" || field === "版本号") {
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
          if ((field === "国家" || field === "版本号") && items.includes("全部")) {
            appState.filters[field] = field === "版本号" && appState.activeWorkspace === "version_iteration"
              ? (defaultRecentVersionValues(baseRowsForAnalysis()).length ? defaultRecentVersionValues(baseRowsForAnalysis()) : items.slice(0, 1))
              : ["全部"];
          } else {
            appState.filters[field] = items.slice(0, isSingleProjectField ? 1 : items.length);
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
        }
        if (field === "项目代号" && appState.activeWorkspace === "cross_project") {
          appState.compareValues = appState.filters["项目代号"].slice();
          const sharedCountries = getCountryUniverse("项目代号", appState.compareValues, baseRowsForAnalysis());
          const previousCountry = appState.filters["国家"]?.[0];
          appState.filters["国家"] = previousCountry && sharedCountries.includes(previousCountry)
            ? [previousCountry]
            : (sharedCountries.includes("全部") ? ["全部"] : sharedCountries.slice(0, 1));
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
        rerender();
      },
      {
        multiple: !(isSingleProjectField || isSingleCountryField),
        size: field === "首次访问日期" ? 8 : 6,
        placeholder: "请选择",
      }
    );
  }

  const versionControl = document.querySelector("[data-control='version-filter']");
  if (versionControl) {
    versionControl.style.display = appState.analysisMode === "single_project" && !isPaidCountry ? "" : "none";
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
      if (!appState.groupDimensions.length && appState.activeWorkspace === "version_iteration") {
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

function bootstrap() {
  ensureDefaults();
  applyWorkspaceDefaults(appState.activeWorkspace);
  document.querySelector("#data-meta").textContent =
    `最近更新时间：${dashboardData.generatedAt}`;
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

