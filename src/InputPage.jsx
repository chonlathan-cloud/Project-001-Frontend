import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from './components/Loading';
import ConstructionAnimation from './components/ConstructionAnimation';

const InputField = ({ label, placeholder, type = 'text', style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
    {label && <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{label}</label>}
    <input 
      type={type}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: '#e6decb',
        border: '1px solid #bba684',
        fontSize: '14px',
        outline: 'none',
        textAlign: 'center',
        color: '#333',
        transition: 'all 0.3s ease'
      }}
    />
  </div>
);

const SelectField = ({ label, placeholder, options = [], style = {}, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
    {label && <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      <select 
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: '#e6decb',
          border: '1px solid #bba684',
          fontSize: '14px',
          outline: 'none',
          textAlign: 'center',
          appearance: 'none',
          color: value ? '#333' : '#666',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  </div>
);

const InputPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loading />;

  const isIncome = selectedType === 'รายรับ';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px', fontWeight: '700', color: '#1a1a1a' }}>Input</h1>

      <motion.div 
        layout
        style={{ 
          display: 'flex', 
          flexDirection: isIncome ? 'row-reverse' : 'row', 
          gap: '32px', 
          alignItems: 'start',
          transition: 'flex-direction 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        
        {/* Left Side: Form Container */}
        <motion.div 
          layout
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Main Form Card */}
          <div className="card" style={{ 
            backgroundColor: 'white', 
            padding: '32px 24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <SelectField 
              label="รายจ่าย / รายรับ" 
              placeholder="เลือกรายการที่ทำ" 
              options={['รายจ่าย', 'รายรับ']}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ width: '60%' }} 
            />
            
            <SelectField label="โครงการ" placeholder="กรุณาเลือกโครงการ" style={{ width: '60%' }} />
            <InputField label="ชื่อ - นามสกุล" placeholder="กรุณากรอกชื่อ-นามสกุล" style={{ width: '60%' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <InputField label="เบอร์ติดต่อ" placeholder="กรุณากรอกเบอร์โทรศัพท์" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>วัน/เดือน/ปี</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <SelectField placeholder="วัน" style={{ flex: 1 }} />
                  <SelectField placeholder="เดือน" style={{ flex: 1.5 }} />
                  <SelectField placeholder="ปี" style={{ flex: 1 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <SelectField label="ประเภทงาน" placeholder="กรุณาเลือก" />
              <SelectField label="ประเภทการเบิก" placeholder="กรุณาเลือก" />
            </div>

            <InputField label="อื่น ๆ" placeholder="ถ้ามี กรุณากรอกรายละเอียด" style={{ width: '60%' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <InputField label="บัญชีธนาคาร" placeholder="กรุณากรอก" />
              <InputField label="จำนวนเงินที่ขอเบิก" placeholder="กรุณากรอก" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Upload Image</label>
              <div style={{
                width: '100%',
                height: '140px',
                backgroundColor: '#e6decb',
                border: '1px solid #bba684',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Upload Image bank bill</span>
                <ArrowUp size={16} />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{
              backgroundColor: '#c9a15c',
              color: 'black',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 48px',
              fontSize: '20px',
              fontWeight: '700',
              cursor: 'pointer',
              width: '120px',
              boxShadow: '0 4px 15px rgba(201, 161, 92, 0.3)'
            }}>
              ส่ง
            </button>
          </div>
        </motion.div>

        {/* Right Side: Construction Animation */}
        <motion.div 
          layout
          style={{ 
            flex: 1, 
            backgroundColor: '#f9f6f0', 
            minHeight: '800px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #ede4d3'
          }}
        >
          <ConstructionAnimation />
        </motion.div>
        
      </motion.div>
    </div>
  );
};

export default InputPage;
