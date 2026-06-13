const fs = require('fs');

const belgiumCards = `  { id: 'courtois', name: 'T. COURTOIS', env: 1, country: 'Bélgica', club: 'Real Madrid', image: '/stickers/belgium/figu-de-thibaut-courtois-1.jpeg', stickerNumber: 'BEL 1' },
  { id: 'theate', name: 'A. THEATE', env: 3, country: 'Bélgica', club: 'Stade Rennais', image: '/stickers/belgium/figu-de-arthur-theate-3.jpeg', stickerNumber: 'BEL 3' },
  { id: 'decuyper', name: 'M. DE CUYPER', env: 5, country: 'Bélgica', club: 'Club Brugge', image: '/stickers/belgium/figu-de-maxim-de-cuyper-5.jpeg', stickerNumber: 'BEL 5' },
  { id: 'debruyne', name: 'K. DE BRUYNE', env: 7, country: 'Bélgica', club: 'Manchester City', image: '/stickers/belgium/figu-de-kevin-de-bruyne-7.jpg', stickerNumber: 'BEL 7' },
  { id: 'tielemans', name: 'Y. TIELEMANS', env: 8, country: 'Bélgica', club: 'Aston Villa', image: '/stickers/belgium/figu-de-youri-tielemans-8.jpeg', stickerNumber: 'BEL 8' },
  { id: 'lukaku', name: 'R. LUKAKU', env: 9, country: 'Bélgica', club: 'AS Roma', image: '/stickers/belgium/figu-de-romelu-lukaku-9.jpeg', stickerNumber: 'BEL 9' },
  { id: 'trossard', name: 'L. TROSSARD', env: 10, country: 'Bélgica', club: 'Arsenal', image: '/stickers/belgium/figu-de-leandro-trossard-10.jpeg', stickerNumber: 'BEL 10' },
  { id: 'doku', name: 'JÉREMY DOKU', env: 11, country: 'Bélgica', club: 'Manchester City', image: '/stickers/belgium/figu-de-jeremy-doku-11.jpeg', stickerNumber: 'BEL 11' },
  { id: 'deketelaere', name: 'DE KETELAERE', env: 17, country: 'Bélgica', club: 'Atalanta', image: '/stickers/belgium/figu-de-charles-de-ketelaere-17.jpeg', stickerNumber: 'BEL 17' },
  { id: 'castagne', name: 'T. CASTAGNE', env: 21, country: 'Bélgica', club: 'Fulham', image: '/stickers/belgium/figu-de-timothy-castagne-21.jpeg', stickerNumber: 'BEL 21' },
  { id: 'onana', name: 'AMADOU ONANA', env: 24, country: 'Bélgica', club: 'Everton', image: '/stickers/belgium/figu-de-amadou-onana-24.jpeg', stickerNumber: 'BEL 24' },`;

let cardsContent = fs.readFileSync('src/data/cards.ts', 'utf8');
cardsContent = cardsContent.replace("export const CARDS: Card[] = [", "export const CARDS: Card[] = [\n" + belgiumCards);
fs.writeFileSync('src/data/cards.ts', cardsContent);

const arraysFiles = [
  'src/components/twitch/TwitchApp.tsx',
  'src/components/landing/RankingScreen.tsx',
  'src/components/landing/DeckScreen.tsx',
  'src/components/landing/LandingPage.tsx'
];

arraysFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /\{\s*id:\s*'Bosnia y Herz',\s*(code:\s*'BIH',\s*flag:\s*'🇧🇦'|flag:\s*'🇧🇦',\s*code:\s*'BIH')\s*\}/g,
    match => {
      if (match.includes("code: 'BIH'")) {
        return "{ id: 'Bélgica', code: 'BEL', flag: '🇧🇪' },\n              " + match;
      } else {
        return "{ id: 'Bélgica', flag: '🇧🇪', code: 'BEL' },\n                  " + match;
      }
    }
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
  content = content.replace(
    /'Bosnia y Herz':\s*'🇧🇦'/g,
    "'Bélgica': '🇧🇪',\n  'Bosnia y Herz': '🇧🇦'"
  );
  content = content.replace(
    /"Bosnia y Herz":\s*"🇧🇦"/g,
    '"Bélgica": "🇧🇪",\n  "Bosnia y Herz": "🇧🇦"'
  );
  fs.writeFileSync(file, content);
});

const formFiles = ['src/components/admin/TournamentFormModal.tsx'];
formFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"Bosnia y Herz"/g, '"Bélgica","Bosnia y Herz"');
  
  content = content.replace(
    /\{\s*id:\s*'Bosnia y Herz',\s*(code:\s*'BIH',\s*flag:\s*'🇧🇦'|flag:\s*'🇧🇦',\s*code:\s*'BIH')\s*\}/g,
    match => "{ id: 'Bélgica', flag: '🇧🇪', code: 'BEL' },\n                  " + match
  );
  fs.writeFileSync(file, content);
});

let landing = fs.readFileSync('src/components/landing/LandingPage.tsx', 'utf8');
landing = landing.replace(/"Bosnia y Herz"/g, '"Bélgica","Bosnia y Herz"');
fs.writeFileSync('src/components/landing/LandingPage.tsx', landing);

