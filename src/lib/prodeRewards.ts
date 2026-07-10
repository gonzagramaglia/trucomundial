/**
 * Calculates the reward packs won for a prode prediction.
 * @param predScoreA - Predicted score for team A
 * @param predScoreB - Predicted score for team B
 * @param actualScoreA - Actual score for team A
 * @param actualScoreB - Actual score for team B
 * @returns Object with packs won (0, 1, or 3) and whether it was an exact match
 */
export function calculateRewardPacks(
  predScoreA: number,
  predScoreB: number,
  actualScoreA: number,
  actualScoreB: number
): { packs: number; wonExact: boolean } {
  const exactMatch = predScoreA === actualScoreA && predScoreB === actualScoreB;
  if (exactMatch) return { packs: 3, wonExact: true };

  const predWinner = predScoreA > predScoreB ? 'A' : (predScoreA < predScoreB ? 'B' : 'Draw');
  const resWinner = actualScoreA > actualScoreB ? 'A' : (actualScoreA < actualScoreB ? 'B' : 'Draw');
  if (predWinner === resWinner) return { packs: 1, wonExact: false };

  return { packs: 0, wonExact: false };
}
