import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useTranslation } from 'react-i18next';
import { audioManager } from '../../../lib/audio';

interface GameModalsProps {
  winnerModal: "player" | "cpu" | null;
  showExitModal: boolean;
  abandonmentModal: boolean;
  isMultiplayer?: boolean;
  isRivalConnected?: boolean;
  isSelfConnected?: boolean;
  rivalName?: string;
  roomCode?: string | null;
  showCountdown?: boolean;
  onRestart: () => void;
  onCloseExit: () => void;
  onConfirmExit: () => void;
  onContinue: () => void;
}

export const GameModals: React.FC<GameModalsProps> = ({
  winnerModal,
  showExitModal,
  abandonmentModal,
  isMultiplayer,
  isRivalConnected = true,
  isSelfConnected = true,
  rivalName = "RIVAL",
  roomCode,
  showCountdown,
  onRestart,
  onCloseExit,
  onConfirmExit,
  onContinue
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);
  console.log("[MODALS] Winner Modal Status:", winnerModal);

  const isDisconnected = isMultiplayer && (!isRivalConnected || !isSelfConnected) && !showCountdown && !winnerModal && !showExitModal;

  React.useEffect(() => {
    if (winnerModal === "player") {
      audioManager.playSystemSound("ganaste");
      audioManager.playSystemSound("aplausos");
    } else if (winnerModal === "cpu") {
      audioManager.playSystemSound("perdiste");
    }
  }, [winnerModal]);

  return (
    <>
      <Modal open={!!winnerModal} onClose={() => { }} showClose={false}>
        <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
          <h2 className="text-display" style={{ fontSize: "3.5rem", color: winnerModal === "player" ? "#00f2ff" : "var(--color-secondary)", marginBottom: 12, lineHeight: 1.2, marginTop: 10 }}>
            {winnerModal === "player" ? t("you_won") : t("you_lost")}
          </h2>
          <Button
            variant="white"
            className="btn-hover-dark"
            style={{ fontSize: "1.2rem", padding: "0.8rem 3rem", fontWeight: 800 }}
            onClick={onConfirmExit}
          >
            {t("back_to_home")}
          </Button>
        </div>
      </Modal>

      <Modal open={showExitModal} onClose={onCloseExit} showClose={false}>
        <div style={{ textAlign: "center", padding: "0.75rem 0 0 0" }}>
          <h2 className="text-display" style={{ fontSize: "2rem", color: "#fff", marginBottom: 20, width: "100%", textAlign: "center" }}>
            {t("return_to_home_q")}
          </h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", width: "100%", alignItems: "stretch" }}>
            <Button
              variant="white"
              className="btn-hover-dark"
              onClick={onConfirmExit}
              style={{ flex: 1, fontSize: "1.2rem", padding: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {t("exit_to_home")}
            </Button>
            <Button
              variant="secondary"
              className="btn-hover-dark"
              onClick={onContinue}
              style={{ flex: 1, fontSize: "1.2rem", padding: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {t("keep_playing")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={abandonmentModal} onClose={() => { }} showClose={false}>
        <div style={{ textAlign: "center", padding: "1.5rem 0 0 0" }}>
          <h2 className="text-display" style={{ fontSize: "2rem", color: "var(--color-secondary)", marginBottom: 16 }}>
            {t("match_abandoned")}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24, fontSize: "1.1rem" }}>
            {t("rival_abandoned")}
          </p>
          <Button variant="primary" style={{ fontSize: "1.1rem", padding: "0.7rem 2.5rem" }} onClick={onRestart}>
            {t("back_to_home")}
          </Button>
        </div>
      </Modal>

      <Modal open={!!isDisconnected} onClose={() => { }} showClose={false}>
        <div style={{ textAlign: "center", padding: "1.5rem 0 0 0" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>⚠️</div>
          <h2 className="text-display" style={{ fontSize: "2.2rem", color: "#ff3c00", marginBottom: 16, lineHeight: 1.1 }}>
            {!isSelfConnected ? t("you_disconnected") : t("rival_disconnected_title", { name: rivalName.toUpperCase() })}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 16, fontSize: "1.1rem", lineHeight: 1.4 }}>
            {!isSelfConnected 
              ? t("you_disconnected_desc")
              : t("rival_disconnected_desc", { name: rivalName })}
          </p>

          {roomCode && (
            <div style={{ background: "rgba(0, 242, 255, 0.08)", border: "1px solid #00f2ff", padding: "1.25rem", borderRadius: "1rem", margin: "1.5rem 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t("room_code")}</span>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#00f2ff", letterSpacing: "0.3em", fontFamily: "monospace" }}>{roomCode}</span>
              <span style={{ fontSize: "0.85rem", color: "#00f2ff" }}>{t("save_code_desc")}</span>
              <Button
                variant="secondary"
                style={{ marginTop: "0.5rem", fontSize: "0.9rem", padding: "0.5rem 1rem", alignSelf: "center" }}
                onClick={() => {
                  navigator.clipboard.writeText(roomCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? t("code_copied") : t("copy_code")}
              </Button>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
            <Button variant="white" className="btn-hover-dark" style={{ fontSize: "1.1rem", padding: "0.7rem 2.5rem", fontWeight: 800 }} onClick={onConfirmExit}>
              {t("exit_to_home")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
