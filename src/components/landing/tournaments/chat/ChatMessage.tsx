import React from "react";

interface ChatMessageProps {
  message: string;
  userId: string;
  isMe: boolean;
  playerName: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isMe,
  playerName,
}) => {
  return (
    <div
      style={{
        alignSelf: isMe ? "flex-end" : "flex-start",
        maxWidth: "85%",
        display: "flex",
        flexDirection: "column",
        gap: "0.2rem",
      }}
    >
      {!isMe && (
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            color: "rgba(255,255,255,0.5)",
            marginLeft: "0.5rem",
          }}
        >
          {playerName}
        </span>
      )}
      <div
        style={{
          background: isMe
            ? "linear-gradient(135deg, #a855f7, #7c3aed)"
            : "rgba(255,255,255,0.08)",
          border: isMe ? "none" : "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          padding: "0.6rem 1rem",
          borderRadius: isMe ? "1.2rem 1.2rem 0 1.2rem" : "1.2rem 1.2rem 1.2rem 0",
          fontSize: "0.9rem",
          lineHeight: 1.4,
          wordBreak: "break-word",
          boxShadow: isMe ? "0 4px 12px rgba(168, 85, 247, 0.2)" : "none",
        }}
      >
        {message}
      </div>
    </div>
  );
};
