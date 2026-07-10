import i18n from "./i18n";

/**
 * Formats an ISO date string into a locale-aware tournament date display.
 * @param dateStr - ISO date string (e.g. "2024-01-15T20:00")
 * @returns Formatted date string in Spanish or English with timezone
 */
export const formatTournamentDate = (dateStr: string) => {
  if (!dateStr) return "";
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return dateStr;

  const [_, year, month, day, hour, min] = match;

  const lang = i18n.language || "es";

  if (lang.startsWith("en")) {
    const monthsEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthsEn[parseInt(month, 10) - 1];
    return `${monthName} ${parseInt(day, 10)}, ${year} at ${hour}:${min} (GMT-3)`;
  }

  const monthsEs = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const monthName = monthsEs[parseInt(month, 10) - 1];

  return `${parseInt(day, 10)} de ${monthName} de ${year} a las ${hour}:${min}hs (GMT-3)`;
};

/**
 * Normalizes a prize value (possibly double-encoded JSON) into a clean string array.
 * @param prizes - Raw prize data from the database (string, array, or nested JSON)
 * @returns Normalized array of prize strings
 */
export const normalizeTournamentPrizes = (prizes: unknown): string[] => {
  if (typeof prizes === "string") {
    const trimmed = prizes.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return normalizeTournamentPrizes(parsed);
        }
      } catch (e) {}
    }
  }

  if (Array.isArray(prizes)) {
    if (prizes.length === 1 && typeof prizes[0] === "string") {
      const trimmed = prizes[0].trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return normalizeTournamentPrizes(parsed);
          }
        } catch (e) {}
      }
    }

    const normalized = prizes
      .map((prize) => String(prize).trim())
      .filter(Boolean);
    return normalized.length > 0 ? normalized : [""];
  }

  if (typeof prizes === "string" && prizes.trim()) {
    return [prizes.trim()];
  }

  return [""];
};

/**
 * Formats an array of prizes into a single display string (e.g. "1º Gold · 2º Silver").
 * @param prizes - Array of prize description strings
 */
export const formatTournamentPrizes = (prizes: string[]) => {
  if (!prizes.length) return "";

  return prizes.map((prize, index) => `${index + 1}º ${prize}`).join(" · ");
};
