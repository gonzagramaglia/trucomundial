import { useState, useEffect } from "react";

export const useLandingNavigation = () => {
  const [showVersus, setShowVersus] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"1v1" | "2v2" | "multiplayer" | null>(null);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [isSelectingTeams, setIsSelectingTeams] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<number>(15);
  const [showRules, setShowRules] = useState(false);

  const [showRanking, setShowRanking] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/votar" ||
        window.location.pathname === "/en/votar"),
  );
  const [showTournament, setShowTournament] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/torneos" ||
        window.location.pathname === "/en/torneos"),
  );
  const [showTournamentEvent, setShowTournamentEvent] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/torneos/") ||
        window.location.pathname.startsWith("/en/torneos/")),
  );
  const [showRoadmap, setShowRoadmap] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/ruta" ||
        window.location.pathname === "/en/ruta"),
  );
  const [showProde, setShowProde] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/prode" ||
        window.location.pathname === "/en/prode" ||
        window.location.pathname === "/fixture" ||
        window.location.pathname === "/en/fixture"),
  );
  const [showDeck, setShowDeck] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/mazo" ||
        window.location.pathname === "/en/mazo"),
  );
  const [showProfile, setShowProfile] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/perfil" ||
        window.location.pathname === "/en/perfil"),
  );
  const [showAdmin, setShowAdmin] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/admin" ||
        window.location.pathname === "/en/admin"),
  );
  const [showCreator, setShowCreator] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/creador" ||
        window.location.pathname === "/en/creador"),
  );
  const [showCreatorsApp, setShowCreatorsApp] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/creadores" ||
        window.location.pathname === "/en/creadores"),
  );

  useEffect(() => {
    const onPop = () => {
      const p = window.location.pathname;
      setShowRanking(p === "/votar" || p === "/en/votar");
      setShowTournament(p === "/torneos" || p === "/en/torneos");
      setShowTournamentEvent(
        p.startsWith("/torneos/") || p.startsWith("/en/torneos/"),
      );
      setShowRoadmap(p === "/ruta" || p === "/en/ruta");
      setShowProde(p === "/prode" || p === "/en/prode" || p === "/fixture" || p === "/en/fixture");
      setShowDeck(p === "/mazo" || p === "/en/mazo");
      setShowProfile(p === "/perfil" || p === "/en/perfil");
      setShowAdmin(p === "/admin" || p === "/en/admin");
      setShowCreator(p === "/creador" || p === "/en/creador");
      setShowCreatorsApp(p === "/creadores" || p === "/en/creadores");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigateTo = (path: string, setScreen: (show: boolean) => void) => {
    setScreen(true);
    if (typeof window !== "undefined") {
      const isEn = window.location.pathname.startsWith("/en");
      window.history.pushState({}, "", isEn ? `/en${path}` : path);
    }
  };

  const handleReturnHome = () => {
    setShowRanking(false);
    setShowTournament(false);
    setShowTournamentEvent(false);
    setShowRoadmap(false);
    setShowProde(false);
    setShowDeck(false);
    setShowProfile(false);
    setShowAdmin(false);
    setShowCreator(false);
    setShowCreatorsApp(false);
    if (typeof window !== "undefined") {
      const isEn = window.location.pathname.startsWith("/en");
      window.history.pushState({}, "", isEn ? "/en" : "/");
    }
  };

  return {
    showVersus, setShowVersus,
    selectedMode, setSelectedMode,
    isSelectingPoints, setIsSelectingPoints,
    isSelectingTeams, setIsSelectingTeams,
    selectedPoints, setSelectedPoints,
    showRules, setShowRules,
    showRanking, setShowRanking,
    showTournament, setShowTournament,
    showTournamentEvent, setShowTournamentEvent,
    showRoadmap, setShowRoadmap,
    showProde, setShowProde,
    showDeck, setShowDeck,
    showProfile, setShowProfile,
    showAdmin, setShowAdmin,
    showCreator, setShowCreator,
    showCreatorsApp, setShowCreatorsApp,
    navigateTo,
    handleReturnHome
  };
};
