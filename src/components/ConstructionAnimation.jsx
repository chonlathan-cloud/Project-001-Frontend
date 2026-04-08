import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Hammer, Wrench, HardHat, Pickaxe, Ruler, Drill } from 'lucide-react';
import logoImage from '../assets/logo.png';

const ToolIcon = ({ IconComponent, radius, duration, delay, color }) => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
        padding: '12px',
        borderRadius: '50%',
        border: `1px solid ${color}44`,
        boxShadow: `0 4px 15px ${color}22`
      }}
      animate={{
        rotate: 360,
        x: [
          Math.cos(0) * radius,
          Math.cos(Math.PI / 2) * radius,
          Math.cos(Math.PI) * radius,
          Math.cos(3 * Math.PI / 2) * radius,
          Math.cos(2 * Math.PI) * radius,
        ],
        y: [
          Math.sin(0) * radius,
          Math.sin(Math.PI / 2) * radius,
          Math.sin(Math.PI) * radius,
          Math.sin(3 * Math.PI / 2) * radius,
          Math.sin(2 * Math.PI) * radius,
        ],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        delay: delay
      }}
    >
      <IconComponent size={28} />
    </motion.div>
  );
};

const ConstructionAnimation = () => {
  const tools = useMemo(() => [
    { IconComponent: Hammer, radius: 160, duration: 25, delay: 0, color: '#c9a15c' },
    { IconComponent: Wrench, radius: 220, duration: 35, delay: 5, color: '#bba684' },
    { IconComponent: HardHat, radius: 180, duration: 45, delay: 10, color: '#8c6e3d' },
    { IconComponent: Pickaxe, radius: 240, duration: 55, delay: 15, color: '#c9a15c' },
    { IconComponent: Ruler, radius: 200, duration: 40, delay: 20, color: '#e6decb' },
    { IconComponent: Drill, radius: 260, duration: 65, delay: 25, color: '#bba684' },
  ], []);

  const particles = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      x: [(i * 50) % 800 - 400, (i * 70 + 100) % 800 - 400],
      y: [(i * 60) % 800 - 400, (i * 80 + 150) % 800 - 400],
      duration: 15 + (i % 10),
    }));
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(201, 161, 92, 0.05) 0%, rgba(201, 161, 92, 0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Orbit Rings (Subtle) */}
      {[160, 180, 200, 220, 240, 260].map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${r * 2}px`,
          height: `${r * 2}px`,
          border: '1px dashed rgba(201, 161, 92, 0.1)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
      ))}

      {/* Central Logo */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: '220px',
          height: '220px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
        }}
      >
        <img src={logoImage} alt="DOUBLEBO" style={{ width: '100%', height: 'auto' }} />
      </motion.div>

      {/* Rotating Tools */}
      {tools.map((tool, index) => (
        <ToolIcon 
          key={index}
          IconComponent={tool.IconComponent}
          radius={tool.radius}
          duration={tool.duration}
          delay={tool.delay}
          color={tool.color}
        />
      ))}

      {/* Floating Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            backgroundColor: '#c9a15c',
            borderRadius: '50%',
            opacity: 0.2
          }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Removed redundant text behind logo */}
    </div>
  );
};


export default ConstructionAnimation;
