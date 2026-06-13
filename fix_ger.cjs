const fs = require('fs');

const arraysFiles = [
  'src/components/twitch/TwitchApp.tsx',
  'src/components/landing/RankingScreen.tsx',
  'src/components/landing/DeckScreen.tsx',
  'src/components/landing/LandingPage.tsx'
];

arraysFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove the current Germany line at the top
  content = content.replace(/[\t ]*\{\s*id:\s*'Alemania',\s*(code:\s*'GER',\s*flag:\s*'🇩🇪'|flag:\s*'🇩🇪',\s*code:\s*'GER')\s*\},\n/g, "");
  // Insert it after Francia
  content = content.replace(
    /\{\s*id:\s*'Francia',\s*(code:\s*'FRA',\s*flag:\s*'🇫🇷'|flag:\s*'🇫🇷',\s*code:\s*'FRA')\s*\},/g,
    match => {
      if (match.includes("code: 'FRA'")) {
        return match + "\n              { id: 'Alemania', code: 'GER', flag: '🇩🇪' },";
      } else {
        return match + "\n                  { id: 'Alemania', flag: '🇩🇪', code: 'GER' },";
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
  content = content.replace(/[\t ]*'Alemania':\s*'🇩🇪',\n/g, "");
  content = content.replace(/[\t ]*"Alemania":\s*"🇩🇪",\n/g, "");
  content = content.replace(
    /'Francia':\s*'🇫🇷',/g,
    "'Francia': '🇫🇷',\n  'Alemania': '🇩🇪',"
  );
  content = content.replace(
    /"Francia":\s*"🇫🇷",/g,
    '"Francia": "🇫🇷",\n  "Alemania": "🇩🇪",'
  );
  fs.writeFileSync(file, content);
});

const formFiles = ['src/components/admin/TournamentFormModal.tsx'];
formFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"Alemania",/g, "");
  content = content.replace(/"Francia",/g, '"Francia","Alemania",');
  
  content = content.replace(/[\t ]*\{\s*id:\s*'Alemania',\s*(code:\s*'GER',\s*flag:\s*'🇩🇪'|flag:\s*'🇩🇪',\s*code:\s*'GER')\s*\},\n/g, "");
  content = content.replace(
    /\{\s*id:\s*'Francia',\s*(code:\s*'FRA',\s*flag:\s*'🇫🇷'|flag:\s*'🇫🇷',\s*code:\s*'FRA')\s*\},/g,
    match => match + "\n                  { id: 'Alemania', flag: '🇩🇪', code: 'GER' },"
  );
  
  // also LandingPage array
  fs.writeFileSync(file, content);
});

let landing = fs.readFileSync('src/components/landing/LandingPage.tsx', 'utf8');
landing = landing.replace(/"Alemania",/g, "");
landing = landing.replace(/"Francia",/g, '"Francia","Alemania",');
fs.writeFileSync('src/components/landing/LandingPage.tsx', landing);

