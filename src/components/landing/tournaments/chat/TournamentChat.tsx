import React, { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface TournamentChatProps {
  tournamentId: string;
  user: any;
  nameMap: Record<string, string>;
}

export interface ChatMessageType {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export const TournamentChat: React.FC<TournamentChatProps> = ({
  tournamentId,
  user,
  nameMap,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("tournament_messages")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data && !error) {
        setMessages(data);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`tournament_chat_${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tournament_messages",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessageType]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    const text = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const { error } = await supabase.from("tournament_messages").insert({
      tournament_id: tournamentId,
      user_id: user.id,
      message: text,
    });

    if (error) {
      console.error("Error sending message:", error);
    }
    setSending(false);
  };

  const formatPlayerName = (pId: string | null) => {
    if (!pId) return "Usuario";
    if (user && pId === user.id) {
      return user.user_metadata?.custom_username || user.email?.split("@")[0] || "Usuario";
    }
    return nameMap[pId] || `Jugador ${pId.slice(0, 5)}`;
  };

  return (
    <div
      style={{
        background: "rgba(30, 15, 50, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "2.25rem",
        padding: "1.5rem",
        marginTop: "2.5rem",
        backdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "400px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <MessageSquare size={20} color="#a855f7" />
        <h3
          className="text-display"
          style={{
            fontSize: "1.2rem",
            margin: 0,
            color: "#a855f7",
            letterSpacing: "0.05em",
          }}
        >
          Chat del Torneo
        </h3>
      </div>

      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          paddingRight: "0.5rem",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            No hay mensajes aún. ¡Sé el primero en saludar!
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg.message}
              userId={msg.user_id}
              isMe={user?.id === msg.user_id}
              playerName={formatPlayerName(msg.user_id)}
            />
          ))
        )}
      </div>

      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        user={user}
        sending={sending}
      />
    </div>
  );
};
