const DEFAULT_API_BASE_URL = 'http://localhost:8000';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

const CHART_COLORS = ['#c9a15c', '#27a57a', '#de5b52', '#7c5cff', '#5a8dee'];

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatCurrency = (value) =>
  `$${toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatPercent = (value) => `${toNumber(value).toFixed(1)}%`;

const normalizeStatusLabel = (status) => {
  if (!status) return '-';
  return String(status).replace(/_/g, ' ').trim();
};

const shortLabel = (value, fallback) => {
  const label = (value || fallback || '-').trim();
  return label.length > 18 ? `${label.slice(0, 18)}...` : label;
};

const withColor = (items) =>
  items.map((item, index) => ({
    ...item,
    color: item.color || CHART_COLORS[index % CHART_COLORS.length],
  }));

const flattenBoqTree = (nodes = []) =>
  nodes.flatMap((node) => [node, ...flattenBoqTree(node.children || [])]);

const toBoqChartNodes = (nodes = []) => {
  const rootNodes = Array.isArray(nodes) ? nodes : [];
  const summaryNodes = rootNodes.filter(
    (node) => toNumber(node.total_budget) > 0 && node.row_type !== 'GRAND_TOTAL'
  );

  if (summaryNodes.length > 0) {
    return summaryNodes;
  }

  return flattenBoqTree(rootNodes).filter(
    (node) =>
      toNumber(node.total_budget) > 0 &&
      node.row_type === 'LINE_ITEM' &&
      (!node.children || node.children.length === 0)
  );
};

const toProjectCardItem = (project) => {
  const id = project.project_id || project.id || '';
  const total = toNumber(project.total_budget ?? project.contingency_budget);
  const progressPercent = toNumber(project.progress_percent);

  return {
    id,
    name: project.name || 'Untitled Project',
    projectType: project.project_type || '-',
    status: normalizeStatusLabel(project.status),
    rawStatus: project.status || '-',
    progressPercent,
    spent: toNumber(project.spent, total * (progressPercent / 100)),
    total,
    overheadPercent: toNumber(project.overhead_percent),
    profitPercent: toNumber(project.profit_percent),
    vatPercent: toNumber(project.vat_percent),
    contingencyBudget: toNumber(project.contingency_budget, total),
  };
};

async function apiRequest(path, options = {}) {
  const { timeoutMs = 30000, headers, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      signal: controller.signal,
      ...fetchOptions,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }
    throw error;
  }
  clearTimeout(timeoutId);

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail =
      payload?.detail || payload?.message || `Request failed with status ${response.status}`;
    throw new Error(detail);
  }

  if (payload?.status && payload.status !== 'success') {
    throw new Error(payload.detail || 'API request failed.');
  }

  return payload?.data ?? payload;
}

export async function getDashboardData() {
  const data = await apiRequest('/api/v1/dashboard/summary');

  const kpis = data?.kpis || {};
  const monthlyCashflow = Array.isArray(data?.monthly_cashflow) ? data.monthly_cashflow : [];

  const totalIncome = monthlyCashflow.reduce((sum, item) => sum + toNumber(item.income), 0);
  const totalExpense = monthlyCashflow.reduce((sum, item) => sum + toNumber(item.expense), 0);
  const balance = totalIncome - totalExpense;

  const shipmentData = monthlyCashflow.map((item) => ({
    name: item.month || '-',
    green: toNumber(item.income),
    red: toNumber(item.expense),
  }));

  const budgetData = withColor(
    [
      { name: 'Budget', value: toNumber(kpis.total_budget) },
      { name: 'Actual Cost', value: toNumber(kpis.actual_cost) },
      { name: 'Overdue', value: toNumber(kpis.overdue_amount) },
    ].filter((item) => item.value > 0)
  );

  const wagesData = withColor(
    [
      { id: 'income', value: totalIncome },
      { id: 'expense', value: totalExpense },
      { id: 'balance', value: Math.max(balance, 0) },
    ].filter((item) => item.value > 0)
  );

  const valueData = withColor(
    monthlyCashflow.map((item) => ({
      name: item.month || '-',
      value: toNumber(item.income),
    }))
  );

  const workPeriodData = withColor(
    monthlyCashflow.map((item) => ({
      name: item.month || '-',
      value: toNumber(item.expense),
    }))
  );

  return {
    stats: [
      { title: 'งบรวม', value: formatCurrency(kpis.total_budget) },
      { title: 'ต้นทุนจริง', value: formatCurrency(kpis.actual_cost) },
      { title: 'รออนุมัติ', value: String(toNumber(kpis.pending_approval_count)) },
      {
        title: 'Margin',
        value: kpis.total_profit_margin || formatPercent(0),
      },
    ],
    shipmentData,
    budgetData,
    wagesData,
    valueData,
    workPeriodData,
  };
}

export async function getProjectsData() {
  const data = await apiRequest('/api/v1/projects');
  const projects = Array.isArray(data) ? data : [];

  return projects.map(toProjectCardItem);
}

export async function createProject(payload) {
  const project = await apiRequest('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return toProjectCardItem(project);
}

export async function updateProject(projectId, payload) {
  const project = await apiRequest(`/api/v1/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return toProjectCardItem(project);
}

