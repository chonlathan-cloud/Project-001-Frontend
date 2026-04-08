import React, { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, Filter as FilterIcon, CheckCircle, Download, MoreHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchData } from './api';
import Loading from './components/Loading';

const InsightsDropdown = ({ label }) => {
  // We use a simple dropdown visualization; real implementation would use a select or custom popover
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '8px 16px',
      borderRadius: '20px',
      backgroundColor: 'white',
      border: '1px solid var(--border-color)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      minWidth: '120px',
      color: '#4B5563'
    }}>
      <span>{label}</span>
      <ChevronDown size={16} />
    </div>
  );
};

const SummaryCard = ({ title, count, amount, icon: Icon, variant }) => {
  const getStyles = () => {
    switch (variant) {
      case 'new':
        return { bg: 'var(--card-bg-new)', iconBg: 'rgba(0,0,0,0.05)', iconColor: '#666' };
      case 'pending':
        return { bg: 'var(--card-bg-pending)', iconBg: 'rgba(196, 164, 112, 0.1)', iconColor: '#c4a470' };
      case 'approved':
        return { bg: 'var(--card-bg-approved)', iconBg: 'rgba(255,255,255,0.1)', iconColor: 'white' };
      default:
        return { bg: 'white', iconBg: '#f3f4f6', iconColor: '#6b7280' };
    }
  };

  const styles = getStyles();

  return (
    <div style={{
      backgroundColor: styles.bg,
      padding: '24px',
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      flex: 1,
      minHeight: '140px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          backgroundColor: styles.iconBg,
          padding: '8px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} color={styles.iconColor} />
        </div>
        <span style={{ fontSize: '15px', fontWeight: '600', color: variant === 'approved' ? 'white' : '#4b5563' }}>{title}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', color: variant === 'approved' ? 'rgba(255,255,255,0.7)' : '#9ca3af', fontWeight: '500' }}>
            {count || 0} รายการ
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: variant === 'approved' ? 'white' : '#1a1a1a' 
          }}>
            {amount || '-'}
          </span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '700', 
            color: variant === 'approved' ? 'white' : '#1a1a1a' 
          }}>
            THB
          </span>
        </div>
      </div>
    </div>
  );
};

const InsightsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData('insights');
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Loading />;
  if (error) return (
    <div style={{ 
      padding: '60px', 
      textAlign: 'center', 
      color: '#ef4444', 
      backgroundColor: 'white', 
      borderRadius: '24px',
      margin: '40px'
    }}>
      <h2 style={{ marginBottom: '16px' }}>Backend Connection Waiting...</h2>
      <p style={{ color: '#6b7280' }}>กำลังรอการเชื่อมต่อกับข้อมูลจริงจากระบบหลังบ้าน ({error})</p>
      <button 
        onClick={() => { setLoading(true); window.location.reload(); }}
        style={{
          marginTop: '24px',
          padding: '10px 24px',
          borderRadius: '12px',
          backgroundColor: '#3d403a',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Retry Connection
      </button>
    </div>
  );
  if (!data) return null;

  return (
    <>
      {/* Header and Filters Range */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>Insights</h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>วิเคราะห์ข้อมูลแบบเรียลไทม์จาก Backend</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search" 
              style={{
                padding: '10px 16px 10px 40px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                fontSize: '14px',
                width: '240px',
                outline: 'none'
              }}
            />
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          {data.filters?.users && <InsightsDropdown label={data.filters.users[0]} options={data.filters.users} />}
          {data.filters?.months && <InsightsDropdown label={data.filters.months[2]} options={data.filters.months} />}
          <div style={{ display: 'flex', gap: '12px' }}>
            {data.filters?.years && <InsightsDropdown label={data.filters.years[0]} options={data.filters.years} />}
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              borderRadius: '20px',
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              color: '#4B5563'
            }}>
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Cards Row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <SummaryCard 
          title="รายการใหม่" 
          count={data.summary?.new?.count} 
          amount={data.summary?.new?.amount} 
          icon={CheckCircle} 
          variant="new"
        />
        <SummaryCard 
          title="รอดำเนินการ" 
          count={data.summary?.pending?.count} 
          amount={data.summary?.pending?.amount} 
          icon={FilterIcon} 
          variant="pending"
        />
        <SummaryCard 
          title="อนุมัติแล้ว" 
          count={data.summary?.approved?.count} 
          amount={data.summary?.approved?.amount} 
          icon={Search} 
          variant="approved"
        />
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        padding: '32px',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        {/* Table Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>
            {data.tableName || "รายการทั้งหมด"}
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Export CSV <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#9ca3af', fontSize: '13px' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>เลขที่ใบส่ง</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>วันที่คืน</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>ชื่อผู้ดำเนินการ</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>จำนวนเงิน</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>วัตถุประสงค์</th>
              </tr>
            </thead>
            <tbody>
              {data.tableData?.length > 0 ? (
                data.tableData.map((row, index) => (
                  <tr 
                    key={index} 
                    style={{ 
                      backgroundColor: row.highlight ? 'var(--table-row-highlight)' : 'transparent',
                      fontSize: '13px',
                      color: '#1a1a1a'
                    }}
                  >
                    <td style={{ padding: '16px', fontWeight: '600' }}>{row.id}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{row.date}</td>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{row.user}</td>
                    <td style={{ padding: '16px', fontWeight: '700' }}>{row.amount}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{row.objective}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    <Search size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
                    <p>ไม่พบข้อมูลในขณะนี้</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default InsightsPage;
