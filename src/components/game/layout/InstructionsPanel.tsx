import React from 'react';
import { useTranslation } from 'react-i18next';

interface InstructionsPanelProps {
  maxPoints?: number | string;
}

export const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ maxPoints }) => {
  const { t } = useTranslation();
  const isEn = typeof window !== 'undefined' && window.location.pathname.startsWith('/en');
  const pointsText = maxPoints !== undefined ? maxPoints : (isEn ? "15 or 30" : "15 o 30");

  return (
    <>
      <h3
        className="text-display"
        style={{
          color: "#ffdf00",
          fontSize: "0.95rem",
          marginBottom: "1rem",
          letterSpacing: "0.05em",
        }}
      >
        {t("how_to_play")}
      </h3>
      <div
        style={{
          fontSize: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          color: "rgba(255,255,255,0.8)",
        }}
      >
        <div>
          <p>
            {t("truco_desc_1a")}
            <strong style={{ color: "#ffdf00" }}>{t("truco_desc_1b")}</strong>
            <strong style={{ color: "#fff" }}>{t("truco_desc_1c")}</strong>
            {" "}
            {t("truco_desc_2")}{" "}
            {t("truco_desc_3")}
          </p>
        </div>
        <div>
          <p
            style={{
              fontWeight: "bold",
              color: "#00f2ff",
              marginBottom: "0.3rem",
            }}
          >
            {t("envido_title")}
          </p>
          <p style={{ marginBottom: "0.4rem" }}>
            {t("envido_desc_1")}{" "}
            <strong style={{ color: "#fff" }}>{t("envido_team")}</strong>{" "}
            <strong style={{ color: "#fff" }}>{t("envido_club")}</strong>.
          </p>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "0.5rem",
              fontSize: "0.68rem",
            }}
          >
            <p
              style={{
                color: "#00f2ff",
                fontWeight: "bold",
                marginBottom: "0.2rem",
              }}
            >
              {t("envido_ex_1")}
            </p>
            <p>
              <span dangerouslySetInnerHTML={{ __html: t("envido_ex_1_desc") }} />{" "}
              <span style={{ color: "#ffffff" }}>
                20
              </span>
            </p>
            <p
              style={{
                color: "#00f2ff",
                fontWeight: "bold",
                marginBottom: "0.2rem",
                marginTop: "0.5rem",
              }}
            >
              {t("envido_ex_2")}
            </p>
            <p>
              <span dangerouslySetInnerHTML={{ __html: t("envido_ex_2_desc") }} />
            </p>
          </div>
        </div>
        <div>
          <p
            style={{
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.3rem",
            }}
          >
            {t("al_mazo_title")}
          </p>
          <p>
            {t("al_mazo_desc")}
          </p>
        </div>
        <div>
          <p
            style={{
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.3rem",
            }}
          >
            {t("game_over_title")}
          </p>
          <p>
            <strong style={{ color: 'white', textTransform: 'uppercase', fontWeight: 900 }}>{t("game_over_desc", { points: pointsText })}</strong>
          </p>
        </div>
      </div>
    </>
  );
};
