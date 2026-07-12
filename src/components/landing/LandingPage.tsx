import React, { useState, useEffect } from "react";
import { audioManager } from "../../lib/audio";
import { UtilityButtons } from "../shared/UtilityButtons";
import { MatchmakingOverlay } from "./MatchmakingOverlay";
import { RankingScreen } from "./RankingScreen";
import { TournamentScreen } from "./TournamentScreen";
import { DeckScreen } from "./DeckScreen";
import TournamentEventPage from "./tournaments/TournamentEventPage";
import { RoadmapScreen } from "./RoadmapScreen";
import { ProdeScreen } from "./ProdeScreen";
import { NationalityModal } from "./NationalityModal";
import { ProfileScreen } from "./ProfileScreen";
import { AdminScreen } from "../admin/AdminScreen";
import { CreatorScreen } from "../admin/CreatorScreen";
import { CreatorsApplicationScreen } from "./CreatorsApplicationScreen";
import { RulesModal } from "../shared/RulesModal";

import type { GameMode } from "../../lib/truco/types";
import { useLandingAuth } from "../../hooks/landing/useLandingAuth";
import { useLandingNavigation } from "../../hooks/landing/useLandingNavigation";
import { useMatchmaking } from "../../hooks/landing/useMatchmaking";
import { LandingSidebar } from "./sections/LandingSidebar";
import { HeroSection } from "./sections/HeroSection";

