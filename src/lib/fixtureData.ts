export interface FixtureMatch {
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

export const fixtureMatches: FixtureMatch[] = [
  {
    "id": "1",
    "date": "miércoles 10 de junio",
    "time": "04:00 p. m.",
    "group": "Group A",
    "teamA": "México",
    "teamB": "Sudáfrica",
    "flagA": "🇲🇽",
    "flagB": "🇿🇦",
    "status": "upcoming"
  },
  {
    "id": "2",
    "date": "jueves 11 de junio",
    "time": "11:00 p. m.",
    "group": "Group A",
    "teamA": "Corea del Sur",
    "teamB": "República Checa",
    "flagA": "🇰🇷",
    "flagB": "🇨🇿",
    "status": "upcoming"
  },
  {
    "id": "3",
    "date": "jueves 11 de junio",
    "time": "04:00 p. m.",
    "group": "Group B",
    "teamA": "Canadá",
    "teamB": "Bosnia & Herzegovina",
    "flagA": "🇨🇦",
    "flagB": "🇧🇦",
    "status": "upcoming"
  },
  {
    "id": "4",
    "date": "viernes 12 de junio",
    "time": "10:00 p. m.",
    "group": "Group D",
    "teamA": "Estados Unidos",
    "teamB": "Paraguay",
    "flagA": "🇺🇸",
    "flagB": "🇵🇾",
    "status": "upcoming"
  },
  {
    "id": "5",
    "date": "viernes 12 de junio",
    "time": "04:00 p. m.",
    "group": "Group B",
    "teamA": "Qatar",
    "teamB": "Suiza",
    "flagA": "🇶🇦",
    "flagB": "🇨🇭",
    "status": "upcoming"
  },
  {
    "id": "6",
    "date": "viernes 12 de junio",
    "time": "07:00 p. m.",
    "group": "Group C",
    "teamA": "Brasil",
    "teamB": "Marruecos",
    "flagA": "🇧🇷",
    "flagB": "🇲🇦",
    "status": "upcoming"
  },
  {
    "id": "7",
    "date": "sábado 13 de junio",
    "time": "10:00 p. m.",
    "group": "Group C",
    "teamA": "Haití",
    "teamB": "Escocia",
    "flagA": "🇭🇹",
    "flagB": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "status": "upcoming"
  },
  {
    "id": "8",
    "date": "sábado 13 de junio",
    "time": "01:00 a. m.",
    "group": "Group D",
    "teamA": "Australia",
    "teamB": "Türkiye",
    "flagA": "🇦🇺",
    "flagB": "🇹🇷",
    "status": "upcoming"
  },
  {
    "id": "9",
    "date": "sábado 13 de junio",
    "time": "02:00 p. m.",
    "group": "Group E",
    "teamA": "Alemania",
    "teamB": "Curaçao",
    "flagA": "🇩🇪",
    "flagB": "🇨🇼",
    "status": "upcoming"
  },
  {
    "id": "10",
    "date": "sábado 13 de junio",
    "time": "05:00 p. m.",
    "group": "Group F",
    "teamA": "Países Bajos",
    "teamB": "Japón",
    "flagA": "🇳🇱",
    "flagB": "🇯🇵",
    "status": "upcoming"
  },
  {
    "id": "11",
    "date": "sábado 13 de junio",
    "time": "08:00 p. m.",
    "group": "Group E",
    "teamA": "Costa de Marfil",
    "teamB": "Ecuador",
    "flagA": "🇨🇮",
    "flagB": "🇪🇨",
    "status": "upcoming"
  },
  {
    "id": "12",
    "date": "domingo 14 de junio",
    "time": "11:00 p. m.",
    "group": "Group F",
    "teamA": "Suecia",
    "teamB": "Túnez",
    "flagA": "🇸🇪",
    "flagB": "🇹🇳",
    "status": "upcoming"
  },
  {
    "id": "13",
    "date": "domingo 14 de junio",
    "time": "01:00 p. m.",
    "group": "Group H",
    "teamA": "España",
    "teamB": "Cabo Verde",
    "flagA": "🇪🇸",
    "flagB": "🇨🇻",
    "status": "upcoming"
  },
  {
    "id": "14",
    "date": "domingo 14 de junio",
    "time": "04:00 p. m.",
    "group": "Group G",
    "teamA": "Bélgica",
    "teamB": "Egipto",
    "flagA": "🇧🇪",
    "flagB": "🇪🇬",
    "status": "upcoming"
  },
  {
    "id": "15",
    "date": "domingo 14 de junio",
    "time": "07:00 p. m.",
    "group": "Group H",
    "teamA": "Arabia Saudita",
    "teamB": "Uruguay",
    "flagA": "🇸🇦",
    "flagB": "🇺🇾",
    "status": "upcoming"
  },
  {
    "id": "16",
    "date": "lunes 15 de junio",
    "time": "10:00 p. m.",
    "group": "Group G",
    "teamA": "Irán",
    "teamB": "Nueva Zelanda",
    "flagA": "🇮🇷",
    "flagB": "🇳🇿",
    "status": "upcoming"
  },
  {
    "id": "17",
    "date": "lunes 15 de junio",
    "time": "04:00 p. m.",
    "group": "Group I",
    "teamA": "Francia",
    "teamB": "Senegal",
    "flagA": "🇫🇷",
    "flagB": "🇸🇳",
    "status": "upcoming"
  },
  {
    "id": "18",
    "date": "lunes 15 de junio",
    "time": "07:00 p. m.",
    "group": "Group I",
    "teamA": "Irak",
    "teamB": "Noruega",
    "flagA": "🇮🇶",
    "flagB": "🇳🇴",
    "status": "upcoming"
  },
  {
    "id": "19",
    "date": "martes 16 de junio",
    "time": "10:00 p. m.",
    "group": "Group J",
    "teamA": "Argentina",
    "teamB": "Argelia",
    "flagA": "🇦🇷",
    "flagB": "🇩🇿",
    "status": "upcoming"
  },
  {
    "id": "20",
    "date": "martes 16 de junio",
    "time": "01:00 a. m.",
    "group": "Group J",
    "teamA": "Austria",
    "teamB": "Jordania",
    "flagA": "🇦🇹",
    "flagB": "🇯🇴",
    "status": "upcoming"
  },
  {
    "id": "21",
    "date": "martes 16 de junio",
    "time": "02:00 p. m.",
    "group": "Group K",
    "teamA": "Portugal",
    "teamB": "DR Congo",
    "flagA": "🇵🇹",
    "flagB": "🇨🇩",
    "status": "upcoming"
  },
  {
    "id": "22",
    "date": "martes 16 de junio",
    "time": "05:00 p. m.",
    "group": "Group L",
    "teamA": "Inglaterra",
    "teamB": "Croacia",
    "flagA": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "flagB": "🇭🇷",
    "status": "upcoming"
  },
  {
    "id": "23",
    "date": "martes 16 de junio",
    "time": "08:00 p. m.",
    "group": "Group L",
    "teamA": "Ghana",
    "teamB": "Panamá",
    "flagA": "🇬🇭",
    "flagB": "🇵🇦",
    "status": "upcoming"
  },
  {
    "id": "24",
    "date": "miércoles 17 de junio",
    "time": "11:00 p. m.",
    "group": "Group K",
    "teamA": "Uzbekistán",
    "teamB": "Colombia",
    "flagA": "🇺🇿",
    "flagB": "🇨🇴",
    "status": "upcoming"
  },
  {
    "id": "25",
    "date": "miércoles 17 de junio",
    "time": "01:00 p. m.",
    "group": "Group A",
    "teamA": "República Checa",
    "teamB": "Sudáfrica",
    "flagA": "🇨🇿",
    "flagB": "🇿🇦",
    "status": "upcoming"
  },
  {
    "id": "26",
    "date": "miércoles 17 de junio",
    "time": "04:00 p. m.",
    "group": "Group B",
    "teamA": "Suiza",
    "teamB": "Bosnia & Herzegovina",
    "flagA": "🇨🇭",
    "flagB": "🇧🇦",
    "status": "upcoming"
  },
  {
    "id": "27",
    "date": "miércoles 17 de junio",
    "time": "07:00 p. m.",
    "group": "Group B",
    "teamA": "Canadá",
    "teamB": "Qatar",
    "flagA": "🇨🇦",
    "flagB": "🇶🇦",
    "status": "upcoming"
  },
  {
    "id": "28",
    "date": "jueves 18 de junio",
    "time": "10:00 p. m.",
    "group": "Group A",
    "teamA": "México",
    "teamB": "Corea del Sur",
    "flagA": "🇲🇽",
    "flagB": "🇰🇷",
    "status": "upcoming"
  },
  {
    "id": "29",
    "date": "jueves 18 de junio",
    "time": "04:00 p. m.",
    "group": "Group D",
    "teamA": "Estados Unidos",
    "teamB": "Australia",
    "flagA": "🇺🇸",
    "flagB": "🇦🇺",
    "status": "upcoming"
  },
  {
    "id": "30",
    "date": "jueves 18 de junio",
    "time": "07:00 p. m.",
    "group": "Group C",
    "teamA": "Escocia",
    "teamB": "Marruecos",
    "flagA": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "flagB": "🇲🇦",
    "status": "upcoming"
  },
  {
    "id": "31",
    "date": "viernes 19 de junio",
    "time": "09:30 p. m.",
    "group": "Group C",
    "teamA": "Brasil",
    "teamB": "Haití",
    "flagA": "🇧🇷",
    "flagB": "🇭🇹",
    "status": "upcoming"
  },
  {
    "id": "32",
    "date": "viernes 19 de junio",
    "time": "12:00 a. m.",
    "group": "Group D",
    "teamA": "Türkiye",
    "teamB": "Paraguay",
    "flagA": "🇹🇷",
    "flagB": "🇵🇾",
    "status": "upcoming"
  },
  {
    "id": "33",
    "date": "viernes 19 de junio",
    "time": "02:00 p. m.",
    "group": "Group F",
    "teamA": "Países Bajos",
    "teamB": "Suecia",
    "flagA": "🇳🇱",
    "flagB": "🇸🇪",
    "status": "upcoming"
  },
  {
    "id": "34",
    "date": "viernes 19 de junio",
    "time": "05:00 p. m.",
    "group": "Group E",
    "teamA": "Alemania",
    "teamB": "Costa de Marfil",
    "flagA": "🇩🇪",
    "flagB": "🇨🇮",
    "status": "upcoming"
  },
  {
    "id": "35",
    "date": "sábado 20 de junio",
    "time": "09:00 p. m.",
    "group": "Group E",
    "teamA": "Ecuador",
    "teamB": "Curaçao",
    "flagA": "🇪🇨",
    "flagB": "🇨🇼",
    "status": "upcoming"
  },
  {
    "id": "36",
    "date": "sábado 20 de junio",
    "time": "01:00 a. m.",
    "group": "Group F",
    "teamA": "Túnez",
    "teamB": "Japón",
    "flagA": "🇹🇳",
    "flagB": "🇯🇵",
    "status": "upcoming"
  },
  {
    "id": "37",
    "date": "sábado 20 de junio",
    "time": "01:00 p. m.",
    "group": "Group H",
    "teamA": "España",
    "teamB": "Arabia Saudita",
    "flagA": "🇪🇸",
    "flagB": "🇸🇦",
    "status": "upcoming"
  },
  {
    "id": "38",
    "date": "sábado 20 de junio",
    "time": "04:00 p. m.",
    "group": "Group G",
    "teamA": "Bélgica",
    "teamB": "Irán",
    "flagA": "🇧🇪",
    "flagB": "🇮🇷",
    "status": "upcoming"
  },
  {
    "id": "39",
    "date": "sábado 20 de junio",
    "time": "07:00 p. m.",
    "group": "Group H",
    "teamA": "Uruguay",
    "teamB": "Cabo Verde",
    "flagA": "🇺🇾",
    "flagB": "🇨🇻",
    "status": "upcoming"
  },
  {
    "id": "40",
    "date": "domingo 21 de junio",
    "time": "10:00 p. m.",
    "group": "Group G",
    "teamA": "Nueva Zelanda",
    "teamB": "Egipto",
    "flagA": "🇳🇿",
    "flagB": "🇪🇬",
    "status": "upcoming"
  },
  {
    "id": "41",
    "date": "domingo 21 de junio",
    "time": "02:00 p. m.",
    "group": "Group J",
    "teamA": "Argentina",
    "teamB": "Austria",
    "flagA": "🇦🇷",
    "flagB": "🇦🇹",
    "status": "upcoming"
  },
  {
    "id": "42",
    "date": "domingo 21 de junio",
    "time": "06:00 p. m.",
    "group": "Group I",
    "teamA": "Francia",
    "teamB": "Irak",
    "flagA": "🇫🇷",
    "flagB": "🇮🇶",
    "status": "upcoming"
  },
  {
    "id": "43",
    "date": "lunes 22 de junio",
    "time": "09:00 p. m.",
    "group": "Group I",
    "teamA": "Noruega",
    "teamB": "Senegal",
    "flagA": "🇳🇴",
    "flagB": "🇸🇳",
    "status": "upcoming"
  },
  {
    "id": "44",
    "date": "lunes 22 de junio",
    "time": "12:00 a. m.",
    "group": "Group J",
    "teamA": "Jordania",
    "teamB": "Argelia",
    "flagA": "🇯🇴",
    "flagB": "🇩🇿",
    "status": "upcoming"
  },
  {
    "id": "45",
    "date": "lunes 22 de junio",
    "time": "02:00 p. m.",
    "group": "Group K",
    "teamA": "Portugal",
    "teamB": "Uzbekistán",
    "flagA": "🇵🇹",
    "flagB": "🇺🇿",
    "status": "upcoming"
  },
  {
    "id": "46",
    "date": "lunes 22 de junio",
    "time": "05:00 p. m.",
    "group": "Group L",
    "teamA": "Inglaterra",
    "teamB": "Ghana",
    "flagA": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "flagB": "🇬🇭",
    "status": "upcoming"
  },
  {
    "id": "47",
    "date": "lunes 22 de junio",
    "time": "08:00 p. m.",
    "group": "Group L",
    "teamA": "Panamá",
    "teamB": "Croacia",
    "flagA": "🇵🇦",
    "flagB": "🇭🇷",
    "status": "upcoming"
  },
  {
    "id": "48",
    "date": "martes 23 de junio",
    "time": "11:00 p. m.",
    "group": "Group K",
    "teamA": "Colombia",
    "teamB": "DR Congo",
    "flagA": "🇨🇴",
    "flagB": "🇨🇩",
    "status": "upcoming"
  },
  {
    "id": "49",
    "date": "martes 23 de junio",
    "time": "04:00 p. m.",
    "group": "Group B",
    "teamA": "Bosnia & Herzegovina",
    "teamB": "Qatar",
    "flagA": "🇧🇦",
    "flagB": "🇶🇦",
    "status": "upcoming"
  },
  {
    "id": "50",
    "date": "martes 23 de junio",
    "time": "04:00 p. m.",
    "group": "Group B",
    "teamA": "Suiza",
    "teamB": "Canadá",
    "flagA": "🇨🇭",
    "flagB": "🇨🇦",
    "status": "upcoming"
  },
  {
    "id": "51",
    "date": "martes 23 de junio",
    "time": "07:00 p. m.",
    "group": "Group C",
    "teamA": "Marruecos",
    "teamB": "Haití",
    "flagA": "🇲🇦",
    "flagB": "🇭🇹",
    "status": "upcoming"
  },
  {
    "id": "52",
    "date": "martes 23 de junio",
    "time": "07:00 p. m.",
    "group": "Group C",
    "teamA": "Escocia",
    "teamB": "Brasil",
    "flagA": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "flagB": "🇧🇷",
    "status": "upcoming"
  },
  {
    "id": "53",
    "date": "miércoles 24 de junio",
    "time": "10:00 p. m.",
    "group": "Group A",
    "teamA": "República Checa",
    "teamB": "México",
    "flagA": "🇨🇿",
    "flagB": "🇲🇽",
    "status": "upcoming"
  },
  {
    "id": "54",
    "date": "miércoles 24 de junio",
    "time": "10:00 p. m.",
    "group": "Group A",
    "teamA": "Sudáfrica",
    "teamB": "Corea del Sur",
    "flagA": "🇿🇦",
    "flagB": "🇰🇷",
    "status": "upcoming"
  },
  {
    "id": "55",
    "date": "miércoles 24 de junio",
    "time": "05:00 p. m.",
    "group": "Group E",
    "teamA": "Curaçao",
    "teamB": "Costa de Marfil",
    "flagA": "🇨🇼",
    "flagB": "🇨🇮",
    "status": "upcoming"
  },
  {
    "id": "56",
    "date": "miércoles 24 de junio",
    "time": "05:00 p. m.",
    "group": "Group E",
    "teamA": "Ecuador",
    "teamB": "Alemania",
    "flagA": "🇪🇨",
    "flagB": "🇩🇪",
    "status": "upcoming"
  },
  {
    "id": "57",
    "date": "miércoles 24 de junio",
    "time": "08:00 p. m.",
    "group": "Group F",
    "teamA": "Japón",
    "teamB": "Suecia",
    "flagA": "🇯🇵",
    "flagB": "🇸🇪",
    "status": "upcoming"
  },
  {
    "id": "58",
    "date": "miércoles 24 de junio",
    "time": "08:00 p. m.",
    "group": "Group F",
    "teamA": "Túnez",
    "teamB": "Países Bajos",
    "flagA": "🇹🇳",
    "flagB": "🇳🇱",
    "status": "upcoming"
  },
  {
    "id": "59",
    "date": "jueves 25 de junio",
    "time": "11:00 p. m.",
    "group": "Group D",
    "teamA": "Paraguay",
    "teamB": "Australia",
    "flagA": "🇵🇾",
    "flagB": "🇦🇺",
    "status": "upcoming"
  },
  {
    "id": "60",
    "date": "jueves 25 de junio",
    "time": "11:00 p. m.",
    "group": "Group D",
    "teamA": "Türkiye",
    "teamB": "Estados Unidos",
    "flagA": "🇹🇷",
    "flagB": "🇺🇸",
    "status": "upcoming"
  },
  {
    "id": "61",
    "date": "jueves 25 de junio",
    "time": "04:00 p. m.",
    "group": "Group I",
    "teamA": "Senegal",
    "teamB": "Irak",
    "flagA": "🇸🇳",
    "flagB": "🇮🇶",
    "status": "upcoming"
  },
  {
    "id": "62",
    "date": "jueves 25 de junio",
    "time": "04:00 p. m.",
    "group": "Group I",
    "teamA": "Noruega",
    "teamB": "Francia",
    "flagA": "🇳🇴",
    "flagB": "🇫🇷",
    "status": "upcoming"
  },
  {
    "id": "63",
    "date": "viernes 26 de junio",
    "time": "09:00 p. m.",
    "group": "Group H",
    "teamA": "Uruguay",
    "teamB": "España",
    "flagA": "🇺🇾",
    "flagB": "🇪🇸",
    "status": "upcoming"
  },
  {
    "id": "64",
    "date": "viernes 26 de junio",
    "time": "09:00 p. m.",
    "group": "Group H",
    "teamA": "Cabo Verde",
    "teamB": "Arabia Saudita",
    "flagA": "🇨🇻",
    "flagB": "🇸🇦",
    "status": "upcoming"
  },
  {
    "id": "65",
    "date": "viernes 26 de junio",
    "time": "12:00 a. m.",
    "group": "Group G",
    "teamA": "Nueva Zelanda",
    "teamB": "Bélgica",
    "flagA": "🇳🇿",
    "flagB": "🇧🇪",
    "status": "upcoming"
  },
  {
    "id": "66",
    "date": "viernes 26 de junio",
    "time": "12:00 a. m.",
    "group": "Group G",
    "teamA": "Egipto",
    "teamB": "Irán",
    "flagA": "🇪🇬",
    "flagB": "🇮🇷",
    "status": "upcoming"
  },
  {
    "id": "67",
    "date": "viernes 26 de junio",
    "time": "06:00 p. m.",
    "group": "Group L",
    "teamA": "Croacia",
    "teamB": "Ghana",
    "flagA": "🇭🇷",
    "flagB": "🇬🇭",
    "status": "upcoming"
  },
  {
    "id": "68",
    "date": "viernes 26 de junio",
    "time": "06:00 p. m.",
    "group": "Group L",
    "teamA": "Panamá",
    "teamB": "Inglaterra",
    "flagA": "🇵🇦",
    "flagB": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "status": "upcoming"
  },
  {
    "id": "69",
    "date": "viernes 26 de junio",
    "time": "08:30 p. m.",
    "group": "Group K",
    "teamA": "Colombia",
    "teamB": "Portugal",
    "flagA": "🇨🇴",
    "flagB": "🇵🇹",
    "status": "upcoming"
  },
  {
    "id": "70",
    "date": "viernes 26 de junio",
    "time": "08:30 p. m.",
    "group": "Group K",
    "teamA": "DR Congo",
    "teamB": "Uzbekistán",
    "flagA": "🇨🇩",
    "flagB": "🇺🇿",
    "status": "upcoming"
  },
  {
    "id": "71",
    "date": "sábado 27 de junio",
    "time": "11:00 p. m.",
    "group": "Group J",
    "teamA": "Argelia",
    "teamB": "Austria",
    "flagA": "🇩🇿",
    "flagB": "🇦🇹",
    "status": "upcoming"
  },
  {
    "id": "72",
    "date": "sábado 27 de junio",
    "time": "11:00 p. m.",
    "group": "Group J",
    "teamA": "Jordania",
    "teamB": "Argentina",
    "flagA": "🇯🇴",
    "flagB": "🇦🇷",
    "status": "upcoming"
  }
];
