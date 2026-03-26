import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { compactNumber } from '../api';

const SalesChart = ({ data = [] }) => {
  const isEmpty = !data || data.length === 0;
  const displayData = isEmpty ? [] : data;
  const yAxisMax = isEmpty
    ? 5000
    : Math.ceil(
        displayData.reduce(
          (maxValue, item) => Math.max(maxValue, item.sales || 0, item.target || 0),
          0
        ) * 1.15
      );
  return (
    <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Sales</h3>
        <div style={{ 
          backgroundColor: '#efebe3', 
          padding: '4px', 
          borderRadius: '8px', 
          display: 'flex', 
          gap: '4px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <span style={{ padding: '4px 8px' }}>Week</span>
          <span style={{ padding: '4px 8px' }}>Month</span>
          <span style={{ backgroundColor: '#c9a15c', color: 'white', padding: '4px 12px', borderRadius: '6px' }}>Year</span>
        </div>
      </div>
      
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        {isEmpty && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: '#c9a15c', fontSize: '16px', fontWeight: '600', zIndex: 10
          }}>
            รอรับข้อมูลจริงจาก Backend
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%" style={{ opacity: isEmpty ? 0.3 : 1 }}>
          <LineChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => compactNumber.format(value)}
              domain={[0, yAxisMax || 5000]}
              tick={{ fontSize: 12, fontWeight: 600, fill: '#333' }}
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#27a57a" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4 }} 
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#27a57a" 
              strokeWidth={2} 
              dot={false} 
              strokeDasharray="5 5"
              opacity={0.6}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
