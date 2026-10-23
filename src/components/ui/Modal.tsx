import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, showClose = true }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    if (typeof document !== "undefined") {
      prevActiveElement.current = document.activeElement as HTMLElement | null;
    }

    const timer = setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      prevActiveElement.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const content = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        boxSizing: "border-box",
        overflowY: "auto"
      }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          background: "#181818",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 20,
          padding: "1.75rem 2rem",
          minWidth: 320,
          maxWidth: "min(90vw, 420px)",
          maxHeight: "calc(100vh - 3rem)",
          margin: "auto",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
          color: "#fff",
          position: "relative",
          boxSizing: "border-box",
          outline: "none"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        {showClose && (
          <button
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255, 255, 255, 0.7)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
              (e.currentTarget as HTMLButtonElement).style.color = "white";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
            }}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
