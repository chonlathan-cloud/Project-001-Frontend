import React from 'react';
import { motion as Motion } from 'framer-motion';

const StatCard = ({ title, value, index }) => {
  return (
    <Motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="card" 
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <p style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 'bold' }}>{title}</p>
      <p style={{ fontSize: '28px', color: 'var(--text-main)', opacity: 0.8, letterSpacing: '-0.5px' }}>{value}</p>
    </Motion.div>
  );
};

export default StatCard;
