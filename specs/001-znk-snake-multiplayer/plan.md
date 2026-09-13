# Implementation Plan: ZNK Snake Multiplayer MVP

**Branch**: `001-znk-snake-multiplayer` | **Date**: 2026-09-13 | **Spec**: specs/001-znk-snake-multiplayer/spec.md

**Input**: Feature specification from specs/001-znk-snake-multiplayer/spec.md

## Summary

Implement a server-authoritative real-time multiplayer Snake MVP with immediate
join/respawn, unique player colors with pre-join preview reservation, body-to-food
conversion on death, center-priority safe spawn on join/respawn, and cycle victory
only when exactly one snake is alive and freeCells is within 6..10 inclusive.
Deliver monorepo structure (client/server/shared), shared type and socket contracts,
deterministic tick processing, spawned-food respawn cooldown control, and in-memory
masters ranking that survives board resets during server runtime.

## Technical Context

**Language/Version**: TypeScript (strict: true) across client, server, and shared package

**Primary Dependencies**: React, Vite, Node.js, Express, Socket.IO, Yarn Workspaces, concurrently

**Storage**: In-memory game state and in-memory masters rank (MVP scope)

**Testing**: Unit tests for domain services and integration tests for multi-client socket flows

**Target Platform**: Web browsers for client, Node.js runtime for server

**Project Type**: Monorepo web application (frontend + backend + shared contracts)

**Performance Goals**:
- 150ms gameplay tick and 300ms spawn-eligibility tick remain stable during multiplayer sessions
- Spawned food reappears only after 20s from spawned-food consumption
- 95% of cross-client visible state updates perceived within 1 second

**Constraints**:
- Single-command startup from repository root via yarn dev
- Backend on port 4000 and frontend on port 5173
- Board viewport fixed at 800x600
- Logical board grid 80x60 with 10px cells
- No waiting queue on join/respawn

**Scale/Scope**:
- MVP target: at least 10 concurrent players with distinct colors
- Single shared board and single runtime process scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

1. Clean Architecture: PASS
- Plan keeps game rules in server services.
- Controllers/socket handlers only orchestrate I/O.

2. Server Authoritative: PASS
- All simulation, collision, score, victory, and ranking logic is server-owned.

3. Frontend Dumb Components + Socket Isolation: PASS
- Socket access isolated to client services/hooks/context.

4. Strict Shared Typing: PASS
- shared package defines game domain and socket contracts.

5. Single Command Runtime: PASS
- Root yarn dev runs server and client concurrently.

6. Persistent Shared Board Rule: CONDITIONAL VIOLATION
- Constitution currently states reset only at 100% occupied cells.
- Approved feature spec requires victory window of 6..10 free cells and reset on victory.
- Mitigation required: constitution amendment must be accepted before implementation merge.

7. Unique Active Player Colors: PASS
- Color reservation + active uniqueness enforcement included.

### Post-Phase 1 Re-Check

Status unchanged:
- PASS on Principles I, II, III, IV, V, VII.
- Principle VI remains a documented governance exception pending constitution amendment.

## Project Structure

### Documentation (this feature)

```text
specs/001-znk-snake-multiplayer/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── socket-events.md
└── tasks.md
```

### Source Code (repository root)

```text
znk-snake/
├── package.json
├── tsconfig.base.json
├── shared/
│   └── src/
│       ├── game.types.ts
│       ├── socket-events.ts
│       └── index.ts
├── client/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── pages/
│       │   ├── LobbyPage.tsx
│       │   └── GamePage.tsx
│       ├── components/
│       │   ├── Board/
│       │   ├── SnakeSegment/
│       │   ├── FoodDot/
│       │   ├── ColorPreview/
│       │   ├── PlayerHUD/
│       │   ├── MastersRank/
│       │   ├── DeathOverlay/
│       │   └── VictoryModal/
│       ├── contexts/GameContext.tsx
│       ├── hooks/
│       │   ├── useSocket.ts
│       │   ├── useGameState.ts
│       │   └── useKeyboardControls.ts
│       ├── services/socketClient.ts
│       ├── types/game.types.ts
│       └── styles/global.css
└── server/
    └── src/
        ├── index.ts
        ├── config/env.ts
        ├── sockets/gameSocket.ts
        ├── controllers/GameController.ts
        ├── services/
        │   ├── GameService.ts
        │   ├── PlayerService.ts
        │   ├── SnakeService.ts
        │   ├── FoodService.ts
        │   ├── ColorService.ts
        │   └── RankingService.ts
        ├── state/GameState.ts
        ├── models/
        │   ├── Board.ts
        │   ├── Player.ts
        │   ├── Snake.ts
        │   └── Food.ts
        └── utils/
            ├── position.ts
            ├── random.ts
            └── time.ts
```

