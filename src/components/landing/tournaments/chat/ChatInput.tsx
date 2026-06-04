import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  user: any;
  sending: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  user,
  sending,
}) => {
  return (
    <form
      onSubmit={handleSendMessage}
      style={{
        display: "flex",
        gap: "0.5rem",
        marginTop: "0.5rem",
      }}
    >
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder={user ? "Escribe un mensaje..." : "Inicia sesión para chatear"}
        disabled={!user || sending}
        style={{
          flex: 1,
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          padding: "0.75rem 1.2rem",
          borderRadius: "1.5rem",
          fontSize: "0.9rem",
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={!newMessage.trim() || !user || sending}
        style={{
          background: newMessage.trim() && user ? "#a855f7" : "rgba(255,255,255,0.1)",
          border: "none",
          color: "#fff",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: newMessage.trim() && user && !sending ? "pointer" : "not-allowed",
          opacity: newMessage.trim() && user && !sending ? 1 : 0.5,
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
      >
        <Send size={18} />
      </button>
    </form>
  );
};
