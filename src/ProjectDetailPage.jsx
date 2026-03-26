import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import StatCard from './components/StatCard';
import ShipmentChart from './components/ShipmentChart';
import SalesChart from './components/SalesChart';
import WagesChart from './components/WagesChart';
import ValueChart from './components/ValueChart';
import WorkPeriodChart from './components/WorkPeriodChart';
import { getProjectDetailData } from './api';
import Loading from './components/Loading';

const ProjectDetailPage = () => {
  const { projectId: routeProjectId } = useParams();
  const location = useLocation();
  const passedProjectName = location.state?.projectName;
  const stateProjectId = location.state?.projectId;
  const projectId = routeProjectId || stateProjectId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        setError('Project id is missing. Please open this page from the project list.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const result = await getProjectDetailData(projectId);
        setData(result);
      } catch (loadError) {
        setError(loadError.message || 'Failed to load project detail.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px' }}>Project</h1>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          backgroundColor: 'white', 
          padding: '8px 40px', 
          borderRadius: '12px',
          border: '1.5px solid var(--border-color)',
          width: 'fit-content',
          fontSize: '24px'
        }}>
          {passedProjectName || data.name}
        </div>
      </div>
      
      <div className="dashboard-grid">
        {data.stats.map((stat, index) => (
          <StatCard key={index} index={index} title={stat.title} value={stat.value} />
        ))}
      </div>

      <div className="chart-section">
        <ShipmentChart data={data.shipmentData} />
        <SalesChart data={data.salesData} />
      </div>

      <div className="bottom-section" style={{ marginBottom: '40px' }}>
        <WagesChart data={data.wagesData} />
        <ValueChart data={data.valueData} />
        <WorkPeriodChart data={data.workPeriodData} />
      </div>
    </>
  );
};

export default ProjectDetailPage;
