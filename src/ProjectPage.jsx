import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  createProject,
  getProjectBoqSyncJob,
  getProjectBoqTabs,
  getProjectsData,
  syncProjectBoqBatch,
  updateProject,
} from './api';
import Loading from './components/Loading';
import CircularProgress from './components/CircularProgress';
import SemiCircleGauge from './components/SemiCircleGauge';

const INITIAL_PROJECT_FORM = {
  name: '',
  project_type: 'COMMERCIAL',
  overhead_percent: '0',
  profit_percent: '0',
  vat_percent: '7',
  contingency_budget: '0',
  status: 'ACTIVE',
};

const INITIAL_SYNC_FORM = {
  boqType: 'CUSTOMER',
  sheetUrl: '',
};

const PROJECT_TYPE_OPTIONS = ['COMMERCIAL', 'INDUSTRIAL', 'HOTEL', 'WAREHOUSE', 'RESIDENTIAL'];
const PROJECT_STATUS_OPTIONS = ['ACTIVE', 'PLANNING', 'ON_HOLD', 'COMPLETED'];
const MAX_BATCH_SYNC_TABS = 5;
const ACTIVE_SYNC_JOB_STATUSES = new Set(['QUEUED', 'RUNNING']);

const buttonStyle = {
  border: 'none',
  borderRadius: '24px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid #dfdfdf',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: 'white',
  color: '#1a1a1a',
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const FilterSelect = ({ icon: Icon, value, onChange, options }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '24px',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    {Icon ? <Icon size={18} color="#666" /> : null}
    <select
      value={value}
      onChange={onChange}
      style={{
        border: 'none',
        background: 'transparent',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        outline: 'none',
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown size={16} color="#666" />
  </div>
);

const DrawerField = ({ label, children, helper }) => (
  <label style={fieldGroupStyle}>
    <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>{label}</span>
    {children}
    {helper ? <span style={{ fontSize: '12px', color: '#8a8a8a' }}>{helper}</span> : null}
  </label>
);

const ProjectCard = ({ project, index, onClick, onEditName, onOpenSync }) => {
  const { id, name, spent, total, status, progressPercent, projectType } = project;
  const left = total - spent;
  const normalizedStatus = String(status || '').toLowerCase();
  const isOnTrack =
    normalizedStatus.includes('active') ||
    normalizedStatus.includes('track') ||
    normalizedStatus.includes('complete') ||
    normalizedStatus.includes('approved');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditName(name);
  }, [name]);

  const handleEditClick = (event) => {
    event.stopPropagation();
    setSaveError('');
    setIsEditing(true);
  };

  const handleSave = async (event) => {
    event.stopPropagation();

    if (editName.trim() === '' || editName === name) {
      setEditName(name);
      setIsEditing(false);
      setSaveError('');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError('');
      await onEditName(id, editName);
      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message || 'Failed to rename project.');
      setEditName(name);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave(event);
    }
    if (event.key === 'Escape') {
      event.stopPropagation();
      setEditName(name);
      setIsEditing(false);
      setSaveError('');
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        cursor: 'pointer',
        border: '1px solid #f0f0f0',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, marginRight: '8px' }}>
          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(event) => event.stopPropagation()}
              disabled={isSaving}
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                border: '1px solid #8a76fa',
                borderRadius: '8px',
                padding: '6px 8px',
                width: '100%',
                outline: 'none',
              }}
            />
          ) : (
            <>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{name}</h3>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{projectType}</div>
            </>
          )}
        </div>

        {!isEditing ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenSync(project);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #eee',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#666',
                cursor: 'pointer',
                flexShrink: 0,
                backgroundColor: 'white',
              }}
              title="Connect BOQ sheet"
            >
              <Link2 size={14} />
            </button>
            <button
              type="button"
              onClick={handleEditClick}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #eee',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#666',
                cursor: 'pointer',
                flexShrink: 0,
                backgroundColor: 'white',
              }}
              title="Rename project"
            >
              <Pencil size={14} />
            </button>
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <CircularProgress value={spent} max={Math.max(total, 1)} color="#8a76fa" bgColor="#f4f2ff" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Left</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                ${left.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: '12px', color: '#888' }}>
                /${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '12px',
              width: 'fit-content',
              fontSize: '11px',
              fontWeight: '600',
              backgroundColor: isOnTrack ? '#eefaf2' : '#fff8e6',
              color: isOnTrack ? '#27ae60' : '#f39c12',
            }}
          >
            {isOnTrack ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {status}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>Progress {progressPercent.toFixed(1)}%</div>
          {saveError ? <div style={{ fontSize: '12px', color: '#de5b52' }}>{saveError}</div> : null}
        </div>
      </div>
    </Motion.div>
  );
};

