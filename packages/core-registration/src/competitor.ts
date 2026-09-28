/**
 * Competitor — person eligible to register and compete.
 * Current rank determines Division eligibility (degree-based tiers).
 */

export interface Competitor {
  id: string;
  displayName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  /** Numeric degree: 0=color belt, 1=1st degree, …, 5=5th degree (regional cap). */
  currentDegree: number;
  school?: string;
  instructor?: string;
  externalMemberId?: string;
  email?: string;
  phone?: string;
}

export class CompetitorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompetitorError';
  }
}

/** Create a new Competitor. */
export function createCompetitor(params: {
  id: string;
  displayName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  currentDegree: number;
  school?: string;
  instructor?: string;
  externalMemberId?: string;
  email?: string;
  phone?: string;
}): Competitor {
  if (params.currentDegree < 0) {
    throw new CompetitorError('currentDegree cannot be negative');
  }
  if (params.currentDegree > 5) {
    throw new CompetitorError(
      'currentDegree exceeds regional cap (max 5th degree); 6th+ blocked at regional registration',
    );
  }
  return {
    id: params.id,
    displayName: params.displayName,
    dateOfBirth: params.dateOfBirth,
    gender: params.gender,
    currentDegree: params.currentDegree,
    school: params.school,
    instructor: params.instructor,
    externalMemberId: params.externalMemberId,
    email: params.email,
    phone: params.phone,
  };
}

/** Compute age at a given date (for Division age-band eligibility). */
export function ageAt(competitor: Competitor, date: Date): number {
  const years = date.getFullYear() - competitor.dateOfBirth.getFullYear();
  const monthDay =
    date.getMonth() * 100 +
    date.getDate() -
    (competitor.dateOfBirth.getMonth() * 100 + competitor.dateOfBirth.getDate());
  return monthDay >= 0 ? years : years - 1;
}
