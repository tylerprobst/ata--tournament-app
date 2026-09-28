/**
 * Rank tier for competitor segmentation (regional cap: 5th degree).
 * "Degree" not "dan" per build plan. Regional registrations block 6th+.
 */
export enum RankTier {
  ColorBelt = 'color_belt',
  FirstDegree = '1st_degree',
  SecondThirdDegree = '2nd_3rd_degree',
  FourthFifthDegree = '4th_5th_degree',
}

/** Helper to convert numeric degree (0=color) into RankTier. */
export function degreeToRankTier(degree: number): RankTier {
  if (degree === 0) return RankTier.ColorBelt;
  if (degree === 1) return RankTier.FirstDegree;
  if (degree === 2 || degree === 3) return RankTier.SecondThirdDegree;
  if (degree === 4 || degree === 5) return RankTier.FourthFifthDegree;
  throw new Error(`Degree ${degree} exceeds regional cap (max 5th degree)`);
}

/** True if degree is blocked at regional level (6th+). */
export function isBlockedAtRegional(degree: number): boolean {
  return degree >= 6;
}
