const fs = require('fs');

const swedenCards = `  { id: 'johansson', name: 'JOHANSSON', env: 12, country: 'Suecia', club: 'Stoke City', image: '/stickers/sweden/figu-de-johansson-12.jpeg', stickerNumber: 'SWE 12' },
  { id: 'holm', name: 'EMIL HOLM', env: 2, country: 'Suecia', club: 'Atalanta', image: '/stickers/sweden/figu-de-emil-holm-2.jpeg', stickerNumber: 'SWE 2' },
  { id: 'lindelof', name: 'V. LINDELÖF', env: 3, country: 'Suecia', club: 'Manchester United', image: '/stickers/sweden/figu-de-victor-nilsson-lindelof-3.jpeg', stickerNumber: 'SWE 3' },
  { id: 'hien', name: 'ISAK HIEN', env: 4, country: 'Suecia', club: 'Atalanta', image: '/stickers/sweden/figu-de-isak-hien-4.jpeg', stickerNumber: 'SWE 4' },
  { id: 'bergvall', name: 'L. BERGVALL', env: 7, country: 'Suecia', club: 'Tottenham', image: '/stickers/sweden/figu-de-lucas-bergvall-7.jpeg', stickerNumber: 'SWE 7' },
  { id: 'svensson', name: 'D. SVENSSON', env: 8, country: 'Suecia', club: 'FC Nordsjælland', image: '/stickers/sweden/figu-de-daniel-svensson-8.jpeg', stickerNumber: 'SWE 8' },
  { id: 'isak', name: 'ALEXANDER ISAK', env: 9, country: 'Suecia', club: 'Newcastle', image: '/stickers/sweden/figu-de-alexander-isak-9.jpeg', stickerNumber: 'SWE 9' },
  { id: 'elanga', name: 'A. ELANGA', env: 11, country: 'Suecia', club: 'Nottingham Forest', image: '/stickers/sweden/figu-de-anthony-elanga-11.jpg', stickerNumber: 'SWE 11' },
  { id: 'gyokeres', name: 'V. GYÖKERES', env: 17, country: 'Suecia', club: 'Sporting CP', image: '/stickers/sweden/figu-de-viktor-gyokeres-17.jpeg', stickerNumber: 'SWE 17' },
  { id: 'ayari', name: 'YASIN AYARI', env: 18, country: 'Suecia', club: 'Brighton', image: '/stickers/sweden/figu-de-yasin-ayari-18.jpeg', stickerNumber: 'SWE 18' },
  { id: 'kulusevski', name: 'D. KULUSEVSKI', env: 21, country: 'Suecia', club: 'Tottenham', image: '/stickers/sweden/figu-de-dejan-kulusevski-21.jpeg', stickerNumber: 'SWE 21' },`;

let cardsContent = fs.readFileSync('src/data/cards.ts', 'utf8');
cardsContent = cardsContent.replace("export const CARDS: Card[] = [", "export const CARDS: Card[] = [\n" + swedenCards);
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
    /\{\s*id:\s*'Uruguay',\s*(code:\s*'URU',\s*flag:\s*'🇺🇾'|flag:\s*'🇺🇾',\s*code:\s*'URU')\s*\}/g,
    match => {
      if (match.includes("code: 'URU'")) {
        return "{ id: 'Suecia', code: 'SWE', flag: '🇸🇪' },\n              " + match;
      } else {
        return "{ id: 'Suecia', flag: '🇸🇪', code: 'SWE' },\n                  " + match;
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
    /'Uruguay':\s*'🇺🇾'/g,
    "'Suecia': '🇸🇪',\n  'Uruguay': '🇺🇾'"
  );
  content = content.replace(
    /"Uruguay":\s*"🇺🇾"/g,
    '"Suecia": "🇸🇪",\n  "Uruguay": "🇺🇾"'
  );
  fs.writeFileSync(file, content);
});

const formFiles = ['src/components/admin/TournamentFormModal.tsx'];
formFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"Uruguay"/g, '"Suecia","Uruguay"');
  
  content = content.replace(
    /\{\s*id:\s*'Uruguay',\s*(code:\s*'URU',\s*flag:\s*'🇺🇾'|flag:\s*'🇺🇾',\s*code:\s*'URU')\s*\}/g,
    match => "{ id: 'Suecia', flag: '🇸🇪', code: 'SWE' },\n                  " + match
  );
  fs.writeFileSync(file, content);
});

let landing = fs.readFileSync('src/components/landing/LandingPage.tsx', 'utf8');
landing = landing.replace(/"Uruguay"/g, '"Suecia","Uruguay"');
fs.writeFileSync('src/components/landing/LandingPage.tsx', landing);

