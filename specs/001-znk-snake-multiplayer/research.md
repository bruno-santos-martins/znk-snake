# Research: ZNK Snake Multiplayer MVP

## Decision 1: Server-authoritative simulation with snapshot-based tick resolution
- Decision: Use a deterministic server tick that resolves all movement and collisions from a pre-tick snapshot, then applies outcomes in one commit step.
- Rationale: Prevents processing-order bias and guarantees fair simultaneous collision handling.
- Alternatives considered:
  - Sequential per-snake updates: rejected due to unfair ordering side effects.
  - Client-side prediction as source of truth: rejected due to desync and cheating risk.

## Decision 2: Two-loop timing model (150ms gameplay tick, 300ms spawn eligibility tick)
- Decision: Keep separate loop cadences for gameplay and spawn eligibility checks, with spawned-food cooldown of 20s after consumption and only one active spawned-food point at a time.
- Rationale: Simplifies reasoning, isolates pacing logic, and guarantees predictable collection rhythm.
- Alternatives considered:
  - Single loop for all updates: rejected because spawn control becomes coupled and harder to tune.
  - Event-only spawning on pickup/death: rejected because product requires periodic spawning.

## Decision 3: Victory evaluation rule
- Decision: Declare victory only when exactly one snake is alive and freeCells is between 6 and 10 inclusive.
- Rationale: Matches approved product rule for domination-based cycle completion.
- Alternatives considered:
  - Largest snake wins at threshold: rejected by product owner.
  - First to size target: rejected by product owner.

## Decision 4: Join/respawn without waiting queue
- Decision: Never queue players; if spawn space is unavailable, remove oldest food first until spawn is possible, then choose spawn candidate by center proximity and safe one-cell neighborhood when available.
- Rationale: Enforces immediate entry requirement while reducing instant-danger spawn outcomes.
- Alternatives considered:
  - Waiting queue: rejected by product requirement.
  - Removing live snake segments to create space: rejected as unfair and rule-breaking.

## Decision 5: Color uniqueness and reservation expiry
- Decision: Reserve colors at prepare step, enforce unique active colors, and auto-expire unconfirmed reservations after short timeout.
- Rationale: Supports preview-before-join UX while preventing color leaks.
- Alternatives considered:
  - Assign only on join: rejected because preview would be impossible.
  - Infinite reservations: rejected due to palette exhaustion risk.

## Decision 6: In-memory rank persistence across cycle resets
- Decision: Persist Masters rank in server memory for process lifetime; do not clear on board reset.
- Rationale: Meets MVP persistence scope without adding external storage complexity.
- Alternatives considered:
  - Persist to database/file in MVP: rejected as unnecessary complexity for first release.

## Decision 7: Contract-first shared package
- Decision: Define all game domain types and socket event payloads in shared package and consume from both client and server.
- Rationale: Prevents schema drift in a real-time system.
- Alternatives considered:
  - Duplicate types per app: rejected due to drift risk.
  - Runtime-only validation without shared compile-time contracts: rejected due to weaker guarantees.

## Decision 8: Board model
- Decision: Use logical grid coordinates for rules and fixed 800x600 viewport for rendering.
- Rationale: Keeps domain logic resolution independent from display mechanics.
- Alternatives considered:
  - Pixel-based collision logic: rejected for complexity and precision instability.

## Open Governance Note
- The current constitution states reset only at full occupancy.
- This feature requires reset by the approved victory window (6-10 free cells with single survivor).
- Implementation can proceed under documented exception only after constitution amendment is accepted.
