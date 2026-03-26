import React, { useState, useEffect } from 'react';
import StatCard from './components/StatCard';
import ShipmentChart from './components/ShipmentChart';
import BudgetChart from './components/BudgetChart';
import WagesChart from './components/WagesChart';
import ValueChart from './components/ValueChart';
import WorkPeriodChart from './components/WorkPeriodChart';
import { getDashboardData } from './api';
import Loading from './components/Loading';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await getDashboardData();
        setData(result);
      } catch (loadError) {
        setError(loadError.message || 'Failed to load dashboard data.');
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

  return (
    <>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Dashboard</h1>
      
      <div className="dashboard-grid">
        {data.stats.map((stat, index) => (
          <StatCard key={index} index={index} title={stat.title} value={stat.value} />
        ))}
      </div>

      <div className="chart-section">
        <ShipmentChart data={data.shipmentData} />
        <BudgetChart data={data.budgetData} />
      </div>

      <div className="bottom-section">
        <WagesChart data={data.wagesData} />
        <ValueChart data={data.valueData} />
        <WorkPeriodChart data={data.workPeriodData} />
      </div>
    </>
  );
};

export default DashboardPage;
