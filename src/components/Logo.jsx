import React from 'react';
import logoImage from '../assets/Logo.png';



const Logo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
    <img src={logoImage} alt="DOUBLEBO" style={{ width: '130px', height: 'auto', marginBottom: '8px', filter: 'brightness(0) invert(1)' }} />
  </div>
);

export default Logo;
