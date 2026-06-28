import React from 'react';
import { useTranslation } from 'react-i18next';
import { groupStandings, thirdPlaceStandings } from '../../lib/standingsData';
import { fixtureMatches } from '../../lib/fixtureData';

// Build a flag map from fixtureMatches
const flagMap: Record<string, string> = {};
fixtureMatches.forEach(m => {
  if (m.teamA && m.flagA) flagMap[m.teamA] = m.flagA;
  if (m.teamB && m.flagB) flagMap[m.teamB] = m.flagB;
});

// Aliases for FIFA names vs our fixtureData names
flagMap['Bosnia y Herzegovina'] = flagMap['Bosnia & Herzegovina'] || '🇧🇦';
flagMap['EE. UU.'] = flagMap['Estados Unidos'] || '🇺🇸';
flagMap['RD Congo'] = flagMap['DR Congo'] || '🇨🇩';
flagMap['RI de Irán'] = flagMap['Irán'] || '🇮🇷';
flagMap['República de Corea'] = flagMap['Corea del Sur'] || '🇰🇷';
flagMap['Chequia'] = flagMap['República Checa'] || '🇨🇿';
flagMap['Catar'] = flagMap['Qatar'] || '🇶🇦';
flagMap['Islas de Cabo Verde'] = flagMap['Cabo Verde'] || '🇨🇻';
flagMap['Arabia Saudí'] = flagMap['Arabia Saudita'] || '🇸🇦';

interface GroupStandingsProps {
  searchQuery: string;
}

export const GroupStandings: React.FC<GroupStandingsProps> = ({ searchQuery }) => {
  const { t } = useTranslation();
  const normalizedSearch = searchQuery.toLowerCase().trim();
  
  const getFlag = (team: string) => flagMap[team] || '';

  const renderTable = (title: string, data: any[], isThirdPlace = false) => (
    <div style={{
      background: "rgba(14, 10, 24, 0.4)",
      border: "1px solid rgba(0, 242, 255, 0.15)",
      borderRadius: "1.5rem",
      padding: typeof window !== 'undefined' && window.innerWidth < 768 ? "1rem" : "1.5rem",
      marginBottom: "2rem",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      overflowX: "auto"
    }}>
      <h3 style={{ margin: "0 0 1rem 0", color: "#00f2ff", fontSize: "1.2rem", fontWeight: 700 }}>
        {title}
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.5)" }}>
            <th style={{ textAlign: "left", padding: "0.5rem", width: "40px" }}>{t("table_pos")}</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>{t("table_team")}</th>
            {isThirdPlace && <th style={{ textAlign: "center", padding: "0.5rem" }}>{t("table_group")}</th>}
            <th style={{ textAlign: "center", padding: "0.5rem", width: "40px" }}>PJ</th>
            <th style={{ textAlign: "center", padding: "0.5rem", width: "40px" }}>G</th>
            <th style={{ textAlign: "center", padding: "0.5rem", width: "40px" }}>E</th>
            <th style={{ textAlign: "center", padding: "0.5rem", width: "40px" }}>P</th>
            <th style={{ textAlign: "center", padding: "0.5rem", width: "40px" }}>GF</th>
            <th style={{ textAlign: "center", padding: "0.5rem", width: "40px" }}>GC</th>
            <th style={{ textAlign: "center", padding: "0.5rem", width: "40px" }}>DG</th>
            <th style={{ textAlign: "center", padding: "0.5rem", width: "50px" }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const isHighlighted = isThirdPlace ? idx < 8 : idx < 2;
            
            // If searching for a specific group or team, highlight it strongly
            let isSearchMatch = false;
            if (normalizedSearch) {
              const matchesTeam = row.team.toLowerCase().includes(normalizedSearch);
              const matchesGroup = isThirdPlace && row.group?.toLowerCase().includes(normalizedSearch);
              isSearchMatch = matchesTeam || matchesGroup;
            }

            return (
              <tr key={idx} style={{ 
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                background: isSearchMatch ? "rgba(251, 191, 36, 0.15)" : (isHighlighted ? "rgba(0, 242, 255, 0.08)" : "transparent"),
                border: isSearchMatch ? "1px solid rgba(251, 191, 36, 0.5)" : "none"
              }}>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: isSearchMatch ? "#fbbf24" : (isHighlighted ? "#00f2ff" : "inherit") }}>{row.rank}</td>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{getFlag(row.team)}</span>
                  <span>{row.team === 'Bosnia y Herzegovina' ? 'Bosnia & Herz' : row.team}</span>
                </div>
              </td>
              {isThirdPlace && <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)" }}>{row.group?.replace('Grupo ', '')}</td>}
              <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)" }}>{row.pj}</td>
              <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)" }}>{row.g}</td>
              <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)" }}>{row.e}</td>
              <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)" }}>{row.p}</td>
              <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)" }}>{row.gf}</td>
              <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)" }}>{row.gc}</td>
              <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)" }}>{row.dg}</td>
              <td style={{ textAlign: "center", padding: "0.75rem 0.5rem", fontWeight: 900, color: "#00f2ff" }}>{row.pts}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ marginTop: "4rem", width: "100%" }}>
      <div style={{ textAlign: 'center', marginBottom: "2rem" }}>
        <h3 className="text-display" style={{ margin: 0, fontSize: "1.6rem", color: "#00f2ff", textShadow: "0 0 10px rgba(0, 242, 255, 0.3)" }}>
          {t("official_standings")}
        </h3>
        <div style={{ opacity: 0.6, fontSize: "0.9rem", marginTop: "0.2rem", fontWeight: 600 }}>
          {t("group_standings_desc")}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))", gap: "1rem" }}>
        {Object.entries(groupStandings)
          .filter(([groupLetter, data]) => {
            if (!normalizedSearch) return true;
            return `grupo ${groupLetter.toLowerCase()}`.includes(normalizedSearch) || 
                   `group ${groupLetter.toLowerCase()}`.includes(normalizedSearch) ||
                   groupLetter.toLowerCase().includes(normalizedSearch) ||
                   data.some(row => row.team.toLowerCase().includes(normalizedSearch));
          })
          .map(([groupLetter, data]) => (
            renderTable(`${t("group")} ${groupLetter}`, data)
          ))
        }
      </div>

      {(() => {
        if (!normalizedSearch) return true;
        if ("mejores terceros".includes(normalizedSearch) || "terceros".includes(normalizedSearch) || 
            "best thirds".includes(normalizedSearch) || "thirds".includes(normalizedSearch)) return true;
        
        // Check if any team in the third place standings matches the search query
        return thirdPlaceStandings.some(row => {
          const matchesTeam = row.team.toLowerCase().includes(normalizedSearch);
          const matchesGroup = row.group?.toLowerCase().includes(normalizedSearch);
          return matchesTeam || matchesGroup;
        });
      })() && (
        <div style={{ marginTop: "2rem" }}>
          {renderTable(t("best_thirds"), thirdPlaceStandings, true)}
        </div>
      )}
    </div>
  );
};
