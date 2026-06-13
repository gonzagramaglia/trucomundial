const fs = require('fs');

const items = [
  { id: 'Argelia', code: 'ALG', flag: '🇩🇿' },
  { id: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  { id: 'Austria', code: 'AUT', flag: '🇦🇹' },
  { id: 'Bosnia y Herz', code: 'BIH', flag: '🇧🇦' },
  { id: 'Brasil', code: 'BRA', flag: '🇧🇷' },
  { id: 'Canadá', code: 'CAN', flag: '🇨🇦' },
  { id: 'Colombia', code: 'COL', flag: '🇨🇴' },
  { id: 'Croacia', code: 'CRO', flag: '🇭🇷' },
  { id: 'República Checa', code: 'CZE', flag: '🇨🇿' },
  { id: 'Ecuador', code: 'ECU', flag: '🇪🇨' },
  { id: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'España', code: 'ESP', flag: '🇪🇸' },
  { id: 'Francia', code: 'FRA', flag: '🇫🇷' },
  { id: 'Japón', code: 'JPN', flag: '🇯🇵' },
  { id: 'Corea del Sur', code: 'KOR', flag: '🇰🇷' },
  { id: 'Marruecos', code: 'MAR', flag: '🇲🇦' },
  { id: 'México', code: 'MEX', flag: '🇲🇽' },
  { id: 'Países Bajos', code: 'NED', flag: '🇳🇱' },
  { id: 'Noruega', code: 'NOR', flag: '🇳🇴' },
  { id: 'Nueva Zelanda', code: 'NZL', flag: '🇳🇿' },
  { id: 'Panamá', code: 'PAN', flag: '🇵🇦' },
  { id: 'Paraguay', code: 'PAR', flag: '🇵🇾' },
  { id: 'Portugal', code: 'POR', flag: '🇵🇹' },
  { id: 'Qatar', code: 'QAT', flag: '🇶🇦' },
  { id: 'Sudáfrica', code: 'RSA', flag: '🇿🇦' },
  { id: 'Suiza', code: 'SUI', flag: '🇨🇭' },
  { id: 'Uruguay', code: 'URU', flag: '🇺🇾' },
  { id: 'USA', code: 'USA', flag: '🇺🇸' }
];

items.sort((a, b) => a.code.localeCompare(b.code));

const stringArray1 = JSON.stringify(items.map(i => i.id));

function processFile(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');

  // Format 1: { id, code, flag }
  const pattern1 = /\{\s*id:\s*'Argelia',\s*code:\s*'ALG',\s*flag:\s*'🇩🇿'\s*\}[\s\S]*?\{\s*id:\s*'USA',\s*code:\s*'USA',\s*flag:\s*'🇺🇸'\s*\}/g;
  content = content.replace(pattern1, items.map(i => `{ id: '${i.id}', code: '${i.code}', flag: '${i.flag}' }`).join(',\n              '));

  // Format 2: { id, flag, code }
  const pattern2 = /\{\s*id:\s*'Argelia',\s*flag:\s*'🇩🇿',\s*code:\s*'ALG'\s*\}[\s\S]*?\{\s*id:\s*'USA',\s*flag:\s*'🇺🇸',\s*code:\s*'USA'\s*\}/g;
  content = content.replace(pattern2, items.map(i => `{ id: '${i.id}', flag: '${i.flag}', code: '${i.code}' }`).join(',\n                  '));

  // Format 3: object mapping (flags.ts, etc) -> we'll skip this if we just want arrays to change, but let's change it too
  const pattern3 = /'Argelia':\s*'🇩🇿',[\s\S]*?'USA':\s*'🇺🇸',/g;
  content = content.replace(pattern3, items.map(i => `'${i.id}': '${i.flag}',`).join('\n  '));

  const pattern4 = /"Argelia":\s*"🇩🇿",[\s\S]*?"USA":\s*"🇺🇸",/g;
  content = content.replace(pattern4, items.map(i => `"${i.id}": "${i.flag}",`).join('\n  '));

  // Format 5: string arrays
  // ["Argelia", "Argentina", ... "USA"]
  const oldArrayMatch2 = /\["Argelia",\s*"Argentina"[\s\S]*?"USA"\]/g;
  content = content.replace(oldArrayMatch2, stringArray1);

  fs.writeFileSync(path, content);
}

[
  'src/data/flags.ts',
  'src/components/twitch/TwitchApp.tsx',
  'src/components/landing/RankingScreen.tsx',
  'src/components/landing/tournaments/TournamentDetails.tsx',
  'src/components/landing/DeckScreen.tsx',
  'src/components/landing/LandingPage.tsx',
  'src/components/admin/UserStarsModal.tsx',
  'src/components/admin/TournamentFormModal.tsx'
].forEach(processFile);
