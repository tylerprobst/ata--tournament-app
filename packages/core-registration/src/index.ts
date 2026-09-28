/** @ata/core-registration — domain only. No UI. */

export { RankTier, degreeToRankTier, isBlockedAtRegional } from './rank-tier.js';
export {
  EventType,
  EVENT_TYPE_ORDER,
  isSparring,
  isFormsOrWeapons,
} from './event-type.js';
export {
  Tournament,
  TournamentError,
  TournamentStatus,
  createTournament,
} from './tournament.js';
export {
  Competitor,
  CompetitorError,
  createCompetitor,
  ageAt,
} from './competitor.js';
export {
  Division,
  DivisionError,
  DivisionStatus,
  AgeBand,
  createDivision,
} from './division.js';
export {
  Registration,
  RegistrationError,
  RegistrationChannel,
  RegistrationStatus,
  DivisionEntry,
  JudgePreferences,
  createDraftRegistration,
  commitRegistration,
  scratchRegistration,
} from './registration.js';
