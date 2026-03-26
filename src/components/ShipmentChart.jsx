import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { compactNumber } from '../api';

const ShipmentChart = ({ data }) => {
  const [activeFilter, setActiveFilter] = useState('Year');

  const filterStyle = (filterName) => ({
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: activeFilter === filterName ? '#c9a15c' : 'transparent',
    color: activeFilter === filterName ? 'white' : 'inherit',
    transition: 'all 0.2s ease',
  });

  const getDummyData = () => {
    switch(activeFilter) {
      case 'Year':
        return [
          { name: 'ม.ค.' }, { name: 'ก.พ.' }, { name: 'มี.ค.' }, { name: 'เม.ย.' },
          { name: 'พ.ค.' }, { name: 'มิ.ย.' }, { name: 'ก.ค.' }, { name: 'ส.ค.' },
          { name: 'ก.ย.' }, { name: 'ต.ค.' }, { name: 'พ.ย.' }, { name: 'ธ.ค.' }
        ];
      case 'Month':
        return [
          { name: 'สัปดาห์ 1' }, { name: 'สัปดาห์ 2' },
          { name: 'สัปดาห์ 3' }, { name: 'สัปดาห์ 4' }
        ];
      case 'Week':
        return [
          { name: 'จ.' }, { name: 'อ.' }, { name: 'พ.' }, { name: 'พฤ.' },
          { name: 'ศ.' }, { name: 'ส.' }, { name: 'อา.' }
        ];
      default:
        return [];
    }
  };

  const displayData = data && data.length > 0 ? data : getDummyData();
  const dataMax = displayData.reduce(
    (maxValue, item) => Math.max(maxValue, item.green || 0, item.red || 0),
    0
  );
  const yAxisMax = dataMax > 0 ? Math.ceil(dataMax * 1.15) : 250;

  return (
    <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Shipment</h3>
        <div style={{ 
          backgroundColor: '#efebe3', 
          padding: '4px', 
          borderRadius: '8px', 
          display: 'flex', 
          gap: '4px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <span 
            style={filterStyle('Week')}
            onClick={() => setActiveFilter('Week')}
          >
            Week
          </span>
          <span 
            style={filterStyle('Month')}
            onClick={() => setActiveFilter('Month')}
          >
            Month
          </span>
          <span 
            style={filterStyle('Year')}
            onClick={() => setActiveFilter('Year')}
          >
            Year
          </span>
        </div>
      </div>
      
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500, fill: '#666' }} axisLine={false} tickLine={false} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              domain={[0, yAxisMax]}
              tickFormatter={(value) => compactNumber.format(value)}
              tick={{ fontSize: 12, fontWeight: 600, fill: '#333' }}
            />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="green" fill="var(--chart-green)" radius={[4, 4, 0, 0]} barSize={35} />
            <Bar dataKey="red" fill="var(--chart-red)" radius={[4, 4, 0, 0]} barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ShipmentChart;
