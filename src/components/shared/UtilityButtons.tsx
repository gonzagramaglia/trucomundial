import React from 'react';
import { Video } from 'lucide-react';
import { VolumeControl } from './VolumeControl';
import { audioManager } from '../../lib/audio';

interface UtilityButtonsProps {
  isMobile?: boolean;
}

export const UtilityButtons: React.FC<UtilityButtonsProps> = ({ isMobile }) => {
  if (isMobile) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <a 
          href="https://youtu.be/228FtMaq8uY" 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={() => audioManager.setVolume(0)} 
          className="btn-hover-dark mobile-hide" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            color: 'white', 
            height: '36px', 
            width: '36px', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backdropFilter: 'blur(12px)', 
            transition: 'none', 
            boxShadow: '3px 3px 0px #000' 
          }} 
          title="Video"
        >
          <Video size={16} />
        </a>
        <VolumeControl size={36} expandDirection="left" style={{ boxShadow: '3px 3px 0px #000' }} />
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 4000, display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
      <VolumeControl expandDirection="left" />
      <a 
        href="https://youtu.be/228FtMaq8uY" 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={() => audioManager.setVolume(0)} 
        className="btn-hover-dark mobile-hide" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          color: 'white', 
          height: '40px', 
          width: '40px', 
          borderRadius: '50%', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backdropFilter: 'blur(12px)', 
          transition: 'none' 
        }} 
        title="Video"
      >
        <Video size={18} />
      </a>
    </div>
  );
};
