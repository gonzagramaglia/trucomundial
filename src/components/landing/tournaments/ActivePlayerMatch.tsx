import { useState, useEffect } from "react";
import { Clock, Play } from "lucide-react";

export const ActivePlayerMatch = ({ myCurrentMatch, user, nameMap, onPlayMatch }: any) => {
  const [countdown, setCountdown] = useState("05:00");
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    // Fake 5 minute countdown
    let time = 300;
    const interval = setInterval(() => {
      time--;
      if (time <= 0) {
        clearInterval(interval);
        setCountdown("00:00");
      } else {
        const m = Math.floor(time / 60);
        const s = time % 60;
        setCountdown(`0${m}:${s < 10 ? "0" : ""}${s}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!myCurrentMatch) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>
        Ya no estás en competencia o hubo un error al cargar tu partido.
      </div>
    );
  }

  const isPlayerA = myCurrentMatch.player_a_id === user?.id;
  const rivalId = isPlayerA ? myCurrentMatch.player_b_id : myCurrentMatch.player_a_id;

  if (!rivalId) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", opacity: 0.8, background: "rgba(255,255,255,0.03)", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#a855f7" }}>Esperando Rival</h3>
        <p style={{ margin: 0 }}>Aún no se ha definido tu rival para esta ronda. Esperá a que termine su partido.</p>
        <div style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: 800 }}>{countdown}</div>
      </div>
    );
  }

  const rivalName = nameMap[rivalId] || `Jugador ${rivalId.slice(0, 5)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "1rem" }}>
        <div style={{ fontWeight: 800, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={18} style={{ color: "#a855f7" }} /> Tiempo Restante
        </div>
        <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ff7800", fontFamily: "monospace" }}>
          {countdown}
        </div>
      </div>

      <button
        disabled={clicked}
        onClick={() => {
          setClicked(true);
          onPlayMatch(myCurrentMatch.match_code, isPlayerA); // If isPlayerA, they might be host? Not necessarily, but we pass true for now
        }}
        className="btn-hover-dark"
        style={{
          background: clicked ? "rgba(168, 85, 247, 0.4)" : "linear-gradient(to right, #10b981, #059669)",
          border: clicked ? "1px solid rgba(168, 85, 247, 0.8)" : "none",
          padding: "2rem",
          borderRadius: "1.5rem",
          fontSize: "1.4rem",
          fontWeight: 900,
          color: "#fff",
          cursor: clicked ? "not-allowed" : "pointer",
          boxShadow: clicked ? "none" : "6px 6px 0px #000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          textTransform: "uppercase",
          transition: "all 0.2s"
        }}
      >
        {clicked ? (
          <>Esperando a {rivalName}...</>
        ) : (
          <>
            <Play fill="#fff" size={24} /> JUGAR CONTRA {rivalName}
          </>
        )}
      </button>
    </div>
  );
};
