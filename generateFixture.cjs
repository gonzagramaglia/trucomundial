const fs = require('fs');

const flags = {
  "México": "🇲🇽", "Sudáfrica": "🇿🇦", "Corea del Sur": "🇰🇷", "República Checa": "🇨🇿",
  "Canadá": "🇨🇦", "Bosnia & Herzegovina": "🇧🇦", "Qatar": "🇶🇦", "Suiza": "🇨🇭",
  "Brasil": "🇧🇷", "Marruecos": "🇲🇦", "Haití": "🇭🇹", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Türkiye": "🇹🇷",
  "Alemania": "🇩🇪", "Curaçao": "🇨🇼", "Costa de Marfil": "🇨🇮", "Ecuador": "🇪🇨",
  "Países Bajos": "🇳🇱", "Japón": "🇯🇵", "Suecia": "🇸🇪", "Túnez": "🇹🇳",
  "Bélgica": "🇧🇪", "Egipto": "🇪🇬", "Irán": "🇮🇷", "Nueva Zelanda": "🇳🇿",
  "España": "🇪🇸", "Cabo Verde": "🇨🇻", "Arabia Saudita": "🇸🇦", "Uruguay": "🇺🇾",
  "Francia": "🇫🇷", "Senegal": "🇸🇳", "Irak": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argelia": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "Portugal": "🇵🇹", "DR Congo": "🇨🇩", "Uzbekistán": "🇺🇿", "Colombia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croacia": "🇭🇷", "Ghana": "🇬🇭", "Panamá": "🇵🇦"
};

