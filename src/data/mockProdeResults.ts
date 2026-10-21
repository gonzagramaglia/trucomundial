export interface MockMatchResult {
  scoreA: number;
  scoreB: number;
  status: string; // 'finished', 'finished_penalties_A', 'finished_penalties_B', 'live', 'upcoming'
}

/**
 * Realistic mock results for World Cup matches to power Prode on static/GitHub Pages environments.
 */
export const MOCK_PRODE_RESULTS: Record<string, MockMatchResult> = {
  "1": { scoreA: 2, scoreB: 1, status: "finished" }, // México vs Sudáfrica
  "2": { scoreA: 1, scoreB: 1, status: "finished" }, // Corea del Sur vs República Checa
  "3": { scoreA: 2, scoreB: 0, status: "finished" }, // Canadá vs Bosnia & Herzegovina
  "4": { scoreA: 3, scoreB: 1, status: "finished" }, // Estados Unidos vs Paraguay
  "5": { scoreA: 0, scoreB: 2, status: "finished" }, // Qatar vs Suiza
  "6": { scoreA: 2, scoreB: 1, status: "finished" }, // Brasil vs Colombia
  "7": { scoreA: 3, scoreB: 0, status: "finished" }, // Argentina vs Japón
  "8": { scoreA: 1, scoreB: 2, status: "finished" }, // España vs Países Bajos
  "9": { scoreA: 0, scoreB: 0, status: "finished" }, // Francia vs Australia
  "10": { scoreA: 2, scoreB: 0, status: "finished" }, // Alemania vs Escocia
  "11": { scoreA: 1, scoreB: 2, status: "finished" }, // Italia vs Noruega
  "12": { scoreA: 2, scoreB: 1, status: "finished" }, // Inglaterra vs Nigeria
  "13": { scoreA: 1, scoreB: 0, status: "finished" }, // Uruguay vs Croacia
  "14": { scoreA: 3, scoreB: 2, status: "finished" }, // Portugal vs Dinamarca
  "15": { scoreA: 0, scoreB: 1, status: "finished" }, // Bélgica vs Marruecos
  "16": { scoreA: 2, scoreB: 2, status: "finished" }, // Chile vs Polonia
  "17": { scoreA: 1, scoreB: 0, status: "finished" }, // México vs Corea del Sur
  "18": { scoreA: 0, scoreB: 2, status: "finished" }, // Sudáfrica vs República Checa
  "19": { scoreA: 1, scoreB: 1, status: "finished" }, // Canadá vs Qatar
  "20": { scoreA: 2, scoreB: 1, status: "finished" }, // Bosnia & Herzegovina vs Suiza
};