interface LandingPageProps {
  onStart: (
    mode: GameMode,
    points: 15 | 30,
    rivalName?: string,
    rivalId?: string,
    isHost?: boolean,
    roomCode?: string,
    isReconnect?: boolean,
    customDeck?: string[],
  ) => void;
  sessionId: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  sessionId,
}) => {
  const { user, isSuperAdmin, isApprovedCreator, handleAuth } = useLandingAuth();
  
  const nav = useLandingNavigation();
  
  const [selectedTeams, setSelectedTeams] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("truco_selected_teams");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("truco_selected_teams", JSON.stringify(selectedTeams));
  }, [selectedTeams]);

  const matchmaking = useMatchmaking({
    user,
    sessionId,
    onStart,
    setShowVersus: nav.setShowVersus,
    setSelectedMode: nav.setSelectedMode,
    setSelectedPoints: nav.setSelectedPoints,
    setIsSelectingPoints: nav.setIsSelectingPoints,
    selectedTeams: selectedTeams,
    setSelectedTeams: setSelectedTeams,
    setShowTournament: nav.setShowTournament,
    setShowTournamentEvent: nav.setShowTournamentEvent,
  });

  // Deck unlocked status
  const hasUnlockedDeck = true;
  
  // Modals
  const [showNationalityModal, setShowNationalityModal] = useState(false);

  useEffect(() => {
    audioManager.playTheme();
  }, []);

  useEffect(() => {
    if (user && !user.user_metadata?.nationality) {
      setShowNationalityModal(true);
    }
  }, [user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (nav.showProfile) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <ProfileScreen
          onBack={nav.handleReturnHome}
          user={user}
          handleAuth={() => handleAuth(nav.handleReturnHome)}
        />
      </div>
    );
  }

  if (nav.showAdmin && isSuperAdmin) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <AdminScreen onBack={nav.handleReturnHome} user={user} handleAuth={() => handleAuth(nav.handleReturnHome)} />
      </div>
    );
  }

  if (nav.showCreator && isApprovedCreator) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <CreatorScreen onBack={nav.handleReturnHome} user={user} handleAuth={() => handleAuth(nav.handleReturnHome)} />
      </div>
    );
  }

  if (nav.showCreatorsApp) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <CreatorsApplicationScreen onBack={nav.handleReturnHome} user={user} handleAuth={() => handleAuth(nav.handleReturnHome)} />
      </div>
    );
  }

  if (nav.showRanking) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <RankingScreen
          onBack={nav.handleReturnHome}
          user={user}
          handleAuth={() => handleAuth(nav.handleReturnHome)}
        />
      </div>
    );
  }

  if (nav.showRoadmap) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <RoadmapScreen onBack={nav.handleReturnHome} />
      </div>
    );
  }

  if (nav.showTournamentEvent) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <TournamentEventPage
          onBack={nav.handleReturnHome}
          user={user}
          handleAuth={() => handleAuth(nav.handleReturnHome)}
        />
      </div>
    );
  }

  if (nav.showTournament) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <TournamentScreen onBack={nav.handleReturnHome} user={user} handleAuth={() => handleAuth(nav.handleReturnHome)} />
      </div>
    );
  }

  if (nav.showProde) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <ProdeScreen onBack={nav.handleReturnHome} user={user} handleAuth={() => handleAuth(nav.handleReturnHome)} />
      </div>
    );
  }

  if (nav.showDeck) {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <LandingSidebar
          offset={true}
          user={user}
          isSuperAdmin={isSuperAdmin}
          isApprovedCreator={isApprovedCreator}
          showRanking={nav.showRanking}
          showDeck={nav.showDeck}
          showProde={nav.showProde}
          showProfile={nav.showProfile}
          showAdmin={nav.showAdmin}
          showCreator={nav.showCreator}
          setShowRules={nav.setShowRules}
        />
        <DeckScreen onBack={nav.handleReturnHome} user={user} handleAuth={() => handleAuth(nav.handleReturnHome)} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <LandingSidebar
        offset={false}
        user={user}
        isSuperAdmin={isSuperAdmin}
        isApprovedCreator={isApprovedCreator}
        showRanking={nav.showRanking}
        showDeck={nav.showDeck}
        showProde={nav.showProde}
        showProfile={nav.showProfile}
        showAdmin={nav.showAdmin}
        showCreator={nav.showCreator}
        setShowRules={nav.setShowRules}
      />

      <div
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          zIndex: 4000,
        }}
      >
        <UtilityButtons />
      </div>

      <MatchmakingOverlay
        isWaiting={matchmaking.isWaiting}
        timeLeft={matchmaking.timeLeft}
        showVersus={nav.showVersus}
        rivalData={matchmaking.rivalData}
        userName={user?.user_metadata.full_name?.split(" ")[0] || "VOS"}
        onCancel={() => {
          matchmaking.setIsWaiting(false);
          matchmaking.setRoomCode("");
        }}
        formatTime={formatTime}
        roomCode={matchmaking.roomCode}
      />

      <HeroSection
        user={user}
        hasUnlockedDeck={hasUnlockedDeck}
        selectedMode={nav.selectedMode}
        setSelectedMode={nav.setSelectedMode}
        isSelectingPoints={nav.isSelectingPoints}
        setIsSelectingPoints={nav.setIsSelectingPoints}
        setSelectedPoints={nav.setSelectedPoints}
        isJoining={matchmaking.isJoining}
        setIsJoining={matchmaking.setIsJoining}
        inputCode={matchmaking.inputCode}
        setInputCode={matchmaking.setInputCode}
        joinError={matchmaking.joinError}
        handleJoinRoom={matchmaking.handleJoinRoom}
        initiateGame={(mode, points) => matchmaking.initiateGame(mode, points, () => handleAuth(nav.handleReturnHome))}
        handleAuth={() => handleAuth(nav.handleReturnHome)}
        navigateTo={nav.navigateTo}
        setShowRanking={nav.setShowRanking}
        setShowTournament={nav.setShowTournament}
        setShowDeck={nav.setShowDeck}
        setShowRoadmap={nav.setShowRoadmap}
        setShowProde={nav.setShowProde}
      />

      {showNationalityModal && (
          <NationalityModal
            user={user}
            onSaved={() => setShowNationalityModal(false)}
          />
        )}

      {nav.showRules && (
        <RulesModal isOpen={nav.showRules} onClose={() => nav.setShowRules(false)} />
      )}
    </div>
  );
};
