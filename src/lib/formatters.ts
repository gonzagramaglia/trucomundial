export const formatTournamentDate = (dateStr: string) => {
  if (!dateStr) return "";
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return dateStr;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, year, month, day, hour, min] = match;

  const months = [
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
  const monthName = months[parseInt(month, 10) - 1];

  return `${parseInt(day, 10)} de ${monthName} de ${year} a las ${hour}:${min}hs (GMT-3)`;
};

export const normalizeTournamentPrizes = (prizes: unknown): string[] => {
  if (Array.isArray(prizes)) {
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