export async function syncProjectBoq(payload) {
  return apiRequest('/api/v1/projects/boq/sync', {
    method: 'POST',
    timeoutMs: 195000,
    body: JSON.stringify({
      project_id: payload.projectId,
      boq_type: payload.boqType,
      sheet_url: payload.sheetUrl,
      sheet_name: payload.sheetName,
    }),
  });
}

export async function getProjectBoqTabs(payload) {
  return apiRequest('/api/v1/projects/boq/tabs', {
    method: 'POST',
    timeoutMs: 45000,
    body: JSON.stringify({
      sheet_url: payload.sheetUrl,
    }),
  });
}

export async function syncProjectBoqBatch(payload) {
  const selectedSheetNames = Array.isArray(payload.sheetNames)
    ? payload.sheetNames.filter(Boolean)
    : [];

  return apiRequest('/api/v1/projects/boq/sync-batch', {
    method: 'POST',
    timeoutMs: 30000,
    body: JSON.stringify({
      project_id: payload.projectId,
      boq_type: payload.boqType,
      sheet_url: payload.sheetUrl,
      sheet_names: selectedSheetNames,
    }),
  });
}

export async function getProjectBoqSyncJob(jobId) {
  return apiRequest(`/api/v1/projects/boq/sync-jobs/${jobId}`, {
    timeoutMs: 30000,
  });
}

export async function getProjectDetailData(projectId) {
  const project = await apiRequest(`/api/v1/projects/${projectId}`);

  const boqResponse = await apiRequest(`/api/v1/projects/${projectId}/boq`).catch(() => null);
  const boqTree = Array.isArray(boqResponse?.boq_tree) ? boqResponse.boq_tree : [];
  const chartNodes = toBoqChartNodes(boqTree);
  const topItems = chartNodes
    .filter((item) => toNumber(item.total_budget) > 0)
    .sort((left, right) => toNumber(right.total_budget) - toNumber(left.total_budget))
    .slice(0, 5);

  const chartBase = topItems.map((item, index) => ({
    name: shortLabel(item.description || item.item_no, `BOQ ${index + 1}`),
    totalBudget: toNumber(item.total_budget),
    laborBudget: toNumber(item.labor_budget),
    materialBudget: toNumber(item.material_budget),
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return {
    projectId: project.project_id || project.id || projectId,
    name: project.name || boqResponse?.project_name || 'Project',
    stats: [
      { title: 'สถานะ', value: normalizeStatusLabel(project.status) },
      { title: 'งบสำรอง', value: formatCurrency(project.contingency_budget) },
      { title: 'Overhead', value: formatPercent(project.overhead_percent) },
      { title: 'Profit', value: formatPercent(project.profit_percent) },
    ],
    shipmentData: chartBase.map((item) => ({
      name: item.name,
      green: item.totalBudget,
      red: item.laborBudget,
    })),
    salesData: chartBase.map((item) => ({
      name: item.name,
      sales: item.totalBudget,
      target: Math.max(item.totalBudget, item.materialBudget + item.laborBudget),
    })),
    wagesData: chartBase
      .filter((item) => item.laborBudget > 0)
      .map((item) => ({
        id: item.name,
        value: item.laborBudget,
        color: item.color,
      })),
    valueData: chartBase.map((item) => ({
      name: item.name,
      value: item.totalBudget,
      color: item.color,
    })),
    workPeriodData: chartBase
      .filter((item) => item.materialBudget > 0)
      .map((item) => ({
        name: item.name,
        value: item.materialBudget,
        color: item.color,
      })),
  };
}

export async function fetchData(type, param = null) {
  switch (type) {
    case 'dashboard':
      return getDashboardData();
    case 'projects':
      return getProjectsData();
    case 'project_detail':
      return getProjectDetailData(param);
    case 'insights':
      return {
        filters: ['ผู้ทำรายการทั้งหมด', 'หมวดหมู่ทั้งหมด', 'เดือน', 'ปี'],
      };
    case 'settings': {
      const data = await apiRequest('/api/v1/settings/subcontractors').catch(() => []);
      return Array.isArray(data) ? data : [];
    }
    default:
      return null;

      
// Helper for temporary mock data until backend is ready
const getMockData = (type) => {
  const mocks = {
    dashboard: { total_projects: 0, total_expenses: 0, projects: [] },
    projects: [],
    insights: { data: [] },
    settings: {}
  };
  return mocks[type] || [];
};

export const fetchData = async (type, param = null) => {
  try {
    let url = `${API_BASE_URL}/api/${type}`;
    if (param) url += `?param=${encodeURIComponent(param)}`;

    const response = await fetch(url);
    
    // Check if response is JSON to prevent crashes when backend is not ready
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      console.warn(`Backend not ready or invalid response for ${type}. Returning mock data.`);
      return getMockData(type);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return getMockData(type);
  }
};

export const postData = async (type, data) => {
  try {
    const url = `${API_BASE_URL}/api/${type}`;
    const options = {
      method: 'POST',
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      body: data instanceof FormData ? data : JSON.stringify(data),
    };

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");
    
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      console.warn(`Backend not ready for POST ${type}. Simulating success.`);
      return { success: true, message: 'Mock success' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Post Error:', error);
    return { success: true, message: 'Mock success' };
  }
}

export { API_BASE_URL, compactNumber };
