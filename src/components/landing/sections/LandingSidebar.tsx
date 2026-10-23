import type { AuthUser } from '../../../hooks/useCurrentUser';
import React from "react";
import { BookOpen, User, Trophy, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LandingSidebarProps {
  offset?: boolean;
  user: AuthUser | null;
  isSuperAdmin: boolean;
  isApprovedCreator: boolean;
  showRanking: boolean;
  showDeck: boolean;
  showProde: boolean;
  showProfile: boolean;
  showAdmin: boolean;
  showCreator: boolean;
  setShowRules: (show: boolean) => void;
}

export const LandingSidebar: React.FC<LandingSidebarProps> = ({
  offset = false,
  user,
  isSuperAdmin,
  isApprovedCreator,
  showRanking,
  showDeck,
  showProde,
  showProfile,
  showAdmin,
  showCreator,
  setShowRules,
}) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = React.useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isScreenWithRules = showRanking || showDeck || showProde;
  const hideRulesBtn = isMobile && (showProfile || isScreenWithRules);

  return (
    <div
      style={{
        position: "fixed",
        top: offset ? "4.5rem" : "1.5rem",
        left: "1.5rem",
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        gap: "0.5rem",
        zIndex: 6000,
      }}
    >
      {user && !showProfile && !showAdmin && !showRanking && !showDeck && !showProde && (
        <button
          onClick={() => {
            const base = window.location.pathname.startsWith("/trucomundial") ? "/trucomundial" : "";
            const isEn = window.location.pathname.startsWith(`${base}/en`) || window.location.pathname.startsWith("/en");
            const target = `${base}${isEn ? "/en/perfil" : "/perfil"}`;
            if (window.location.pathname !== target) {
              window.history.pushState({}, "", target);
              window.dispatchEvent(new PopStateEvent("popstate"));
            }
          }}
          className="btn-hover-dark"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            transition: "none",
          }}
          title={t("profile")}
        >
          <User size={20} style={{ color: "#ffffff" }} />
        </button>
      )}

      {!hideRulesBtn && (
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="btn-hover-dark"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            transition: "none",
          }}
          title={t("rules")}
        >
          <BookOpen size={20} />
        </button>
      )}

      {isApprovedCreator && !showCreator && !showAdmin && (
        <button
          onClick={() => {
            const base = window.location.pathname.startsWith("/trucomundial") ? "/trucomundial" : "";
            const isEn = window.location.pathname.startsWith(`${base}/en`) || window.location.pathname.startsWith("/en");
            const path = `${base}${isEn ? "/en/creador" : "/creador"}`;
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="btn-hover-dark"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            transition: "none",
          }}
          title={t("creator_panel")}
        >
          <Trophy size={18} style={{ color: "#ffffff" }} />
        </button>
      )}

      {isSuperAdmin && !showAdmin && (
        <button
          onClick={() => {
            const base = window.location.pathname.startsWith("/trucomundial") ? "/trucomundial" : "";
            const isEn = window.location.pathname.startsWith(`${base}/en`) || window.location.pathname.startsWith("/en");
            const path = `${base}${isEn ? "/en/admin" : "/admin"}`;
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="btn-hover-dark"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            transition: "none",
          }}
          title={t("admin_panel")}
        >
          <ShieldAlert size={18} style={{ color: "#ffffff" }} />
        </button>
      )}
    </div>
  );
};
