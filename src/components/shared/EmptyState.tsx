import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  color?: string; // Hex color string, e.g., '#a855f7' or '#f97316'
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🔍',
  title,
  description,
  actionText,
  onAction,
  color = '#a855f7'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        width: '100%',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '2rem',
        padding: '4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        marginTop: '2rem'
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
        {icon}
      </div>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>
        {title}
      </h3>
      <p style={{ margin: 0, opacity: 0.6, maxWidth: '400px', lineHeight: 1.5, fontWeight: 500 }}>
        {description}
      </p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          style={{
            marginTop: '2rem',
            background: `rgba(${hexToRgb(color)}, 0.2)`,
            border: `1px solid ${color}`,
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '1rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="btn-hover-dark"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};
