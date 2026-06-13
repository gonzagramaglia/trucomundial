const fs = require('fs');

const germanyCards = `  { id: 'ter_stegen', name: 'TER STEGEN', env: 1, country: 'Alemania', club: 'Barcelona', image: '/stickers/germany/figu-de-ter-stegen-1.jpeg', stickerNumber: 'GER 1' },
  { id: 'rudiger', name: 'A. RÜDIGER', env: 2, country: 'Alemania', club: 'Real Madrid', image: '/stickers/germany/figu-de-antonio-rudiger-2.jpeg', stickerNumber: 'GER 2' },
  { id: 'tah', name: 'JONATHAN TAH', env: 4, country: 'Alemania', club: 'Bayer Leverkusen', image: '/stickers/germany/figu-de-jonathan-tah-4.jpeg', stickerNumber: 'GER 4' },
  { id: 'kimmich', name: 'J. KIMMICH', env: 6, country: 'Alemania', club: 'Bayern Munich', image: '/stickers/germany/figu-de-joshua-kimmich-6.jpeg', stickerNumber: 'GER 6' },
  { id: 'havertz', name: 'KAI HAVERTZ', env: 7, country: 'Alemania', club: 'Arsenal', image: '/stickers/germany/figu-de-kai-havertz-7.jpeg', stickerNumber: 'GER 7' },
  { id: 'goretzka', name: 'L. GORETZKA', env: 8, country: 'Alemania', club: 'Bayern Munich', image: '/stickers/germany/figu-de-leon-goretzka-8.jpeg', stickerNumber: 'GER 8' },
  { id: 'musiala', name: 'J. MUSIALA', env: 10, country: 'Alemania', club: 'Bayern Munich', image: '/stickers/germany/figu-de-jamal-musiala-10.jpeg', stickerNumber: 'GER 10' },
  { id: 'woltemade', name: 'N. WOLTEMADE', env: 11, country: 'Alemania', club: 'Werder Bremen', image: '/stickers/germany/figu-de-nick-woltemade-11.jpeg', stickerNumber: 'GER 11' },
  { id: 'wirtz', name: 'FLORIAN WIRTZ', env: 17, country: 'Alemania', club: 'Bayer Leverkusen', image: '/stickers/germany/figu-de-florian-wirtz-17.jpeg', stickerNumber: 'GER 17' },
  { id: 'gnabry', name: 'SERGE GNABRY', env: 20, country: 'Alemania', club: 'Bayern Munich', image: '/stickers/germany/figu-de-serge-gnabry-20.jpeg', stickerNumber: 'GER 20' },
  { id: 'raum', name: 'DAVID RAUM', env: 22, country: 'Alemania', club: 'RB Leipzig', image: '/stickers/germany/figu-de-david-raum-22.jpeg', stickerNumber: 'GER 22' },`;

let cardsContent = fs.readFileSync('src/data/cards.ts', 'utf8');
cardsContent = cardsContent.replace("export const CARDS: Card[] = [", "export const CARDS: Card[] = [\n" + germanyCards);
fs.writeFileSync('src/data/cards.ts', cardsContent);

const filesWithArrays = [
  'src/components/twitch/TwitchApp.tsx',
  'src/components/landing/RankingScreen.tsx',
  'src/components/landing/DeckScreen.tsx',
  'src/components/landing/LandingPage.tsx'
];

filesWithArrays.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /\{\s*id:\s*'Argelia',\s*flag:\s*'🇩🇿',\s*code:\s*'ALG'\s*\}/g,
    "{ id: 'Alemania', flag: '🇩🇪', code: 'GER' },\n                  { id: 'Argelia', flag: '🇩🇿', code: 'ALG' }"
  );
  content = content.replace(
    /\{\s*id:\s*'Argelia',\s*code:\s*'ALG',\s*flag:\s*'🇩🇿'\s*\}/g,
    "{ id: 'Alemania', code: 'GER', flag: '🇩🇪' },\n              { id: 'Argelia', code: 'ALG', flag: '🇩🇿' }"
  );
  fs.writeFileSync(file, content);
});

// For forms that use string array:
const formFiles = ['src/components/admin/TournamentFormModal.tsx'];
formFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"Argelia"/g, '"Alemania","Argelia"');
  content = content.replace(
    /\{\s*id:\s*'Argelia',\s*flag:\s*'🇩🇿',\s*code:\s*'ALG'\s*\}/g,
    "{ id: 'Alemania', flag: '🇩🇪', code: 'GER' },\n                  { id: 'Argelia', flag: '🇩🇿', code: 'ALG' }"
  );
  fs.writeFileSync(file, content);
});

const dictFiles = [
  'src/data/flags.ts',
  'src/components/admin/UserStarsModal.tsx',
  'src/components/landing/tournaments/TournamentDetails.tsx'
];

dictFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/'Argelia':\s*'🇩🇿'/g, "'Alemania': '🇩🇪',\n  'Argelia': '🇩🇿'");
  content = content.replace(/"Argelia":\s*"🇩🇿"/g, '"Alemania": "🇩🇪",\n  "Argelia": "🇩🇿"');
  fs.writeFileSync(file, content);
});

