export interface Card {
  id: string;
  name: string;
  power: number; // For hierarchy comparison (RANK)
  env: number; // For Envido (ENV)
  image: string;
  country: string;
  club: string;
  stickerNumber: string;
}


export const CARDS: Card[] = [
  // Top Tier
  { id: 'messi', name: 'MESSI', power: 44, env: 10, country: 'Argentina', club: 'Inter Miami', image: '/stickers/argentina/figu-de-messi.png', stickerNumber: 'ARG 9' },
  { id: 'mbappe', name: 'MBAPPÉ', power: 43, env: 10, country: 'Francia', club: 'Real Madrid', image: '/stickers/france/figu-de-mbappe.png', stickerNumber: 'FRA 8' },
  { id: 'rodri', name: 'RODRI', power: 42, env: 16, country: 'España', club: 'Manchester City', image: '/stickers/spain/figu-de-rodri-16.jpeg', stickerNumber: 'ESP 6' },
  { id: 'yamal', name: 'LAMINE YAMAL', power: 41, env: 19, country: 'España', club: 'Barcelona', image: '/stickers/spain/figu-de-lamine-yamal-19.png', stickerNumber: 'ESP 9' },
  { id: 'julian', name: 'JULIÁN Á.', power: 40, env: 9, country: 'Argentina', club: 'Atlético Madrid', image: '/stickers/argentina/figu-de-julian-alvarez.png', stickerNumber: 'ARG 8' },
  { id: 'lautaro', name: 'TORO M.', power: 39, env: 22, country: 'Argentina', club: 'Inter Milan', image: '/stickers/argentina/figu-del-toro-martinez.png', stickerNumber: 'ARG 11' },
  { id: 'pedri', name: 'PEDRI', power: 38, env: 20, country: 'España', club: 'Barcelona', image: '/stickers/spain/figu-de-pedri-20.jpeg', stickerNumber: 'ESP 8' },
  { id: 'nico_williams', name: 'NICO WILLIAMS', power: 37, env: 11, country: 'España', club: 'Athletic Club', image: '/stickers/spain/figu-de-nico-williams-11.png', stickerNumber: 'ESP 10' },
  { id: 'dibu', name: 'DIBU MARTÍNEZ', power: 36, env: 23, country: 'Argentina', club: 'Aston Villa', image: '/stickers/argentina/figu-del-dibu.png', stickerNumber: 'ARG 1' },
  { id: 'dembele', name: 'DEMBÉLÉ', power: 35, env: 11, country: 'Francia', club: 'PSG', image: '/stickers/france/figu-de-dembele.png', stickerNumber: 'FRA 7' },
  { id: 'enzo', name: 'ENZO F.', power: 34, env: 24, country: 'Argentina', club: 'Chelsea', image: '/stickers/argentina/figu-de-enzo-fernandez.png', stickerNumber: 'ARG 5' },
  { id: 'fabian_ruiz', name: 'FABIÁN RUIZ', power: 33, env: 8, country: 'España', club: 'PSG', image: '/stickers/spain/figu-de-fabian-ruiz-8.jpeg', stickerNumber: 'ESP 7' },
  { id: 'depaul', name: 'DE PAUL', power: 32, env: 7, country: 'Argentina', club: 'Atlético Madrid', image: '/stickers/argentina/figu-de-de-paul.png', stickerNumber: 'ARG 7' },
  { id: 'macallister', name: 'MAC ALLISTER', power: 31, env: 20, country: 'Argentina', club: 'Liverpool', image: '/stickers/argentina/figu-de-mac-allister.png', stickerNumber: 'ARG 6' },
  { id: 'oyarzabal', name: 'OYARZABAL', power: 30, env: 21, country: 'España', club: 'Real Sociedad', image: '/stickers/spain/figu-de-mikel-oyarzabal-21.png', stickerNumber: 'ESP 11' },
  { id: 'romero', name: 'CUTI ROMERO', power: 29, env: 13, country: 'Argentina', club: 'Tottenham', image: '/stickers/argentina/figu-del-cuti.png', stickerNumber: 'ARG 3' },
  { id: 'zubimendi', name: 'ZUBIMENDI', power: 28, env: 18, country: 'España', club: 'Real Sociedad', image: '/stickers/spain/figu-de-martin-zubimendi-18.jpeg', stickerNumber: 'ESP 5' },
  { id: 'otamendi', name: 'OTAMENDI', power: 27, env: 19, country: 'Argentina', club: 'Benfica', image: '/stickers/argentina/figu-de-otamendi.png', stickerNumber: 'ARG 4' },
  { id: 'cucurella', name: 'CUCURELLA', power: 26, env: 24, country: 'España', club: 'Chelsea', image: '/stickers/spain/figu-de-marc-cucurella-24.jpeg', stickerNumber: 'ESP 3' },
  { id: 'molina', name: 'NAHUEL M.', power: 25, env: 26, country: 'Argentina', club: 'Atlético Madrid', image: '/stickers/argentina/figu-de-nahuel-molina.png', stickerNumber: 'ARG 2' },
  { id: 'le_normand', name: 'LE NORMAND', power: 24, env: 3, country: 'España', club: 'Atlético Madrid', image: '/stickers/spain/figu-de-robin-le-normand-3.jpeg', stickerNumber: 'ESP 2' },
  { id: 'unai_simon', name: 'UNAI SIMÓN', power: 23, env: 23, country: 'España', club: 'Athletic Club', image: '/stickers/spain/figu-de-unai-simon-23.jpeg', stickerNumber: 'ESP 1' },
  { id: 'simeone', name: 'G. SIMEONE', power: 22, env: 18, country: 'Argentina', club: 'Atlético Madrid', image: '/stickers/argentina/figu-de-giuliano-simeone.png', stickerNumber: 'ARG 10' },
  { id: 'maignan', name: 'MIKE MAIGNAN', power: 21, env: 16, country: 'Francia', club: 'AC Milan', image: '/stickers/france/figu-de-maignan.png', stickerNumber: 'FRA 1' },
  { id: 'upamecano', name: 'UPAMECANO', power: 20, env: 18, country: 'Francia', club: 'Bayern Munich', image: '/stickers/france/figu-de-upamecano.png', stickerNumber: 'FRA 4' },
  { id: 'saliba', name: 'SALIBA', power: 19, env: 4, country: 'Francia', club: 'Arsenal', image: '/stickers/france/figu-de-saliba.png', stickerNumber: 'FRA 2' },
  { id: 'theo', name: 'HERNÁNDEZ', power: 18, env: 22, country: 'Francia', club: 'AC Milan', image: '/stickers/france/figu-de-hernandez.png', stickerNumber: 'FRA 4' },
  { id: 'tchouameni', name: 'TCHOUAMÉNI', power: 17, env: 18, country: 'Francia', club: 'Real Madrid', image: '/stickers/france/figu-de-tchouameni.png', stickerNumber: 'FRA 5' },
  { id: 'camavinga', name: 'CAMAVINGA', power: 16, env: 6, country: 'Francia', club: 'Real Madrid', image: '/stickers/france/figu-de-camavigna.png', stickerNumber: 'FRA 6' },
  { id: 'huijsen', name: 'DEAN HUIJSEN', power: 15, env: 12, country: 'España', club: 'Bournemouth', image: '/stickers/spain/figu-de-dean-huijsen-12.jpeg', stickerNumber: 'ESP 4' },
  { id: 'barcola', name: 'BARCOLA', power: 14, env: 25, country: 'Francia', club: 'PSG', image: '/stickers/france/figu-de-barcola.png', stickerNumber: 'FRA 9' },
  { id: 'chris_wood', name: 'CHRIS WOOD', power: 13, env: 9, country: 'Nueva Zelanda', club: 'Nottingham Forest', image: '/stickers/new-zealand/figu-de-chris-wood-9.jpeg', stickerNumber: 'NZL 11' },
  { id: 'sarpreet_singh', name: 'SARPREET SINGH', power: 12, env: 10, country: 'Nueva Zelanda', club: 'TSC', image: '/stickers/new-zealand/figu-de-sarpreet-singh-10.jpeg', stickerNumber: 'NZL 9' },
  { id: 'marko_stamenic', name: 'MARKO STAMENIC', power: 11, env: 8, country: 'Nueva Zelanda', club: 'Swansea City', image: '/stickers/new-zealand/figu-de-marko-stamenic-8.jpeg', stickerNumber: 'NZL 7' },
  { id: 'liberato_cacace', name: 'LIBERATO CACACE', power: 10, env: 13, country: 'Nueva Zelanda', club: 'Empoli', image: '/stickers/new-zealand/figu-de-liberato-cacace-13.jpeg', stickerNumber: 'NZL 5' },
  { id: 'matt_garbett', name: 'MATT GARBETT', power: 9, env: 7, country: 'Nueva Zelanda', club: 'NAC Breda', image: '/stickers/new-zealand/figu-de-matt-garbett-7.jpeg', stickerNumber: 'NZL 8' },
  { id: 'joe_bell', name: 'JOE BELL', power: 8, env: 6, country: 'Nueva Zelanda', club: 'Viking FK', image: '/stickers/new-zealand/figu-de-joe-bell-6.jpg', stickerNumber: 'NZL 6' },
  { id: 'elijah_just', name: 'ELIJAH JUST', power: 7, env: 21, country: 'Nueva Zelanda', club: 'Motherwell', image: '/stickers/new-zealand/figu-de-elijah-just-21.jpeg', stickerNumber: 'NZL 10' },
  { id: 'finn_surman', name: 'FINN SURMAN', power: 6, env: 5, country: 'Nueva Zelanda', club: 'Portland Timbers', image: '/stickers/new-zealand/figu-de-finn-surman-5.jpg', stickerNumber: 'NZL 3' },
  { id: 'michael_boxall', name: 'MICHAEL BOXALL', power: 5, env: 4, country: 'Nueva Zelanda', club: 'Minnesota United', image: '/stickers/new-zealand/figu-de-michael-boxall-4.jpeg', stickerNumber: 'NZL 4' },
  { id: 'tim_payne', name: 'TIM PAYNE', power: 4, env: 2, country: 'Nueva Zelanda', club: 'Wellington Phoenix', image: '/stickers/new-zealand/figu-de-tim-payne-2.png', stickerNumber: 'NZL 2' },
  { id: 'max_crocombe', name: 'MAX CROCOMBE', power: 3, env: 1, country: 'Nueva Zelanda', club: 'Burton Albion', image: '/stickers/new-zealand/figu-de-max-crocombe-1.png', stickerNumber: 'NZL 1' },
  { id: 'doue', name: 'DÉSIRÉ DOUÉ', power: 2, env: 28, country: 'Francia', club: 'PSG', image: '/stickers/france/figu-de-doue.png', stickerNumber: 'FRA 10' },
  { id: 'ekitike', name: 'HUGO EKITIKÉ', power: 1, env: 16, country: 'Francia', club: 'Eintracht Frankfurt', image: '/stickers/france/figu-de-ekitike.png', stickerNumber: 'FRA 11' },
];

