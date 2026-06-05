import { useState, useEffect } from "react";
import { useTrucoGame } from "../../hooks/useTrucoGame";
import { TrucoGameView } from "../game/layout/TrucoGameView";
import { useTwitchChat } from "../../hooks/useTwitchChat";

export function TwitchApp() {
  const [channel, setChannel] = useState<string>("");
  const [points, setPoints] = useState<number>(30);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(["Argentina", "Francia", "España", "Nueva Zelanda"]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionId] = useState(() => `twitch_${Math.random().toString(36).substr(2, 9)}`);

  const core = useTrucoGame(sessionId);
  const { activeUser, clearActiveUser, forceActiveUser, lastCommand, connectionStatus } = useTwitchChat(isConfigured ? channel : null);

  // Restart activeUser when round resets
  useEffect(() => {
    // A new hand has started if there are 3 cards and no cards are played
    if (core.playerHand.length === 3 && core.playedCards.length === 0) {
      clearActiveUser();
    }
  }, [core.playerHand, core.playedCards, clearActiveUser]);

  // Execute commands from twitch
  useEffect(() => {
    if (!lastCommand || !activeUser) return;
    
    // Only process if it's player's turn to play a card, or to respond
    const { command } = lastCommand;
    
    // Slight delay to ensure state isn't jumping
    const timer = setTimeout(() => {
      switch (command) {
        case "carta_1":
          if (core.playerHand[0]) core.playCard(core.playerHand[0]);
          break;
        case "carta_2":
          if (core.playerHand[1]) core.playCard(core.playerHand[1]);
          break;
        case "carta_3":
          if (core.playerHand[2]) core.playCard(core.playerHand[2]);
          break;
        case "truco":
          core.handleCall("truco", 1, "player");
          break;
        case "retruco":
          core.handleCall("truco", 2, "player");
          break;
        case "vale_cuatro":
          core.handleCall("truco", 3, "player");
          break;
        case "envido":
          core.handleCall("envido", 1, "player");
          break;
        case "real_envido":
          core.handleCall("envido", 2, "player");
          break;
        case "falta_envido":
          core.handleCall("envido", 3, "player");
          break;
        case "quiero":
          core.handleResponse(true);
          break;
        case "no_quiero":
          core.handleResponse(false);
          break;
        case "me_voy":
          core.handleMazo();
          break;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [lastCommand]); // activeUser could be safely ignored here as lastCommand is only generated for active user

  const startGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (channel.trim() === "") return;
    if (selectedTeams.length < 2) return;
    setIsConfigured(true);
    
    // Local game vs CPU
    core.startGame("1v1", "CPU", "", points, selectedTeams);
    core.setGameState("playing");
  };

  if (!isConfigured) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white"
      }}>
        <div style={{
          background: "rgba(24, 24, 27, 0.9)",
          padding: "2.5rem 2rem",
          borderRadius: "1rem",
          boxShadow: "0 0 30px rgba(145, 70, 255, 0.3)",
          border: "1px solid #9146FF",
          maxWidth: "450px",
          width: "100%",
          textAlign: "center"
        }}>
          <h2 style={{ color: "#9146FF", marginBottom: "1rem" }}>Twitch Plays Truco Mundial</h2>
          <p style={{ marginBottom: "2rem", opacity: 0.8 }}>Ingresa el nombre del canal de Twitch para conectar el chat.</p>
          <form onSubmit={startGame}>
            <div style={{ marginBottom: "1rem", textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>Canal de Twitch</label>
              <input
                type="text"
                placeholder="Ej: muchomovimiento"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  boxSizing: "border-box"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "1rem", textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>¿A cuántos puntos va a jugarse la partida?</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setPoints(15)}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    borderRadius: "0.5rem",
                    border: points === 15 ? "1px solid #9146FF" : "1px solid rgba(255,255,255,0.2)",
                    background: points === 15 ? "rgba(145, 70, 255, 0.2)" : "rgba(0,0,0,0.5)",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: "0.9rem"
                  }}
                >
                  A 15 (Rápida)
                </button>
                <button
                  type="button"
                  onClick={() => setPoints(30)}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    borderRadius: "0.5rem",
                    border: points === 30 ? "1px solid #9146FF" : "1px solid rgba(255,255,255,0.2)",
                    background: points === 30 ? "rgba(145, 70, 255, 0.2)" : "rgba(0,0,0,0.5)",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: "0.9rem"
                  }}
                >
                  A 30 (Clásica)
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>Mazo ({selectedTeams.length}/2+)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {[
                  { id: 'Argentina', flag: '🇦🇷' },
                  { id: 'Francia', flag: '🇫🇷' },
                  { id: 'España', flag: '🇪🇸' },
                  { id: 'Brasil', flag: '🇧🇷' },
                  { id: 'Argelia', flag: '🇩🇿' },
                  { id: 'México', flag: '🇲🇽' },
                  { id: 'Colombia', flag: '🇨🇴' },
                  { id: 'Japón', flag: '🇯🇵' },
                  { id: 'Uruguay', flag: '🇺🇾' },
                  { id: 'Nueva Zelanda', flag: '🇳🇿' }
                ].map(team => {
                  const isSelected = selectedTeams.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (selectedTeams.length > 2) setSelectedTeams(prev => prev.filter(t => t !== team.id));
                        } else {
                          setSelectedTeams(prev => [...prev, team.id]);
                        }
                      }}
                      style={{
                        background: isSelected ? "#9146FF" : "rgba(255,255,255,0.1)",
                        border: "1px solid",
                        borderColor: isSelected ? "#9146FF" : "transparent",
                        borderRadius: "2rem",
                        padding: "0.4rem 0.8rem",
                        color: isSelected ? "white" : "rgba(255,255,255,0.7)",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        transition: "all 0.2s"
                      }}
                    >
                      {team.flag} {team.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedTeams.length < 2 || channel.trim() === ""}
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: "0.5rem",
                border: "none",
                background: selectedTeams.length < 2 || channel.trim() === "" ? "rgba(145, 70, 255, 0.5)" : "#9146FF",
                color: "white",
                fontWeight: "bold",
                cursor: selectedTeams.length < 2 || channel.trim() === "" ? "default" : "pointer",
                transition: "all 0.2s"
              }}
            >
              Conectar y Jugar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @media (max-width: 767px) {
          .twitch-desktop-ui {
            display: none !important;
          }
        }
      `}</style>
      <div 
        className="twitch-desktop-ui"
        style={{
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(145, 70, 255, 0.9)",
        padding: "0.5rem 1rem",
        borderRadius: "2rem",
        zIndex: 100,
        fontWeight: "bold",
        color: "white",
        boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        <div style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: connectionStatus === "connected" ? "#00ff00" : connectionStatus === "connecting" ? "#ffff00" : "#ff0000"
        }} />
        {activeUser 
          ? (activeUser === 'Streamer' ? 'Estás jugando esta ronda' : `${activeUser} está jugando esta ronda`) 
          : `Escribí !jugar en el chat para jugar la ronda`}
        
        {activeUser !== 'Streamer' && (
          <button
            onClick={() => forceActiveUser('Streamer')}
            style={{
              marginLeft: "0.2rem",
              background: "white",
              color: "#9146FF",
              border: "none",
              padding: "0.2rem 0.6rem",
              borderRadius: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "0.8rem"
            }}
          >
            Jugar Yo
          </button>
        )}
      </div>
      <TrucoGameView
        {...core}
        user={null}
        roomCode={null}
        rivalName="CPU"
        showExitModal={showExitModal}
        onExitRequest={() => setShowExitModal(true)}
        onRestartGame={() => {
           core.handleRestartGame();
           core.startGame("1v1", "CPU", "", points, selectedTeams);
        }}
        onPlayCard={core.playCard}
        onHandleCall={core.handleCall}
        onHandleResponse={core.handleResponse}
        onHandleMazo={core.handleMazo}
        onCloseExit={() => setShowExitModal(false)}
        onConfirmExit={() => {
          setShowExitModal(false);
          setIsConfigured(false);
        }}
      />
      <div 
        className="twitch-desktop-ui"
        style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "rgba(24, 24, 27, 0.9)",
        border: "1px solid #9146FF",
        padding: "1rem",
        borderRadius: "0.5rem",
        color: "white",
        fontSize: "0.85rem",
        zIndex: 100,
        boxShadow: "0 0 15px rgba(145, 70, 255, 0.3)",
        pointerEvents: "none"
      }}>
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#9146FF" }}>Comandos del Chat</h4>
        <ul style={{ margin: 0, paddingLeft: "1.2rem", opacity: 0.9, lineHeight: "1.5" }}>
          <li><b>!jugar</b> - Reservar turno</li>
          <li><b>!carta 1/2/3</b> - Jugar carta</li>
          <li><b>!truco</b> / <b>!retruco</b> / <b>!valecuatro</b></li>
          <li><b>!envido</b> / <b>!realenvido</b> / <b>!faltaenvido</b></li>
          <li><b>!quiero</b> / <b>!no quiero</b></li>
          <li><b>!mazo</b> - Irse al mazo</li>
        </ul>
      </div>
    </div>
  );
}
