import { useState, useEffect } from "react";

const ROUTES = {
  ranking: ["/votar", "/en/votar"],
  tournament: ["/torneos", "/en/torneos"],
  roadmap: ["/ruta", "/en/ruta"],
  prode: ["/prode", "/en/prode", "/fixture", "/en/fixture"],
  deck: ["/mazo", "/en/mazo"],
  profile: ["/perfil", "/en/perfil"],
  admin: ["/admin", "/en/admin"],
  creator: ["/creador", "/en/creador"],
  creatorsApp: ["/creadores", "/en/creadores"],
};

const matchRoute = (path: string, routes: string[]) => routes.includes(path);
const matchPrefix = (path: string, prefixes: string[]) => prefixes.some(p => path.startsWith(p));

export const useLandingNavigation = () => {
  const [showVersus, setShowVersus] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"1v1" | "2v2" | "multiplayer" | null>(null);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [isSelectingTeams, setIsSelectingTeams] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<number>(15);
  const [showRules, setShowRules] = useState(false);

  const getBasePath = () => {
    if (typeof window === "undefined") return "";
    return window.location.pathname.startsWith("/trucomundial") ? "/trucomundial" : "";
  };

  const getPath = () => {
    if (typeof window === "undefined") return "";
    const base = getBasePath();
    const p = window.location.pathname;
    if (base && p.startsWith(base)) {
      return p.slice(base.length) || "/";
    }
    return p;
  };

  const [showRanking, setShowRanking] = useState(() => matchRoute(getPath(), ROUTES.ranking));
  const [showTournament, setShowTournament] = useState(() => matchRoute(getPath(), ROUTES.tournament));
  const [showTournamentEvent, setShowTournamentEvent] = useState(() => matchPrefix(getPath(), ["/torneos/", "/en/torneos/"]));
  const [showRoadmap, setShowRoadmap] = useState(() => matchRoute(getPath(), ROUTES.roadmap));
  const [showProde, setShowProde] = useState(() => matchRoute(getPath(), ROUTES.prode));
  const [showDeck, setShowDeck] = useState(() => matchRoute(getPath(), ROUTES.deck));
  const [showProfile, setShowProfile] = useState(() => matchRoute(getPath(), ROUTES.profile));
  const [showAdmin, setShowAdmin] = useState(() => matchRoute(getPath(), ROUTES.admin));
  const [showCreator, setShowCreator] = useState(() => matchRoute(getPath(), ROUTES.creator));
  const [showCreatorsApp, setShowCreatorsApp] = useState(() => matchRoute(getPath(), ROUTES.creatorsApp));

  useEffect(() => {
    const onPop = () => {
      const p = getPath();
      setShowRanking(matchRoute(p, ROUTES.ranking));
      setShowTournament(matchRoute(p, ROUTES.tournament));
      setShowTournamentEvent(matchPrefix(p, ["/torneos/", "/en/torneos/"]));
      setShowRoadmap(matchRoute(p, ROUTES.roadmap));
      setShowProde(matchRoute(p, ROUTES.prode));
      setShowDeck(matchRoute(p, ROUTES.deck));
      setShowProfile(matchRoute(p, ROUTES.profile));
      setShowAdmin(matchRoute(p, ROUTES.admin));
      setShowCreator(matchRoute(p, ROUTES.creator));
      setShowCreatorsApp(matchRoute(p, ROUTES.creatorsApp));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigateTo = (path: string, setScreen: (show: boolean) => void) => {
    setScreen(true);
    if (typeof window !== "undefined") {
      const base = getBasePath();
      const current = window.location.pathname;
      const isEn = current.startsWith(`${base}/en`) || current.startsWith("/en");
      window.history.pushState({}, "", `${base}${isEn ? `/en${path}` : path}`);
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
      const base = getBasePath();
      const current = window.location.pathname;
      const isEn = current.startsWith(`${base}/en`) || current.startsWith("/en");
      window.history.pushState({}, "", `${base}${isEn ? "/en" : "/"}`);
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
