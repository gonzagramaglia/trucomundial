import i18n from "./i18n";

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

export const formatTournamentPrizes = (prizes: string[]) => {
  if (!prizes.length) return "";

  return prizes.map((prize, index) => `${index + 1}º ${prize}`).join(" · ");
};
