/**
 * EventType catalog and scoring-rule helpers (Bracket Ring ownership).
 * Order is locked by architecture spec / build plan — do not reorder.
 */

/** Locked EventType enum — eight values, Forms before Weapons for Creative/Extreme. */
export enum EventType {
  TraditionalForms = 'traditional_forms',
  TraditionalWeapons = 'traditional_weapons',
  CombatSparring = 'combat_sparring',
  TraditionalSparring = 'traditional_sparring',
  CreativeForms = 'creative_forms',
  CreativeWeapons = 'creative_weapons',
  ExtremeForms = 'extreme_forms',
  ExtremeWeapons = 'extreme_weapons',
}

/** Spec order (1-indexed in docs): traditional forms → … → extreme weapons. */
export const EVENT_TYPE_ORDER: readonly EventType[] = [
  EventType.TraditionalForms,
  EventType.TraditionalWeapons,
  EventType.CombatSparring,
  EventType.TraditionalSparring,
  EventType.CreativeForms,
  EventType.CreativeWeapons,
  EventType.ExtremeForms,
  EventType.ExtremeWeapons,
] as const;

export const FORMS_DIGIT_MIN = 1;
export const FORMS_DIGIT_MAX = 9;
export const FORMS_JUDGE_COUNT = 3;

export const TRADITIONAL_SPARRING_CAP = 5;
export const COMBAT_SPARRING_CAP = 10;

export function isFormsOrWeapons(eventType: EventType): boolean {
  return (
    eventType === EventType.TraditionalForms ||
    eventType === EventType.TraditionalWeapons ||
    eventType === EventType.CreativeForms ||
    eventType === EventType.CreativeWeapons ||
    eventType === EventType.ExtremeForms ||
    eventType === EventType.ExtremeWeapons
  );
}

export function isSparring(eventType: EventType): boolean {
  return (
    eventType === EventType.TraditionalSparring ||
    eventType === EventType.CombatSparring
  );
}

/** First-to-cap for sparring EventTypes; undefined for forms/weapons. */
export function sparringCap(eventType: EventType): number | undefined {
  if (eventType === EventType.TraditionalSparring) return TRADITIONAL_SPARRING_CAP;
  if (eventType === EventType.CombatSparring) return COMBAT_SPARRING_CAP;
  return undefined;
}

/** True when points >= EventType cap (traditional=5, combat=10). */
export function capReached(eventType: EventType, points: number): boolean {
  const cap = sparringCap(eventType);
  if (cap === undefined) return false;
  return points >= cap;
}

export type FormsDigits = readonly [number, number, number];

export function assertFormsDigit(digit: number): void {
  if (!Number.isInteger(digit) || digit < FORMS_DIGIT_MIN || digit > FORMS_DIGIT_MAX) {
    throw new Error(
      `Forms/weapons digit must be an integer ${FORMS_DIGIT_MIN}–${FORMS_DIGIT_MAX}, got ${digit}`,
    );
  }
}

/** Sum three judge digits (1–9 each) for a forms/weapons performance total. */
export function sumFormsDigits(digits: FormsDigits): number {
  for (const d of digits) assertFormsDigit(d);
  return digits[0] + digits[1] + digits[2];
}
