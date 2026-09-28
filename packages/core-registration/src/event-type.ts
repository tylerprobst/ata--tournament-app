/**
 * EventType catalog (eight fixed values).
 * Owned by Bracket Ring but re-exported for Core Reg cross-module use.
 * Order locked by architecture spec (traditional forms → extreme weapons).
 */

/** EventType enum with locked order. */
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

/** Canonical order per spec: 1=traditional forms … 8=extreme weapons. */
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

export function isSparring(eventType: EventType): boolean {
  return (
    eventType === EventType.TraditionalSparring ||
    eventType === EventType.CombatSparring
  );
}

export function isFormsOrWeapons(eventType: EventType): boolean {
  return !isSparring(eventType);
}
