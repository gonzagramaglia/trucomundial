const fs = require('fs');

const items = [
  { id: 'Argelia', code: 'ALG', flag: '🇩🇿' },
  { id: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  { id: 'Austria', code: 'AUT', flag: '🇦🇹' },
  { id: 'Bosnia y Herz', code: 'BIH', flag: '🇧🇦' },
  { id: 'Brasil', code: 'BRA', flag: '🇧🇷' },
  { id: 'Canadá', code: 'CAN', flag: '🇨🇦' },
  { id: 'Colombia', code: 'COL', flag: '🇨🇴' },
  { id: 'Corea del Sur', code: 'KOR', flag: '🇰🇷' },
  { id: 'Croacia', code: 'CRO', flag: '🇭🇷' },
  { id: 'Ecuador', code: 'ECU', flag: '🇪🇨' },
  { id: 'España', code: 'ESP', flag: '🇪🇸' },
  { id: 'Francia', code: 'FRA', flag: '🇫🇷' },
  { id: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'Japón', code: 'JPN', flag: '🇯🇵' },
  { id: 'Marruecos', code: 'MAR', flag: '🇲🇦' },
  { id: 'México', code: 'MEX', flag: '🇲🇽' },
  { id: 'Noruega', code: 'NOR', flag: '🇳🇴' },
  { id: 'Nueva Zelanda', code: 'NZL', flag: '🇳🇿' },
  { id: 'Países Bajos', code: 'NED', flag: '🇳🇱' },
  { id: 'Panamá', code: 'PAN', flag: '🇵🇦' },
  { id: 'Paraguay', code: 'PAR', flag: '🇵🇾' },
  { id: 'Portugal', code: 'POR', flag: '🇵🇹' },
  { id: 'Qatar', code: 'QAT', flag: '🇶🇦' },
  { id: 'República Checa', code: 'CZE', flag: '🇨🇿' },
  { id: 'Sudáfrica', code: 'RSA', flag: '🇿🇦' },
  { id: 'Suiza', code: 'SUI', flag: '🇨🇭' },
  { id: 'Uruguay', code: 'URU', flag: '🇺🇾' },
  { id: 'USA', code: 'USA', flag: '🇺🇸' }
];

const stringArray1 = JSON.stringify(items.map(i => i.id));

function processFile(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');

  // Replace array of objects (format 1: id, code, flag)
  const pattern1 = /\{\s*id:\s*'Argentina',\s*code:\s*'ARG',\s*flag:\s*'🇦🇷'\s*\}[\s\S]*?\{\s*id:\s*'Qatar',\s*code:\s*'QAT',\s*flag:\s*'🇶🇦'\s*\}/g;
  content = content.replace(pattern1, items.map(i => `{ id: '${i.id}', code: '${i.code}', flag: '${i.flag}' }`).join(',\n              '));

  // Replace array of objects (format 2: id, flag, code)
  const pattern2 = /\{\s*id:\s*'Argentina',\s*flag:\s*'🇦🇷',\s*code:\s*'ARG'\s*\}[\s\S]*?\{\s*id:\s*'Qatar',\s*flag:\s*'🇶🇦',\s*code:\s*'QAT'\s*\}/g;
  content = content.replace(pattern2, items.map(i => `{ id: '${i.id}', flag: '${i.flag}', code: '${i.code}' }`).join(',\n                  '));

  // Replace object mapping
  const pattern3 = /'Argentina':\s*'🇦🇷',[\s\S]*?'Qatar':\s*'🇶🇦',/g;
  content = content.replace(pattern3, items.map(i => `'${i.id}': '${i.flag}',`).join('\n  '));

  const pattern4 = /"Argentina":\s*"🇦🇷",[\s\S]*?"Qatar":\s*"🇶🇦",/g;
  content = content.replace(pattern4, items.map(i => `"${i.id}": "${i.flag}",`).join('\n  '));

  // Replace string arrays
  // ["Argentina", "Francia", ... "Qatar", "Marruecos"]
  // Need to be careful here to match exactly the lists we had
  const oldArrayMatch = /\["Argentina",\s*"Francia"[\s\S]*?"Marruecos"\]/g;
  content = content.replace(oldArrayMatch, stringArray1);
  
  const oldArrayMatch2 = /\["Argelia",\s*"Argentina"[\s\S]*?"USA"\]/g;
  content = content.replace(oldArrayMatch2, stringArray1);

  fs.writeFileSync(path, content);
}

[
  'src/components/twitch/TwitchApp.tsx',
  'src/components/landing/RankingScreen.tsx',
  'src/components/landing/tournaments/TournamentDetails.tsx',
  'src/components/landing/DeckScreen.tsx',
  'src/components/landing/LandingPage.tsx',
  'src/components/admin/UserStarsModal.tsx',
  'src/components/admin/TournamentFormModal.tsx'
].forEach(processFile);
