import React, { useState, useEffect } from 'react';
import { Calendar, ArrowUpDown, SlidersHorizontal, RotateCw, ChevronDown, Plus, Pencil, CheckCircle2, AlertCircle, MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProjectsData } from './api';
import Loading from './components/Loading';
import CircularProgress from './components/CircularProgress';
import SemiCircleGauge from './components/SemiCircleGauge';

const FilterButton = ({ icon: Icon, label, secondaryIcon: SecIcon }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '24px',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: 'var(--shadow-sm)'
  }}>
    {Icon && <Icon size={18} />}
    <span>{label}</span>
    {SecIcon && <SecIcon size={16} />}
  </div>
);

const ProjectCard = ({ project, index, onClick, onEditName }) => {
  const { name, spent, total, status, progressPercent } = project;
  const left = total - spent;
  const normalizedStatus = String(status || '').toLowerCase();
  const isOnTrack =
    normalizedStatus.includes('active') ||
    normalizedStatus.includes('track') ||
    normalizedStatus.includes('complete') ||
    normalizedStatus.includes('approved');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  // Sync state if props change
  useEffect(() => {
    setEditName(name);
  }, [name]);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    if (editName.trim() !== '' && editName !== name) {
      onEditName(editName);
    } else {
      setEditName(name);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave(e);
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
        gap: '20px',
        cursor: 'pointer',
        border: '1px solid #f0f0f0'
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
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                fontSize: '16px', fontWeight: '600', color: '#1a1a1a', 
                border: '1px solid #8a76fa', borderRadius: '4px', padding: '2px 4px', 
                width: '100%', outline: 'none'
              }}
            />
          ) : (
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{name}</h3>
          )}
        </div>
        
        {!isEditing && onEditName && (
          <div 
            onClick={handleEditClick}
            style={{ 
              width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #eee', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666',
              cursor: 'pointer', flexShrink: 0
            }}
          >
            <Pencil size={14} />
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <CircularProgress value={spent} max={total} color={isOnTrack ? '#8a76fa' : '#8a76fa'} bgColor="#f4f2ff" />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Left</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                ${left.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
              <span style={{ fontSize: '12px', color: '#888' }}>
                /${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
          </div>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '4px', 
            padding: '4px 8px', borderRadius: '12px', width: 'fit-content',
            fontSize: '11px', fontWeight: '600',
            backgroundColor: isOnTrack ? '#eefaf2' : '#fff8e6',
            color: isOnTrack ? '#27ae60' : '#f39c12'
          }}>
            {isOnTrack ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {status}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Progress {progressPercent.toFixed(1)}%
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

const ExpenseListItem = ({ name, amount, percentage, isUp }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f4f2ff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8a76fa' }}>
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>${amount.toLocaleString()}</div>
        <div style={{ fontSize: '12px', color: '#888' }}>{name}</div>
      </div>
    </div>
    
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '4px 8px', borderRadius: '12px',
      fontSize: '11px', fontWeight: '600',
      backgroundColor: isUp ? '#fceaea' : '#eefaf2',
      color: isUp ? '#e74c3c' : '#27ae60'
    }}>
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

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="card" style={{ backgroundColor: 'white', color: '#de5b52' }}>
        {error}
      </div>
    );
  }

  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);
  const totalBudget = projects.reduce((acc, p) => acc + p.total, 0);

  // For the Most Expenses list, we'll sort projects by spent amount descending
  const sortedProjects = [...projects].sort((a, b) => b.spent - a.spent);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>Project</h1>
            <p style={{ color: '#888', fontSize: '14px' }}>Create and track your projects</p>
          </div>
          <button 
            type="button"
            disabled
            style={{ 
              backgroundColor: '#d9d2fb', color: '#6d5bc9', padding: '12px 24px', 
              borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'not-allowed',
              boxShadow: 'none',
              opacity: 0.75
            }}
            title="Create project flow is not connected in phase 1."
          >
            <Plus size={18} />
            Add new project
          </button>
        </div>
        
        {/* Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="card" style={{ padding: '8px', borderRadius: '12px', cursor: 'pointer' }}><Calendar size={20} /></div>
            <FilterButton label="This month" />
            <div className="card" style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><ArrowUpDown size={20} /></div>
            <FilterButton label="Sort by : Default" secondaryIcon={ChevronDown} />
            <div className="card" style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><SlidersHorizontal size={20} /></div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <FilterButton label="Status" secondaryIcon={ChevronDown} />
            <FilterButton label="Amount" secondaryIcon={ChevronDown} />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#8a76fa', 
              cursor: 'pointer', 
              fontSize: '14px', 
              marginLeft: '12px',
              fontWeight: '500'
            }}>
              <RotateCw size={16} />
              <span>Reset all</span>
            </div>
          </div>
          
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>{projects.length} items</p>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="card" style={{ backgroundColor: 'white', color: '#666' }}>
            No projects returned from backend yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {projects.map((p, i) => (
              <ProjectCard 
                key={p.id || i} 
                project={p} 
                index={i} 
                onClick={() => navigate(`/project/detail/${p.id}`, { state: { projectName: p.name, projectId: p.id } })} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Total Budget Card */}
        <Motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card" 
          style={{ padding: '24px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f0f0f0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Total budget</h3>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
              <MoreHorizontal size={16} color="#666" />
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>
              ${totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '4px', 
                padding: '4px 12px', borderRadius: '12px',
                fontSize: '12px', fontWeight: '600',
                backgroundColor: '#eefaf2', color: '#27ae60'
              }}>
                <CheckCircle2 size={14} />
                on track
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SemiCircleGauge value={totalSpent} max={totalBudget} color="#8a76fa" bgColor="#f4f2ff" size={260} />
          </div>
        </Motion.div>

        {/* Most Expenses List */}
        <Motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card" 
          style={{ padding: '24px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f0f0f0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Most expenses</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666', border: '1px solid #eee', padding: '4px 8px', borderRadius: '12px', cursor: 'pointer' }}>
              This month <ChevronDown size={14} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sortedProjects.map((p, i) => {
              const percentage = (1.5 + i * 2.3).toFixed(1);
              const isUp = i % 2 === 0;
              return (
                <ExpenseListItem 
                  key={i} 
                  name={p.name} 
                  amount={p.spent} 
                  percentage={percentage}
                  isUp={isUp}
                />
              )
            })}
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default ProjectPage;
