# Tasks: ZNK Snake Multiplayer MVP

**Input**: Design documents from `/specs/001-znk-snake-multiplayer/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Unit and integration tests are included because plan/spec require real-time behavior validation and collision/victory correctness.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo workspace, strict TypeScript baseline, and runtime scripts.

- [X] T001 Create root workspace manifests and scripts (`dev`, `build`, `test`, `typecheck`) in package.json
- [X] T002 Create shared TypeScript base settings with strict mode in tsconfig.base.json
- [X] T003 [P] Create shared workspace package manifest in shared/package.json
- [X] T004 [P] Create server workspace package manifest in server/package.json
- [X] T005 [P] Create client workspace package manifest in client/package.json
- [X] T006 Configure root dev script using concurrently for server/client in package.json
- [X] T007 [P] Create server TypeScript config extending root base in server/tsconfig.json
- [X] T008 [P] Create client TypeScript config extending root base in client/tsconfig.json
- [X] T009 [P] Create shared TypeScript config extending root base in shared/tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain contracts, baseline state container, and socket boundaries required by all stories.

**CRITICAL**: Complete this phase before starting user stories.

- [X] T010 Create shared domain types with constraints in shared/src/game.types.ts (`Position.x: integer, 0 <= x < 80`; `Position.y: integer, 0 <= y < 60`; `Direction: up|down|left|right`; `Player.score: integer >= 0`; `Player.kills: integer >= 0`; `Food.value: integer >= 1`; `MasterRankEntry.size: integer >= 1`)
- [X] T011 Create shared socket event contracts in shared/src/socket-events.ts for `player:prepare`, `player:join`, `player:move`, `player:respawn`, `player:colorAssigned`, `player:joined`, `game:state`, `player:died`, `game:victory`, `game:reset`, `rank:update`, `server:error`
- [X] T012 Export shared public API in shared/src/index.ts
- [X] T013 [P] Create server state container structure in server/src/state/GameState.ts
- [X] T014 [P] Create board and utility primitives in server/src/models/Board.ts and server/src/utils/position.ts
- [X] T015 [P] Create deterministic time/random helpers in server/src/utils/time.ts and server/src/utils/random.ts
- [X] T016 Create service wiring shell without game logic in server/src/services/GameService.ts
- [X] T017 Create socket client wrapper boundary in client/src/services/socketClient.ts
- [X] T018 [P] Create client game context shell in client/src/contexts/GameContext.tsx
- [X] T019 [P] Create base hooks shells in client/src/hooks/useSocket.ts, client/src/hooks/useGameState.ts, and client/src/hooks/useKeyboardControls.ts
- [X] T020 Create server socket/controller orchestration boundaries in server/src/sockets/gameSocket.ts and server/src/controllers/GameController.ts

**Checkpoint**: Shared contracts, state container, and architecture boundaries are ready.

---

## Phase 3: User Story 1 - Entrar e Jogar Imediatamente (Priority: P1) 🎯 MVP

**Goal**: Player prepares with name, receives unique color preview, and joins instantly without queue.

**Independent Test**: User can open lobby, receive color reservation, confirm join, and spawn immediately even when board is constrained.

### Tests for User Story 1

- [X] T021 [P] [US1] Add contract test for `player:prepare` -> `player:colorAssigned` in server/tests/contract/player-prepare.contract.test.ts
- [X] T022 [P] [US1] Add contract test for `player:join` immediate admission in server/tests/contract/player-join.contract.test.ts
- [X] T023 [P] [US1] Add integration test for lobby->preview->join flow in tests/integration/us1-join-preview.integration.test.ts

### Implementation for User Story 1

- [X] T024 [P] [US1] Implement Player model in server/src/models/Player.ts with `status: prepared|alive|dead|disconnected`, `score: integer >= 0`, `kills: integer >= 0`, `reservationId: string|null`, `reservedAt: timestamp|null`
- [X] T025 [P] [US1] Implement Snake model in server/src/models/Snake.ts with `segments: Position[] ordered head->tail`, `direction`, `nextDirection`, `alive: boolean`, `score: integer >= 0`
- [X] T026 [P] [US1] Implement Food model in server/src/models/Food.ts with `origin: spawned|snake-body`, `createdAt: timestamp`, `value: integer >= 1`
- [X] T027 [US1] Implement color uniqueness and reservation expiry in server/src/services/ColorService.ts
- [X] T028 [US1] Implement prepare/join/respawn player orchestration in server/src/services/PlayerService.ts
- [X] T029 [US1] Implement spawn-space recovery by removing oldest food first in server/src/services/FoodService.ts
- [X] T030 [US1] Implement initial snake spawn validation in server/src/services/SnakeService.ts enforcing all spawn segments on free cells
- [X] T031 [US1] Implement `player:prepare` and `player:join` handlers in server/src/controllers/GameController.ts using services only
- [X] T032 [US1] Wire `player:prepare` and `player:join` events in server/src/sockets/gameSocket.ts with `server:error` mapping
- [X] T033 [US1] Implement Lobby page and prepare/join flow in client/src/pages/LobbyPage.tsx
- [X] T034 [P] [US1] Implement color preview component in client/src/components/ColorPreview/index.tsx
- [X] T035 [P] [US1] Implement player HUD base color display in client/src/components/PlayerHUD/index.tsx
- [X] T036 [US1] Connect preview/join state via client/src/contexts/GameContext.tsx and client/src/hooks/useSocket.ts

**Checkpoint**: US1 works independently and satisfies immediate join with unique preview color.

---

## Phase 4: User Story 2 - Sobreviver, Eliminar e Crescer (Priority: P2)

**Goal**: Real-time movement, collision resolution, death conversion to food, and growth from collected points.

**Independent Test**: Multiple clients can move simultaneously; collisions resolve correctly; dead snake bodies become collectible food.

### Tests for User Story 2

- [X] T037 [P] [US2] Add unit tests for movement and direction reversal guard in server/tests/unit/snake-movement.unit.test.ts
- [X] T038 [P] [US2] Add unit tests for wall/self/enemy collisions and head-to-head in server/tests/unit/collision-resolution.unit.test.ts
- [X] T039 [P] [US2] Add unit tests for body-to-food conversion and food persistence in server/tests/unit/death-food-conversion.unit.test.ts
- [X] T040 [P] [US2] Add integration test for multi-client synchronized movement in tests/integration/us2-realtime-sync.integration.test.ts

### Implementation for User Story 2

- [X] T041 [US2] Implement tick snapshot movement and collision pipeline in server/src/services/GameService.ts
- [X] T042 [US2] Implement direction queue and anti-reversal validation in server/src/services/SnakeService.ts
- [X] T043 [US2] Implement death handling and full-body conversion to food in server/src/services/FoodService.ts
- [X] T044 [US2] Implement score and growth application on collectible consumption in server/src/services/SnakeService.ts
- [X] T045 [US2] Implement `player:move` handler in server/src/controllers/GameController.ts
- [X] T046 [US2] Broadcast authoritative `game:state` and `player:died` from server/src/sockets/gameSocket.ts
- [X] T047 [P] [US2] Implement Game page layout in client/src/pages/GamePage.tsx
- [X] T048 [P] [US2] Implement board rendering using logical cells in client/src/components/Board/index.tsx
- [X] T049 [P] [US2] Implement snake segment rendering (head/body distinction) in client/src/components/SnakeSegment/index.tsx
- [X] T050 [P] [US2] Implement food rendering component in client/src/components/FoodDot/index.tsx
- [X] T051 [US2] Implement keyboard input capture and dispatch in client/src/hooks/useKeyboardControls.ts
- [X] T052 [US2] Implement death overlay state and rendering in client/src/components/DeathOverlay/index.tsx

**Checkpoint**: US2 works independently and preserves real-time collision and growth behavior.

---

## Phase 5: User Story 3 - Fechar Ciclo e Registrar Mestre (Priority: P3)

**Goal**: Enforce official victory window (single survivor + 6..10 free cells), stop spawn at <=10 free cells, reset cycle, and maintain masters rank.

**Independent Test**: Round ends only under official condition, winner data is emitted and appended to rank, and rank survives board reset.

### Tests for User Story 3

- [X] T053 [P] [US3] Add unit tests for `evaluateVictory` conditions in server/tests/unit/victory-evaluation.unit.test.ts
- [X] T054 [P] [US3] Add unit tests for spawn blocking when freeCells <= 10 in server/tests/unit/spawn-threshold.unit.test.ts
- [X] T055 [P] [US3] Add unit tests for rank persistence across board reset in server/tests/unit/ranking-persistence.unit.test.ts
- [X] T056 [P] [US3] Add integration test for full cycle to victory/reset in tests/integration/us3-cycle-victory.integration.test.ts

### Implementation for User Story 3

- [X] T057 [US3] Implement free-cell calculation in server/src/services/GameService.ts using `freeCells = totalCells - snakeCells - foodCells`
- [X] T058 [US3] Implement victory evaluator in server/src/services/GameService.ts requiring exactly one alive snake and `6 <= freeCells <= 10`
- [X] T059 [US3] Implement periodic food spawn loop and threshold stop at <=10 free cells in server/src/services/FoodService.ts
- [X] T060 [US3] Implement ranking append/read in server/src/services/RankingService.ts with runtime persistence
- [X] T061 [US3] Emit `game:victory`, `rank:update`, and `game:reset` sequencing in server/src/sockets/gameSocket.ts
- [X] T062 [P] [US3] Implement masters rank UI list in client/src/components/MastersRank/index.tsx
- [X] T063 [P] [US3] Implement victory modal UI in client/src/components/VictoryModal/index.tsx
- [X] T064 [US3] Integrate victory and rank updates in client/src/contexts/GameContext.tsx

**Checkpoint**: US3 works independently and enforces official cycle completion behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, runtime validation, and quality hardening across stories.

- [X] T065 [P] Add neon/arcade global styling and layout consistency in client/src/styles/global.css
- [X] T066 [P] Add app shell routing between lobby and game in client/src/App.tsx and client/src/main.tsx
- [X] T067 Add server startup bootstrap and environment config in server/src/index.ts and server/src/config/env.ts
- [X] T068 Add shared type re-export alignment for client imports in client/src/types/game.types.ts
- [X] T069 Run end-to-end quickstart validation scenarios from specs/001-znk-snake-multiplayer/quickstart.md and document outcomes in specs/001-znk-snake-multiplayer/quickstart.md
- [X] T070 Execute workspace quality gates (`yarn typecheck`, `yarn test`, `yarn dev`) and fix blockers across package.json, server/, client/, and shared/
- [X] T071 Atualizar logica de spawn para priorizar centro com validacao de area segura em server/src/services/GameService.ts e cobrir com teste unitario em server/tests/unit/spawn-threshold.unit.test.ts
- [X] T072 Atualizar pacing de comida normal para cooldown de 20s apos coleta e no maximo 1 item normal ativo por vez em server/src/services/GameService.ts e server/src/config/env.ts
- [X] T073 Permitir escolha de cor no lobby e reserva de cor preferida no fluxo player:prepare com validacao de disponibilidade no servidor
- [X] T074 Atualizar arbitragem de colisao: cabeca-corpo elimina atacante; cabeca-cabeca elimina menor e preserva maior (empate elimina ambas), com testes em server/tests/unit/collision-resolution.unit.test.ts
- [ ] T075 Adicionar cooldown de 10s entre respawns do mesmo jogador e aprimorar modal de morte/respawn com visual moderno e motion no cliente

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies
- Foundational (Phase 2): depends on Phase 1 and blocks all user stories
- User Story phases (Phase 3-5): all depend on Phase 2
- Polish (Phase 6): depends on selected user stories being complete

### User Story Dependencies

- US1 (P1): starts after Phase 2; no dependency on US2/US3
- US2 (P2): starts after Phase 2; uses shared contracts and baseline context from US1 but remains independently testable
- US3 (P3): starts after Phase 2; can integrate with US1/US2 outputs but remains independently testable

### Within Each Story

- Tests first, then models/services, then transport/UI integration
- Service logic before controller/socket wiring
- Context/hooks integration before UI polish

---

## Parallel Execution Opportunities

- Phase 1: T003, T004, T005, T007, T008, T009 can run in parallel
- Phase 2: T013, T014, T015, T018, T019 can run in parallel after T010-T012
- US1: T024, T025, T026 and T034, T035 can run in parallel
- US2: T037-T040 can run in parallel; T047-T050 can run in parallel
- US3: T053-T056 can run in parallel; T062-T063 can run in parallel
- Polish: T065 and T066 can run in parallel

## Parallel Example: User Story 1

```bash
Task: "T021 Add contract test for player:prepare in server/tests/contract/player-prepare.contract.test.ts"
Task: "T022 Add contract test for player:join in server/tests/contract/player-join.contract.test.ts"
Task: "T023 Add integration test for join-preview flow in tests/integration/us1-join-preview.integration.test.ts"

Task: "T024 Implement Player model in server/src/models/Player.ts"
Task: "T025 Implement Snake model in server/src/models/Snake.ts"
Task: "T026 Implement Food model in server/src/models/Food.ts"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2
2. Deliver Phase 3 (US1) with passing contract/integration tests
3. Validate immediate join and unique color preview

### Incremental Delivery

1. Add US2 for full gameplay interactions and collision system
2. Add US3 for victory window and masters rank lifecycle
3. Finish with Phase 6 quality gates and quickstart validation

### Parallel Team Strategy

1. Team A: server domain services (`server/src/services/*`)
2. Team B: client UX flow/components (`client/src/pages/*`, `client/src/components/*`)
3. Team C: tests/contracts (`server/tests/*`, `tests/integration/*`, `shared/src/*`)

## Notes

- All tasks follow checklist format: checkbox, Task ID, optional `[P]`, required `[USx]` in story phases, and explicit file path.
- Governance exception remains: victory/reset logic conflicts with current constitution Principle VI until formal amendment.