const explicitMatches = [
  // 10 de junio
  { date: "miércoles, 10 de junio", time: "04:00 p. m.", group: "Group A", teamA: "México", teamB: "Sudáfrica" },
  // 11 de junio
  { date: "jueves, 11 de junio", time: "11:00 p. m.", group: "Group A", teamA: "Corea del Sur", teamB: "República Checa" },
  { date: "jueves, 11 de junio", time: "04:00 p. m.", group: "Group B", teamA: "Canadá", teamB: "Bosnia & Herzegovina" },
  // 12 de junio
  { date: "viernes, 12 de junio", time: "10:00 p. m.", group: "Group D", teamA: "Estados Unidos", teamB: "Paraguay" },
  { date: "viernes, 12 de junio", time: "04:00 p. m.", group: "Group B", teamA: "Qatar", teamB: "Suiza" },
  { date: "viernes, 12 de junio", time: "07:00 p. m.", group: "Group C", teamA: "Brasil", teamB: "Marruecos" },
  // 13 de junio
  { date: "sábado, 13 de junio", time: "10:00 p. m.", group: "Group C", teamA: "Haití", teamB: "Escocia" },
  { date: "sábado, 13 de junio", time: "01:00 a. m.", group: "Group D", teamA: "Australia", teamB: "Türkiye" },
  { date: "sábado, 13 de junio", time: "02:00 p. m.", group: "Group E", teamA: "Alemania", teamB: "Curaçao" },
  { date: "sábado, 13 de junio", time: "05:00 p. m.", group: "Group F", teamA: "Países Bajos", teamB: "Japón" },
  { date: "sábado, 13 de junio", time: "08:00 p. m.", group: "Group E", teamA: "Costa de Marfil", teamB: "Ecuador" },
  // 14 de junio
  { date: "domingo, 14 de junio", time: "11:00 p. m.", group: "Group F", teamA: "Suecia", teamB: "Túnez" },
  { date: "domingo, 14 de junio", time: "01:00 p. m.", group: "Group H", teamA: "España", teamB: "Cabo Verde" },
  { date: "domingo, 14 de junio", time: "04:00 p. m.", group: "Group G", teamA: "Bélgica", teamB: "Egipto" },
  { date: "domingo, 14 de junio", time: "07:00 p. m.", group: "Group H", teamA: "Arabia Saudita", teamB: "Uruguay" },
  // 15 de junio
  { date: "lunes, 15 de junio", time: "10:00 p. m.", group: "Group G", teamA: "Irán", teamB: "Nueva Zelanda" },
  { date: "lunes, 15 de junio", time: "04:00 p. m.", group: "Group I", teamA: "Francia", teamB: "Senegal" },
  { date: "lunes, 15 de junio", time: "07:00 p. m.", group: "Group I", teamA: "Irak", teamB: "Noruega" },
  // 16 de junio
  { date: "martes, 16 de junio", time: "10:00 p. m.", group: "Group J", teamA: "Argentina", teamB: "Argelia" },
  { date: "martes, 16 de junio", time: "01:00 a. m.", group: "Group J", teamA: "Austria", teamB: "Jordania" },
  { date: "martes, 16 de junio", time: "02:00 p. m.", group: "Group K", teamA: "Portugal", teamB: "DR Congo" },
  { date: "martes, 16 de junio", time: "05:00 p. m.", group: "Group L", teamA: "Inglaterra", teamB: "Croacia" },
  { date: "martes, 16 de junio", time: "08:00 p. m.", group: "Group L", teamA: "Ghana", teamB: "Panamá" },
  // 17 de junio
  { date: "miércoles, 17 de junio", time: "11:00 p. m.", group: "Group K", teamA: "Uzbekistán", teamB: "Colombia" },
  { date: "miércoles, 17 de junio", time: "01:00 p. m.", group: "Group A", teamA: "República Checa", teamB: "Sudáfrica" },
  { date: "miércoles, 17 de junio", time: "04:00 p. m.", group: "Group B", teamA: "Suiza", teamB: "Bosnia & Herzegovina" },
  { date: "miércoles, 17 de junio", time: "07:00 p. m.", group: "Group B", teamA: "Canadá", teamB: "Qatar" },
  // 18 de junio
  { date: "jueves, 18 de junio", time: "10:00 p. m.", group: "Group A", teamA: "México", teamB: "Corea del Sur" },
  { date: "jueves, 18 de junio", time: "04:00 p. m.", group: "Group D", teamA: "Estados Unidos", teamB: "Australia" },
  { date: "jueves, 18 de junio", time: "07:00 p. m.", group: "Group C", teamA: "Escocia", teamB: "Marruecos" },
  // 19 de junio
  { date: "viernes, 19 de junio", time: "09:30 p. m.", group: "Group C", teamA: "Brasil", teamB: "Haití" },
  { date: "viernes, 19 de junio", time: "12:00 a. m.", group: "Group D", teamA: "Türkiye", teamB: "Paraguay" },
  { date: "viernes, 19 de junio", time: "02:00 p. m.", group: "Group F", teamA: "Países Bajos", teamB: "Suecia" },
  { date: "viernes, 19 de junio", time: "05:00 p. m.", group: "Group E", teamA: "Alemania", teamB: "Costa de Marfil" },
  // 20 de junio
  { date: "sábado, 20 de junio", time: "09:00 p. m.", group: "Group E", teamA: "Ecuador", teamB: "Curaçao" },
  { date: "sábado, 20 de junio", time: "01:00 a. m.", group: "Group F", teamA: "Túnez", teamB: "Japón" },
  { date: "sábado, 20 de junio", time: "01:00 p. m.", group: "Group H", teamA: "España", teamB: "Arabia Saudita" },
  { date: "sábado, 20 de junio", time: "04:00 p. m.", group: "Group G", teamA: "Bélgica", teamB: "Irán" },
  { date: "sábado, 20 de junio", time: "07:00 p. m.", group: "Group H", teamA: "Uruguay", teamB: "Cabo Verde" },
  // 21 de junio
  { date: "domingo, 21 de junio", time: "10:00 p. m.", group: "Group G", teamA: "Nueva Zelanda", teamB: "Egipto" },
  { date: "domingo, 21 de junio", time: "02:00 p. m.", group: "Group J", teamA: "Argentina", teamB: "Austria" },
  { date: "domingo, 21 de junio", time: "06:00 p. m.", group: "Group I", teamA: "Francia", teamB: "Irak" },
  // 22 de junio
  { date: "lunes, 22 de junio", time: "09:00 p. m.", group: "Group I", teamA: "Noruega", teamB: "Senegal" },
  { date: "lunes, 22 de junio", time: "12:00 a. m.", group: "Group J", teamA: "Jordania", teamB: "Argelia" },
  { date: "lunes, 22 de junio", time: "02:00 p. m.", group: "Group K", teamA: "Portugal", teamB: "Uzbekistán" },
  { date: "lunes, 22 de junio", time: "05:00 p. m.", group: "Group L", teamA: "Inglaterra", teamB: "Ghana" },
  { date: "lunes, 22 de junio", time: "08:00 p. m.", group: "Group L", teamA: "Panamá", teamB: "Croacia" },
  // 23 de junio
  { date: "martes, 23 de junio", time: "11:00 p. m.", group: "Group K", teamA: "Colombia", teamB: "DR Congo" },
  { date: "martes, 23 de junio", time: "04:00 p. m.", group: "Group B", teamA: "Bosnia & Herzegovina", teamB: "Qatar" },
  { date: "martes, 23 de junio", time: "04:00 p. m.", group: "Group B", teamA: "Suiza", teamB: "Canadá" },
  { date: "martes, 23 de junio", time: "07:00 p. m.", group: "Group C", teamA: "Marruecos", teamB: "Haití" },
  { date: "martes, 23 de junio", time: "07:00 p. m.", group: "Group C", teamA: "Escocia", teamB: "Brasil" },
  // 24 de junio
  { date: "miércoles, 24 de junio", time: "10:00 p. m.", group: "Group A", teamA: "República Checa", teamB: "México" },
  { date: "miércoles, 24 de junio", time: "10:00 p. m.", group: "Group A", teamA: "Sudáfrica", teamB: "Corea del Sur" },
  { date: "miércoles, 24 de junio", time: "05:00 p. m.", group: "Group E", teamA: "Curaçao", teamB: "Costa de Marfil" },
  { date: "miércoles, 24 de junio", time: "05:00 p. m.", group: "Group E", teamA: "Ecuador", teamB: "Alemania" },
  { date: "miércoles, 24 de junio", time: "08:00 p. m.", group: "Group F", teamA: "Japón", teamB: "Suecia" },
  { date: "miércoles, 24 de junio", time: "08:00 p. m.", group: "Group F", teamA: "Túnez", teamB: "Países Bajos" },
  // 25 de junio
  { date: "jueves, 25 de junio", time: "11:00 p. m.", group: "Group D", teamA: "Paraguay", teamB: "Australia" },
  { date: "jueves, 25 de junio", time: "11:00 p. m.", group: "Group D", teamA: "Türkiye", teamB: "Estados Unidos" },
  { date: "jueves, 25 de junio", time: "04:00 p. m.", group: "Group I", teamA: "Senegal", teamB: "Irak" },
  { date: "jueves, 25 de junio", time: "04:00 p. m.", group: "Group I", teamA: "Noruega", teamB: "Francia" },
  // 26 de junio
  { date: "viernes, 26 de junio", time: "09:00 p. m.", group: "Group H", teamA: "Uruguay", teamB: "España" },
  { date: "viernes, 26 de junio", time: "09:00 p. m.", group: "Group H", teamA: "Cabo Verde", teamB: "Arabia Saudita" },
  { date: "viernes, 26 de junio", time: "12:00 a. m.", group: "Group G", teamA: "Nueva Zelanda", teamB: "Bélgica" },
  { date: "viernes, 26 de junio", time: "12:00 a. m.", group: "Group G", teamA: "Egipto", teamB: "Irán" },
  { date: "viernes, 26 de junio", time: "06:00 p. m.", group: "Group L", teamA: "Croacia", teamB: "Ghana" },
  { date: "viernes, 26 de junio", time: "06:00 p. m.", group: "Group L", teamA: "Panamá", teamB: "Inglaterra" },
  { date: "viernes, 26 de junio", time: "08:30 p. m.", group: "Group K", teamA: "Colombia", teamB: "Portugal" },
  { date: "viernes, 26 de junio", time: "08:30 p. m.", group: "Group K", teamA: "DR Congo", teamB: "Uzbekistán" },
  // 27 de junio
  { date: "sábado, 27 de junio", time: "11:00 p. m.", group: "Group J", teamA: "Argelia", teamB: "Austria" },
  { date: "sábado, 27 de junio", time: "11:00 p. m.", group: "Group J", teamA: "Jordania", teamB: "Argentina" }
];

let idCounter = 1;
let matches = [];

for (const m of explicitMatches) {
  matches.push({
    id: String(idCounter++),
    ...m,
    flagA: flags[m.teamA] || "🏳️",
    flagB: flags[m.teamB] || "🏳️",
    status: "upcoming"
  });
}

const tsContent = `export interface FixtureMatch {
  id: string;
  date: string;
  time: string;
  group: string;
  teamA: string;
  flagA: string;
  teamB: string;
  flagB: string;
  status: 'upcoming' | 'live' | 'finished';
  scoreA?: number;
  scoreB?: number;
}

export const fixtureMatches: FixtureMatch[] = ${JSON.stringify(matches, null, 2)};
`;

fs.writeFileSync('src/lib/fixtureData.ts', tsContent);
console.log('Generated src/lib/fixtureData.ts with explicit matches (including June 27)');
