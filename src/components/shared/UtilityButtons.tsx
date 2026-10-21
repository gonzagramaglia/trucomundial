import React, { useState, useEffect } from 'react';
import { Video } from 'lucide-react';
import { VolumeControl } from './VolumeControl';
import { audioManager } from '../../lib/audio';

interface UtilityButtonsProps {
  isMobile?: boolean;
}

export const UtilityButtons: React.FC<UtilityButtonsProps> = ({ isMobile: propIsMobile }) => {
  const [detectedMobile, setDetectedMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setDetectedMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = propIsMobile ?? detectedMobile;

  // In-flow header placement when isMobile prop is explicitly passed
  if (propIsMobile !== undefined && isMobile) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <a 
          href="https://youtu.be/228FtMaq8uY" 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={() => audioManager.setVolume(0)} 
          className="btn-hover-dark" 
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

  // Fixed top-right container
  return (
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 4000,
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        gap: isMobile ? '0.5rem' : '0.75rem',
        alignItems: 'center'
      }}
    >
      {isMobile ? (
        <>
          {/* On mobile: Video is first (to the left of Volume) */}
          <a 
            href="https://youtu.be/228FtMaq8uY" 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => audioManager.setVolume(0)} 
            className="btn-hover-dark" 
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
        </>
      ) : (
        <>
          {/* On desktop: Volume on top, Video below */}
          <VolumeControl expandDirection="left" />
          <a 
            href="https://youtu.be/228FtMaq8uY" 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => audioManager.setVolume(0)} 
            className="btn-hover-dark" 
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
        </>
      )}
    </div>
  );
};
