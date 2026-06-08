import React from 'react';
import { Video } from 'lucide-react';
import { VolumeControl } from './VolumeControl';
import { audioManager } from '../../lib/audio';

export const UtilityButtons: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        zIndex: 4000,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
        <VolumeControl expandDirection="left" />
        <a
          href="https://youtu.be/228FtMaq8uY"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => audioManager.setVolume(0)}
          className="btn-hover-dark mobile-hide"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            transition: "none",
          }}
          title="Video"
        >
          <Video size={20} />
        </a>
      </div>
    </div>
  );
};
