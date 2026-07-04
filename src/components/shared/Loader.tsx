import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = "Cargando..." }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      minHeight: '40vh',
      gap: '1.5rem'
    }}>
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '4px solid rgba(0, 242, 255, 0.1)',
            borderTopColor: '#00f2ff',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(0, 242, 255, 0.3)'
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '70%',
            height: '70%',
            top: '15%',
            left: '15%',
            border: '3px solid rgba(168, 85, 247, 0.1)',
            borderTopColor: '#a855f7',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
          }}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          color: '#fff',
          fontSize: '1.1rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textShadow: '0 0 10px rgba(255,255,255,0.2)'
        }}
      >
        {message}
      </motion.div>
    </div>
  );
};
