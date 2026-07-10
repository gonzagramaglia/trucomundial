/** Month name to index map for Spanish date parsing. */
const months: Record<string, number> = {
  "enero": 0, "febrero": 1, "marzo": 2, "abril": 3, "mayo": 4, "junio": 5,
  "julio": 6, "agosto": 7, "septiembre": 8, "octubre": 9, "noviembre": 10, "diciembre": 11
};

/**
 * Parses a Spanish date/time string pair into a UTC Date object.
 * Assumes the time is in UTC-3 (Argentina).
 */
function parseMatchDate(dateStr: string, timeStr: string): Date | null {
  const dateParts = dateStr.split(" ");
  if (dateParts.length < 4) return null;

  const day = parseInt(dateParts[1]);
  const monthStr = dateParts[3].toLowerCase();
  const month = months[monthStr];

  if (isNaN(day) || month === undefined) return null;

  const timeParts = timeStr.split(" ");
  let hour = 0;
  let min = 0;

  if (timeStr.includes("hs")) {
    const [h, m] = timeParts[0].split(":");
    hour = parseInt(h);
    min = parseInt(m || "0");
  } else {
    const [h, m] = timeParts[0].split(":");
    hour = parseInt(h);
    min = parseInt(m);
    const ampm = timeParts[1]?.toLowerCase() + " " + timeParts[2]?.toLowerCase();
    if (ampm.includes("p. m.") && hour < 12) hour += 12;
    if (ampm.includes("a. m.") && hour === 12) hour = 0;
  }

  return new Date(Date.UTC(2026, month, day, hour + 3, min, 0));
}

/** Returns true if a match has already started based on its date/time or status. */
export const isMatchStarted = (dateStr: string, timeStr: string, matchStatus: string): boolean => {
  if (matchStatus === 'live' || matchStatus === 'finished') return true;
  const matchDate = parseMatchDate(dateStr, timeStr);
  return matchDate ? new Date() >= matchDate : false;
};

/** Returns true if a match is likely finished (2 hours after kickoff). */
export const isMatchFinishedAuto = (dateStr: string, timeStr: string): boolean => {
  const matchDate = parseMatchDate(dateStr, timeStr);
  if (!matchDate) return false;
  const finishedDate = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);
  return new Date() >= finishedDate;
};

/** Formats a Spanish date/time pair into the user's local timezone. */
export const formatMatchTime = (dateStr: string, timeStr: string, language: string = 'es') => {
  const matchDate = parseMatchDate(dateStr, timeStr);
  if (!matchDate) return { localDate: dateStr, localTime: timeStr };

  const localeStr = language === 'en' ? 'en-US' : 'es-ES';
  let localDateStr = matchDate.toLocaleDateString(localeStr, { weekday: 'short', day: 'numeric', month: 'short' });
  localDateStr = localDateStr.charAt(0).toUpperCase() + localDateStr.slice(1).replace('.', ',');
  const localTimeSuffix = language === 'en' ? '' : ' hs';
  const localTimeStr = matchDate.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' }) + localTimeSuffix;

  return { localDate: localDateStr, localTime: localTimeStr };
};
