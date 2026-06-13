const fs = require('fs');

[
  'src/components/twitch/TwitchApp.tsx',
  'src/components/landing/RankingScreen.tsx',
  'src/components/landing/tournaments/TournamentDetails.tsx',
  'src/components/landing/DeckScreen.tsx',
  'src/components/landing/LandingPage.tsx',
  'src/components/admin/UserStarsModal.tsx',
  'src/components/admin/TournamentFormModal.tsx'
].forEach(path => {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');

  // Format 1
  content = content.replace(/\{\s*id:\s*'Sudáfrica',\s*code:\s*'RSA',\s*flag:\s*'🇿🇦'\s*\},\s*\{\s*id:\s*'Suiza',\s*code:\s*'SUI',\s*flag:\s*'🇨🇭'\s*\},\s*\{\s*id:\s*'Uruguay',\s*code:\s*'URU',\s*flag:\s*'🇺🇾'\s*\},\s*\{\s*id:\s*'USA',\s*code:\s*'USA',\s*flag:\s*'🇺🇸'\s*\}/g, "");
  // Format 2
  content = content.replace(/\{\s*id:\s*'Sudáfrica',\s*flag:\s*'🇿🇦',\s*code:\s*'RSA'\s*\},\s*\{\s*id:\s*'Suiza',\s*flag:\s*'🇨🇭',\s*code:\s*'SUI'\s*\},\s*\{\s*id:\s*'Uruguay',\s*flag:\s*'🇺🇾',\s*code:\s*'URU'\s*\},\s*\{\s*id:\s*'USA',\s*flag:\s*'🇺🇸',\s*code:\s*'USA'\s*\}/g, "");
  // Format 3 mapping
  content = content.replace(/'Sudáfrica':\s*'🇿🇦',\s*'Suiza':\s*'🇨🇭',\s*'Uruguay':\s*'🇺🇾',\s*'USA':\s*'🇺🇸'/g, "");
  content = content.replace(/"Sudáfrica":\s*"🇿🇦",\s*"Suiza":\s*"🇨🇭",\s*"Uruguay":\s*"🇺🇾",\s*"USA":\s*"🇺🇸"/g, "");

  // Wait, if it replaces ALL instances, it will delete the ONLY instance!
  // I must be careful!
});