const ExpenseListItem = ({ name, amount, percentage, isUp }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f5f5f5',
    }}
  >
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#f4f2ff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#8a76fa',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>${amount.toLocaleString()}</div>
        <div style={{ fontSize: '12px', color: '#888' }}>{name}</div>
      </div>
    </div>

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        backgroundColor: isUp ? '#fceaea' : '#eefaf2',
        color: isUp ? '#e74c3c' : '#27ae60',
      }}
    >
      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {percentage}%
    </div>
  </div>
);

const ProjectPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForm, setProjectForm] = useState(INITIAL_PROJECT_FORM);
  const [syncForm, setSyncForm] = useState(INITIAL_SYNC_FORM);
  const [drawerError, setDrawerError] = useState('');
  const [syncResult, setSyncResult] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const [availableTabs, setAvailableTabs] = useState([]);
  const [selectedSheetNames, setSelectedSheetNames] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [amountFilter, setAmountFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await getProjectsData();
        setProjects(result);
      } catch (loadError) {
        setError(loadError.message || 'Failed to load projects.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode('create');
    setSelectedProject(null);
    setProjectForm(INITIAL_PROJECT_FORM);
    setSyncForm(INITIAL_SYNC_FORM);
    setDrawerError('');
    setSyncResult(null);
    setAvailableTabs([]);
    setSelectedSheetNames([]);
    setIsSyncing(false);
  };

  const openCreateDrawer = () => {
    setDrawerOpen(true);
    setDrawerMode('create');
    setSelectedProject(null);
    setProjectForm(INITIAL_PROJECT_FORM);
    setSyncForm(INITIAL_SYNC_FORM);
    setDrawerError('');
    setSyncResult(null);
    setAvailableTabs([]);
    setSelectedSheetNames([]);
  };

  const openSyncDrawer = (project) => {
    setDrawerOpen(true);
    setDrawerMode('sync');
    setSelectedProject(project);
    setSyncForm(INITIAL_SYNC_FORM);
    setDrawerError('');
    setSyncResult(null);
    setAvailableTabs([]);
    setSelectedSheetNames([]);
  };

  const handleProjectFormChange = (field, value) => {
    setProjectForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSyncFormChange = (field, value) => {
    setSyncForm((current) => ({
      ...current,
      [field]: value,
    }));
    setDrawerError('');
    setSyncResult(null);
    if (field === 'sheetUrl') {
      setAvailableTabs([]);
      setSelectedSheetNames([]);
    }
  };

  const handleLoadTabs = async () => {
    if (!syncForm.sheetUrl.trim()) {
      setDrawerError('Add a Google Sheet URL before loading workbook tabs.');
      return;
    }

    try {
      setIsLoadingTabs(true);
      setDrawerError('');
      setSyncResult(null);
      const response = await getProjectBoqTabs({
        sheetUrl: syncForm.sheetUrl.trim(),
      });
      const tabs = Array.isArray(response?.tabs) ? response.tabs : [];
      setAvailableTabs(tabs);
      setSelectedSheetNames(
        tabs
          .filter((tab) => tab.syncable && tab.default_selected)
          .slice(0, MAX_BATCH_SYNC_TABS)
          .map((tab) => tab.name)
      );
      setFlashMessage(`Loaded ${tabs.length} workbook tabs for review.`);
    } catch (loadTabsError) {
      setAvailableTabs([]);
      setSelectedSheetNames([]);
      setDrawerError(loadTabsError.message || 'Failed to load workbook tabs.');
    } finally {
      setIsLoadingTabs(false);
    }
  };

  const toggleSheetSelection = (sheetName) => {
    setSelectedSheetNames((current) =>
      current.includes(sheetName)
        ? current.filter((value) => value !== sheetName)
        : [...current, sheetName]
    );
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();

    try {
      setIsCreating(true);
      setDrawerError('');
      const createdProject = await createProject({
        ...projectForm,
        overhead_percent: Number(projectForm.overhead_percent),
        profit_percent: Number(projectForm.profit_percent),
        vat_percent: Number(projectForm.vat_percent),
        contingency_budget: Number(projectForm.contingency_budget),
      });

      setProjects((current) => [createdProject, ...current]);
      setSelectedProject(createdProject);
      setDrawerMode('sync');
      setSyncResult(null);
      setFlashMessage(`Project "${createdProject.name}" created successfully.`);
    } catch (createError) {
      setDrawerError(createError.message || 'Failed to create project.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameProject = async (projectId, nextName) => {
    const updatedProject = await updateProject(projectId, { name: nextName });

    setProjects((current) =>
      current.map((project) => (project.id === projectId ? { ...project, ...updatedProject } : project))
    );

    setSelectedProject((current) =>
      current && current.id === projectId ? { ...current, ...updatedProject } : current
    );
    setFlashMessage(`Project renamed to "${updatedProject.name}".`);
  };

  const handleSyncBoq = async (event) => {
    event.preventDefault();

    if (!selectedProject?.id) {
      setDrawerError('Create or select a project before syncing BOQ.');
      return;
    }
    if (!syncForm.sheetUrl.trim()) {
      setDrawerError('Add a Google Sheet URL before syncing BOQ.');
      return;
    }
    if (selectedSheetNames.length === 0) {
      setDrawerError('Select at least one workbook tab to sync.');
      return;
    }
    if (selectedSheetNames.length > MAX_BATCH_SYNC_TABS) {
      setDrawerError(`Sync up to ${MAX_BATCH_SYNC_TABS} tabs per batch for better performance.`);
      return;
    }

    try {
      setIsSyncing(true);
      setDrawerError('');
      const result = await syncProjectBoqBatch({
        projectId: selectedProject.id,
        boqType: syncForm.boqType,
        sheetUrl: syncForm.sheetUrl,
        sheetNames: selectedSheetNames,
      });
      setSyncResult(result);
      setFlashMessage(`BOQ batch sync queued for "${selectedProject.name}".`);
    } catch (syncError) {
      setIsSyncing(false);
      setDrawerError(syncError.message || 'Failed to sync BOQ tabs.');
    }
  };

  useEffect(() => {
    if (!syncResult?.job_id || !ACTIVE_SYNC_JOB_STATUSES.has(syncResult.status)) {
      return undefined;
    }

    let cancelled = false;
    const intervalId = window.setInterval(async () => {
      try {
        const nextJob = await getProjectBoqSyncJob(syncResult.job_id);
        if (cancelled) {
          return;
        }
        setSyncResult(nextJob);
        if (!ACTIVE_SYNC_JOB_STATUSES.has(nextJob.status)) {
          setIsSyncing(false);
          setFlashMessage(nextJob.message || 'BOQ batch sync finished.');
          window.clearInterval(intervalId);
        }
      } catch (jobError) {
        if (cancelled) {
          return;
        }
        setIsSyncing(false);
        setDrawerError(jobError.message || 'Failed to refresh BOQ sync job status.');
        window.clearInterval(intervalId);
      }
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [syncResult?.job_id, syncResult?.status]);

  const resetFilters = () => {
    setStatusFilter('ALL');
    setAmountFilter('ALL');
    setSortBy('DEFAULT');
  };

  const statusOptions = [
    { value: 'ALL', label: 'Status: All' },
    ...Array.from(new Set(projects.map((project) => project.rawStatus || project.status)))
      .filter(Boolean)
      .sort()
      .map((status) => ({
        value: status,
        label: `Status: ${String(status).replace(/_/g, ' ')}`,
      })),
  ];

  let filteredProjects = [...projects];

  if (statusFilter !== 'ALL') {
    filteredProjects = filteredProjects.filter((project) => project.rawStatus === statusFilter);
  }

  if (amountFilter === 'UNDER_3000000') {
    filteredProjects = filteredProjects.filter((project) => project.total < 3000000);
  }
  if (amountFilter === 'BETWEEN_3000000_5000000') {
    filteredProjects = filteredProjects.filter((project) => project.total >= 3000000 && project.total <= 5000000);
  }
  if (amountFilter === 'OVER_5000000') {
    filteredProjects = filteredProjects.filter((project) => project.total > 5000000);
  }

  if (sortBy === 'NAME_ASC') {
    filteredProjects.sort((left, right) => left.name.localeCompare(right.name));
  } else if (sortBy === 'BUDGET_DESC') {
    filteredProjects.sort((left, right) => right.total - left.total);
  } else if (sortBy === 'BUDGET_ASC') {
    filteredProjects.sort((left, right) => left.total - right.total);
  } else if (sortBy === 'PROGRESS_DESC') {
    filteredProjects.sort((left, right) => right.progressPercent - left.progressPercent);
  }

  const totalSpent = filteredProjects.reduce((accumulator, project) => accumulator + project.spent, 0);
  const totalBudget = filteredProjects.reduce((accumulator, project) => accumulator + project.total, 0);
  const sortedProjects = [...filteredProjects].sort((left, right) => right.spent - left.spent);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="card" style={{ backgroundColor: 'white', color: '#de5b52' }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>Project</h1>
              <p style={{ color: '#888', fontSize: '14px' }}>Create, rename, and connect BOQ sheets for your projects</p>
            </div>
            <button
              type="button"
              onClick={openCreateDrawer}
              style={{
                ...buttonStyle,
                backgroundColor: '#8a76fa',
                color: 'white',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={18} />
              Add new project
            </button>
          </div>

          {flashMessage ? (
            <div
              className="card"
              style={{
                marginBottom: '20px',
                backgroundColor: '#eefaf2',
                color: '#217a45',
                border: '1px solid #d9f0df',
              }}
            >
              {flashMessage}
            </div>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="card" style={{ padding: '8px', borderRadius: '12px' }}>
                <Calendar size={20} />
              </div>
              <FilterSelect
                icon={ArrowUpDown}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                options={[
                  { value: 'DEFAULT', label: 'Sort: Default' },
                  { value: 'NAME_ASC', label: 'Sort: Name A-Z' },
                  { value: 'BUDGET_DESC', label: 'Sort: Budget high-low' },
                  { value: 'BUDGET_ASC', label: 'Sort: Budget low-high' },
                  { value: 'PROGRESS_DESC', label: 'Sort: Progress high-low' },
                ]}
              />
              <div className="card" style={{ padding: '8px', borderRadius: '50%' }}>
                <SlidersHorizontal size={20} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <FilterSelect
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                options={statusOptions}
              />
              <FilterSelect
                value={amountFilter}
                onChange={(event) => setAmountFilter(event.target.value)}
                options={[
                  { value: 'ALL', label: 'Amount: All' },
                  { value: 'UNDER_3000000', label: 'Amount: Under 3M' },
                  { value: 'BETWEEN_3000000_5000000', label: 'Amount: 3M - 5M' },
                  { value: 'OVER_5000000', label: 'Amount: Over 5M' },
                ]}
              />
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#8a76fa',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                <RotateCw size={16} />
                <span>Reset all</span>
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>{filteredProjects.length} items</p>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="card" style={{ backgroundColor: 'white', color: '#666' }}>
              No projects match the selected filters yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id || index}
                  project={project}
                  index={index}
                  onEditName={handleRenameProject}
                  onOpenSync={openSyncDrawer}
                  onClick={() =>
                    navigate(`/project/detail/${project.id}`, {
                      state: { projectName: project.name, projectId: project.id },
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
            style={{ padding: '24px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f0f0f0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Total budget</h3>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MoreHorizontal size={16} color="#666" />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>
                ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#eefaf2',
                    color: '#27ae60',
                  }}
                >
                  <CheckCircle2 size={14} />
                  filtered view
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <SemiCircleGauge value={totalSpent} max={Math.max(totalBudget, 1)} color="#8a76fa" bgColor="#f4f2ff" size={260} />
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={{ padding: '24px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f0f0f0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Most expenses</h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#666',
                  border: '1px solid #eee',
                  padding: '4px 8px',
                  borderRadius: '12px',
                }}
              >
                Filtered list <ChevronDown size={14} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sortedProjects.map((project, index) => {
                const percentage = (1.5 + index * 2.3).toFixed(1);
                const isUp = index % 2 === 0;
                return (
                  <ExpenseListItem
                    key={project.id || index}
                    name={project.name}
                    amount={project.spent}
                    percentage={percentage}
                    isUp={isUp}
                  />
                );
              })}
            </div>
          </Motion.div>
        </div>
      </div>

      {drawerOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 18, 27, 0.34)',
            zIndex: 40,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: 'min(560px, 100%)',
              height: '100%',
              backgroundColor: '#faf9ff',
              boxShadow: '-24px 0 60px rgba(17, 24, 39, 0.18)',
              padding: '28px',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a76fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {drawerMode === 'create' ? 'Create Project' : 'Connect BOQ'}
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '8px 0 4px', color: '#1a1a1a' }}>
                  {drawerMode === 'create' && !selectedProject ? 'New project setup' : selectedProject?.name || 'Project setup'}
                </h2>
                <p style={{ fontSize: '14px', color: '#777', margin: 0 }}>
                  {selectedProject
                    ? 'Manage BOQ source connection for this project.'
                    : 'Create the project first, then connect a Google Sheet BOQ source.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #e5e5ef',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {drawerError ? (
              <div
                className="card"
                style={{
                  marginBottom: '18px',
                  backgroundColor: '#fff3f2',
                  color: '#de5b52',
                  border: '1px solid #f5d7d3',
                }}
              >
                {drawerError}
              </div>
            ) : null}

            {drawerMode === 'create' && !selectedProject ? (
              <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    padding: '18px',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    border: '1px solid #ece8ff',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                  }}
                >
                  <div style={{ gridColumn: '1 / -1' }}>
                    <DrawerField label="Project name">
                      <input
                        type="text"
                        value={projectForm.name}
                        onChange={(event) => handleProjectFormChange('name', event.target.value)}
                        placeholder="Bangna Warehouse Fit-Out"
                        style={inputStyle}
                        required
                      />
                    </DrawerField>
                  </div>

                  <DrawerField label="Project type">
                    <select
                      value={projectForm.project_type}
                      onChange={(event) => handleProjectFormChange('project_type', event.target.value)}
                      style={inputStyle}
                    >
                      {PROJECT_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </DrawerField>

                  <DrawerField label="Status">
                    <select
                      value={projectForm.status}
                      onChange={(event) => handleProjectFormChange('status', event.target.value)}
                      style={inputStyle}
                    >
                      {PROJECT_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </DrawerField>

                  <DrawerField label="Overhead %" helper="Stored as percent value on the project.">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={projectForm.overhead_percent}
                      onChange={(event) => handleProjectFormChange('overhead_percent', event.target.value)}
                      style={inputStyle}
                    />
                  </DrawerField>

                  <DrawerField label="Profit %" helper="Used in project summary and detail view.">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={projectForm.profit_percent}
                      onChange={(event) => handleProjectFormChange('profit_percent', event.target.value)}
                      style={inputStyle}
                    />
                  </DrawerField>

                  <DrawerField label="VAT %" helper="Defaults to 7.0 for new projects.">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={projectForm.vat_percent}
                      onChange={(event) => handleProjectFormChange('vat_percent', event.target.value)}
                      style={inputStyle}
                    />
                  </DrawerField>

                  <DrawerField label="Contingency budget" helper="Project list currently uses this value as total budget.">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={projectForm.contingency_budget}
                      onChange={(event) => handleProjectFormChange('contingency_budget', event.target.value)}
                      style={inputStyle}
                    />
                  </DrawerField>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      padding: '14px 16px',
                      backgroundColor: 'white',
                      color: '#555',
                      border: '1px solid #e2e2ea',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      padding: '14px 16px',
                      backgroundColor: '#8a76fa',
                      color: 'white',
                      opacity: isCreating ? 0.7 : 1,
                    }}
                  >
                    {isCreating ? 'Creating...' : 'Create project'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    padding: '18px',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    border: '1px solid #ece8ff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#8a76fa', fontWeight: '700' }}>Selected project</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>{selectedProject?.name}</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
                    <span>Type: {selectedProject?.projectType}</span>
                    <span>Status: {selectedProject?.status}</span>
                    <span>Budget: ${selectedProject?.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <form onSubmit={handleSyncBoq} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      border: '1px solid #ece8ff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    <DrawerField label="BOQ type">
                      <select
                        value={syncForm.boqType}
                        onChange={(event) => handleSyncFormChange('boqType', event.target.value)}
                        style={inputStyle}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="SUBCONTRACTOR">SUBCONTRACTOR</option>
                      </select>
                    </DrawerField>

                    <DrawerField
                      label="Google Sheet URL"
                      helper="Use the workbook URL once, then load and select the tabs you want to sync."
                    >
                      <input
                        type="url"
                        value={syncForm.sheetUrl}
                        onChange={(event) => handleSyncFormChange('sheetUrl', event.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        style={inputStyle}
                        required
                      />
                    </DrawerField>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        Load workbook tabs once, then batch sync only the BOQ sheets you need.
                      </div>
                      <button
                        type="button"
                        onClick={handleLoadTabs}
                        disabled={isLoadingTabs || !syncForm.sheetUrl.trim()}
                        style={{
                          ...buttonStyle,
                          padding: '12px 16px',
                          backgroundColor: '#f2efff',
                          color: '#5f48e0',
                          opacity: isLoadingTabs || !syncForm.sheetUrl.trim() ? 0.6 : 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isLoadingTabs ? 'Loading tabs...' : 'Load tabs'}
                      </button>
                    </div>

                    {availableTabs.length ? (
                      <div
                        style={{
                          padding: '16px',
                          borderRadius: '16px',
                          border: '1px solid #ebe8ff',
                          backgroundColor: '#fcfbff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#5f48e0' }}>Workbook tabs</div>
                            <div style={{ fontSize: '12px', color: '#7a7a88' }}>
                              Default selection skips tabs like Summary, maps work detail to IN, and preselects up to {MAX_BATCH_SYNC_TABS} tabs.
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {selectedSheetNames.length} selected
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {availableTabs.map((tab) => {
                            const isSelected = selectedSheetNames.includes(tab.name);
                            const selectionLimitReached =
                              !isSelected && selectedSheetNames.length >= MAX_BATCH_SYNC_TABS;
                            return (
                              <label
                                key={tab.name}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px',
                                  borderRadius: '14px',
                                  border: `1px solid ${isSelected ? '#cfc7ff' : '#ecebf5'}`,
                                  backgroundColor: isSelected ? '#f4f1ff' : 'white',
                                  color: tab.syncable ? '#2b2b34' : '#8c8c98',
                                  cursor:
                                    tab.syncable && !selectionLimitReached ? 'pointer' : 'not-allowed',
                                  opacity: selectionLimitReached && !isSelected ? 0.6 : 1,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!tab.syncable || selectionLimitReached}
                                  onChange={() => toggleSheetSelection(tab.name)}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{tab.name}</span>
                                  <span style={{ fontSize: '11px' }}>
                                    {tab.syncable ? 'Syncable tab' : 'Skipped by default'}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: '12px', color: '#7a7a88' }}>
                          Sync is currently limited to {MAX_BATCH_SYNC_TABS} tabs per request so AI parsing stays responsive.
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {syncResult ? (
                    <div
                      className="card"
                      style={{
                        backgroundColor: '#eef7ff',
                        color: '#205a9c',
                        border: '1px solid #d5e6fb',
                      }}
                    >
                      <div style={{ fontWeight: '700', marginBottom: '6px' }}>{syncResult.project_name}</div>
                      <div>Status: {syncResult.status}</div>
                      <div>Job ID: {syncResult.job_id}</div>
                      <div>BOQ type: {syncResult.boq_type}</div>
                      <div>Completed tabs: {syncResult.total_completed_tabs}</div>
                      <div>Failed tabs: {syncResult.total_failed_tabs}</div>
                      <div>Current tab: {syncResult.current_sheet_name || '-'}</div>
                      <div>Queued at: {syncResult.created_at}</div>
                      <div>Started at: {syncResult.started_at || '-'}</div>
                      <div>Finished at: {syncResult.finished_at || '-'}</div>
                      <div style={{ marginTop: '4px' }}>{syncResult.message}</div>
                      <div style={{ wordBreak: 'break-word', marginBottom: '10px' }}>Sheet: {syncResult.sheet_url}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(syncResult.results || []).map((resultItem) => (
                          <div
                            key={resultItem.sheet_name}
                            style={{
                              padding: '12px',
                              borderRadius: '14px',
                              backgroundColor: resultItem.status === 'COMPLETED' ? '#ffffff' : '#fff7f6',
                              border: `1px solid ${resultItem.status === 'COMPLETED' ? '#d8e8ff' : '#f5d7d3'}`,
                            }}
                          >
                            <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                              {resultItem.sheet_name} • {resultItem.status}
                            </div>
                            <div style={{ fontSize: '13px' }}>Inserted rows: {resultItem.inserted_items}</div>
                            <div style={{ fontSize: '13px' }}>Closed previous rows: {resultItem.version_closed_items}</div>
                            <div style={{ fontSize: '13px', marginTop: '4px' }}>{resultItem.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      style={{
                        ...buttonStyle,
                        flex: 1,
                        padding: '14px 16px',
                        backgroundColor: 'white',
                        color: '#555',
                        border: '1px solid #e2e2ea',
                      }}
                    >
                      Done for now
                    </button>
                    <button
                      type="submit"
                      disabled={isSyncing || selectedSheetNames.length === 0}
                      style={{
                        ...buttonStyle,
                        flex: 1,
                        padding: '14px 16px',
                        backgroundColor: '#8a76fa',
                        color: 'white',
                        opacity: isSyncing || selectedSheetNames.length === 0 ? 0.7 : 1,
                      }}
                    >
                      {isSyncing ? 'Sync job running...' : 'Sync selected tabs'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProjectPage;
