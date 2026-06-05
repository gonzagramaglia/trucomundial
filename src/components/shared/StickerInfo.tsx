import React from 'react';

interface StickerInfoProps {
  country: string;
  club: string;
  isHovered: boolean;
  color?: string;
}

import { useTranslation } from 'react-i18next';

export const StickerInfo: React.FC<StickerInfoProps> = ({ country, club, isHovered, color }) => {
  const { t } = useTranslation();
  const textColor = color || "var(--color-primary)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.15s ease",
        pointerEvents: "none",
      }}
    >
      <span
        className="text-display"
        style={{
          color: textColor,
          fontSize: "0.8rem",
          lineHeight: 1.2,
        }}
      >
        {t(`country_${country.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}`)}
      </span>
      <span
        className="text-display"
        style={{
          color: textColor,
          fontSize: "0.75rem",
          lineHeight: 1.2,
          opacity: 0.8
        }}
      >
        ({club})
      </span>
    </div>
  );
};
