export interface TeamInfo {
  id: string;
  flag: string;
  code: string;
}

export const DEFAULT_TEAMS = ["Argelia", "Argentina", "Australia", "Austria"];

export const ALL_TEAMS_LIST: TeamInfo[] = [
  { id: "Argelia", flag: "🇩🇿", code: "ALG" },
  { id: "Argentina", flag: "🇦🇷", code: "ARG" },
  { id: "Australia", flag: "🇦🇺", code: "AUS" },
  { id: "Austria", flag: "🇦🇹", code: "AUT" },
  { id: "Bélgica", code: "BEL", flag: "🇧🇪" },
  { id: "Bosnia y Herz", flag: "🇧🇦", code: "BIH" },
  { id: "Brasil", flag: "🇧🇷", code: "BRA" },
  { id: "Canadá", flag: "🇨🇦", code: "CAN" },
  { id: "Costa de Marfil", code: "CIV", flag: "🇨🇮" },
  { id: "DR Congo", flag: "🇨🇩", code: "COD" },
  { id: "Colombia", flag: "🇨🇴", code: "COL" },
  { id: "Cabo Verde", flag: "🇨🇻", code: "CPV" },
  { id: "Croacia", flag: "🇭🇷", code: "CRO" },
  { id: "Curaçao", flag: "🇨🇼", code: "CUW" },
  { id: "República Checa", flag: "🇨🇿", code: "CZE" },
  { id: "Ecuador", flag: "🇪🇨", code: "ECU" },
  { id: "Egipto", flag: "🇪🇬", code: "EGY" },
  { id: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG" },
  { id: "España", flag: "🇪🇸", code: "ESP" },
  { id: "Francia", flag: "🇫🇷", code: "FRA" },
  { id: "Alemania", code: "GER", flag: "🇩🇪" },
  { id: "Ghana", flag: "🇬🇭", code: "GHA" },
  { id: "Haití", flag: "🇭🇹", code: "HAI" },
  { id: "Irán", flag: "🇮🇷", code: "IRN" },
  { id: "Iraq", flag: "🇮🇶", code: "IRQ" },
  { id: "Jordania", flag: "🇯🇴", code: "JOR" },
  { id: "Japón", flag: "🇯🇵", code: "JPN" },
  { id: "Corea del Sur", flag: "🇰🇷", code: "KOR" },
  { id: "Arabia Saudita", flag: "🇸🇦", code: "KSA" },
  { id: "Marruecos", flag: "🇲🇦", code: "MAR" },
  { id: "México", flag: "🇲🇽", code: "MEX" },
  { id: "Países Bajos", flag: "🇳🇱", code: "NED" },
  { id: "Noruega", flag: "🇳🇴", code: "NOR" },
  { id: "Nueva Zelanda", flag: "🇳🇿", code: "NZL" },
  { id: "Panamá", flag: "🇵🇦", code: "PAN" },
  { id: "Paraguay", flag: "🇵🇾", code: "PAR" },
  { id: "Portugal", flag: "🇵🇹", code: "POR" },
  { id: "Qatar", flag: "🇶🇦", code: "QAT" },
  { id: "Sudáfrica", flag: "🇿🇦", code: "RSA" },
  { id: "Escocia", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: "Senegal", flag: "🇸🇳", code: "SEN" },
  { id: "Suiza", flag: "🇨🇭", code: "SUI" },
  { id: "Suecia", code: "SWE", flag: "🇸🇪" },
  { id: "Túnez", flag: "🇹🇳", code: "TUN" },
  { id: "Türkiye", flag: "🇹🇷", code: "TUR" },
  { id: "Uruguay", flag: "🇺🇾", code: "URU" },
  { id: "USA", flag: "🇺🇸", code: "USA" },
  { id: "Uzbekistán", flag: "🇺🇿", code: "UZB" },
];

export const VALID_TEAM_IDS = new Set(ALL_TEAMS_LIST.map((t) => t.id));

/**
 * Validates that the provided input is an array of exactly 4 distinct, valid team IDs.
 */
export function isValidTeamSelection(teams: unknown): teams is string[] {
  if (!Array.isArray(teams) || teams.length !== 4) return false;
  const unique = new Set(teams);
  if (unique.size !== 4) return false;
  return teams.every((t) => typeof t === "string" && VALID_TEAM_IDS.has(t));
}

/**
 * Parses and validates stored teams, falling back to DEFAULT_TEAMS if invalid.
 */
export function getValidTeams(stored: string | null): string[] {
  if (!stored) return DEFAULT_TEAMS;
  try {
    const parsed = JSON.parse(stored);
    if (isValidTeamSelection(parsed)) {
      return parsed;
    }
  } catch {
    // Return DEFAULT_TEAMS on malformed JSON
  }
  return DEFAULT_TEAMS;
}
