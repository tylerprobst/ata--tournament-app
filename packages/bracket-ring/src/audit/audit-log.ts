/**
 * AuditLog writer — closed-ring adjustments ONLY.
 * Routine scoring / bracket edits do not write audit events.
 */

export const CLOSED_RING_ADJUSTMENT = 'closed_ring_adjustment' as const;

export type AuditAction = typeof CLOSED_RING_ADJUSTMENT;

export interface AuditLogEntry {
  id: string;
  timestampMs: number;
  actorId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  beforeSummary: string;
  afterSummary: string;
  reason: string;
}

export interface WriteClosedRingAdjustmentInput {
  actorId: string;
  entityType: string;
  entityId: string;
  /** Must be exactly 'closed_ring_adjustment'. */
  action: string;
  beforeSummary: string;
  afterSummary: string;
  /** Required for closed-ring adjustments. */
  reason: string;
  timestampMs?: number;
}

export class AuditLogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuditLogError';
  }
}

let nextId = 1;

function allocateId(): string {
  const id = `audit-${nextId}`;
  nextId += 1;
  return id;
}

/** In-memory store for domain tests / early scaffolding. */
export class AuditLog {
  private readonly entries: AuditLogEntry[] = [];

  /**
   * Accepts ONLY action === 'closed_ring_adjustment' with a non-empty reason.
   * Throws AuditLogError otherwise.
   */
  write(input: WriteClosedRingAdjustmentInput): AuditLogEntry {
    if (input.action !== CLOSED_RING_ADJUSTMENT) {
      throw new AuditLogError(
        `AuditLog only accepts action '${CLOSED_RING_ADJUSTMENT}', got '${input.action}'`,
      );
    }
    const reason = input.reason?.trim() ?? '';
    if (!reason) {
      throw new AuditLogError(
        `AuditLog requires a non-empty reason for '${CLOSED_RING_ADJUSTMENT}'`,
      );
    }

    const entry: AuditLogEntry = {
      id: allocateId(),
      timestampMs: input.timestampMs ?? Date.now(),
      actorId: input.actorId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: CLOSED_RING_ADJUSTMENT,
      beforeSummary: input.beforeSummary,
      afterSummary: input.afterSummary,
      reason,
    };
    this.entries.push(entry);
    return entry;
  }

  list(): readonly AuditLogEntry[] {
    return this.entries;
  }

  clear(): void {
    this.entries.length = 0;
  }
}