**Structure Decision**: Web monorepo with shared contracts package. This preserves
strict separation of concerns and supports server-authoritative rules with a reusable
type-safe contract consumed by both runtime sides.

## Phase Plan

### Phase 0: Research and Decisions

Inputs:
- Spec requirements and acceptance criteria
- Constitution constraints and governance

Output:
- research.md completed with decisions, rationale, and alternatives

Resolved Decisions:
1. Deterministic snapshot tick resolution for fair collisions
2. Dual loop cadence (150ms tick, 300ms spawn)
3. Victory window rule (single survivor + 6..10 free cells)
4. No queue spawn recovery by removing oldest food first
5. Color reservation with expiration timeout
6. Runtime in-memory masters rank persistence
7. Shared contract-first type model

Exit Criteria:
- No unresolved NEEDS CLARIFICATION items remain

### Phase 1: Design and Contracts

Inputs:
- research.md decisions
- spec functional requirements

Outputs:
- data-model.md
- contracts/socket-events.md
- quickstart.md

Design Scope:
1. Domain model and state transitions
2. Event contract definitions for client/server channels
3. End-to-end validation scenarios from startup to cycle victory/reset

Exit Criteria:
- Entity model covers all FRs and edge cases
- Contract payloads and validation rules are testable
- Quickstart scenarios map directly to acceptance outcomes

## Implementation Strategy (for tasks generation)

1. Monorepo bootstrap and workspace scripts
- Create root scripts for dev/build/test/typecheck.
- Ensure yarn dev starts both apps together.

2. Shared package first
- Implement game domain types and socket event contract exports.

3. Server domain core
- Build GameState container and pure services.
- Implement evaluateVictory(state) exactly per rule.
- Implement join/respawn immediate spawn recovery policy.
- Implement color reservation/expiry and release flows.

4. Server transport layer
- Wire socket handlers to controller methods only.
- Broadcast game:state and result events.

5. Client application flow
- Build lobby -> color preview -> join sequence.
- Implement dumb rendering components and context-driven state.
- Add death overlay, victory modal, and masters rank panel.

6. Validation and quality gates
- Unit tests for movement/collisions/victory/ranking/spawn policy.
- Integration tests with multi-client real-time scenarios.
- Typecheck and startup verification via single command.

## Dependencies and Order

1. shared package types and events must be defined before server/client integration.
2. server services must be complete before socket wiring and client real-time rendering.
3. join/respawn and color reservation must be stable before UX preview flow is finalized.
4. victory and ranking must be complete before cycle reset UX and acceptance validation.

## Risks and Mitigations

1. Risk: Tick fairness bugs in simultaneous collisions
- Mitigation: Snapshot-based resolution and dedicated unit tests for head-to-head and multi-collision frames.

2. Risk: Spawn deadlock near full board
- Mitigation: Deterministic oldest-food eviction policy with hard guard for live-snake preservation.

2b. Risk: Unsafe spawn causing immediate death after join/respawn
- Mitigation: Candidate-based spawn search with center-priority ordering and one-cell safety neighborhood check.

3. Risk: Color leakage due to abandoned reservations
- Mitigation: Reservation TTL cleanup and disconnect cleanup hooks.

4. Risk: Governance mismatch with constitution Principle VI
- Mitigation: Record exception in plan and block merge until constitution amendment is approved.

5. Risk: Real-time latency variance
- Mitigation: Keep payloads minimal, emit authoritative deltas/state at fixed cadence, verify SC targets in integration tests.

## Acceptance Mapping

- Startup from root via yarn dev: covered by workspace scripts and quickstart Scenario A.
- Unique colors with preview before join: covered by player:prepare/player:colorAssigned/player:join flow.
- Real-time movement and collisions: covered by main tick and integration scenarios.
- Body-to-food conversion and growth from enemy remains: covered by FR-012/013 and collision scenarios.
- Immediate respawn without queue: covered by spawn-space recovery rule.
- Spawn near center with safe neighborhood on entry/respawn: covered by candidate ranking + safety validation in GameService.
- No reset on individual events: enforced in GameService cycle control.
- Spawn halt at <=10 free cells: enforced by spawn tick guard.
- Spawned-food pacing after collection: enforced by 20-second cooldown and single active spawned-food policy.
- Official victory condition (single survivor + 6..10 free): enforced by evaluateVictory.
- Rank persists across map reset in server runtime: enforced by RankingService lifecycle.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle VI reset rule mismatch | Product-approved victory model uses 6..10 free-cell window with single survivor | Full-occupancy reset conflicts with validated product behavior and acceptance criteria |
