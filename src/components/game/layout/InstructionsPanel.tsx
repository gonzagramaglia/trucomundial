import React from 'react';
import { useTranslation } from 'react-i18next';

interface InstructionsPanelProps {
  maxPoints?: number;
}

export const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ maxPoints = 30 }) => {
  const { t } = useTranslation();
  return (
    <>
      <h3
        className="text-display"
        style={{
          color: "var(--color-accent)",
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
          <p
            style={{
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "0.3rem",
            }}
          >
            {t("truco_title")}
          </p>
          <p>
            {t("truco_desc_1")}{" "}
            <strong style={{ color: "var(--color-accent)" }}>
              {t("truco_desc_2")}
            </strong>{" "}
            {t("truco_desc_3")}
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
                color: "var(--color-primary)",
                fontWeight: "bold",
                marginBottom: "0.2rem",
              }}
            >
              {t("envido_ex_1")}
            </p>
            <p>
              {t("envido_ex_1_desc")}{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                40
              </strong>
            </p>
            <p
              style={{
                color: "var(--color-primary)",
                fontWeight: "bold",
                marginBottom: "0.2rem",
                marginTop: "0.5rem",
              }}
            >
              {t("envido_ex_2")}
            </p>
            <p>
              {t("envido_ex_2_desc")}
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
            <strong style={{ color: 'var(--color-accent)' }}>{t("game_over_desc", { points: maxPoints })}</strong>
          </p>
        </div>
      </div>
    </>
  );
};
