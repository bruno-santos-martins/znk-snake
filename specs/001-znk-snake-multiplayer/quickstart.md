# Quickstart Validation Guide: ZNK Snake Multiplayer MVP

## Prerequisites
- Monorepo dependencies installed.
- Single startup command available at repository root.

## Start the Full System
1. From repository root, run:
   - yarn dev
2. Expected outcome:
   - Backend listening on port 4000
   - Frontend listening on port 5173

## Scenario A: Prepare -> Preview -> Join
1. Open two browser tabs.
2. In each tab, enter a different player name.
3. Confirm preview appears with assigned color before join.
4. Confirm join succeeds immediately for both players.

Expected results:
- Colors are unique across active players.
- No waiting queue is presented.
- Spawn inicial ocorre proximo ao centro quando ha espaco central disponivel.
- Cobrinha nasce com area imediata ao redor sem obstaculos, quando houver candidato seguro.

## Scenario B: Immediate Spawn Recovery (No Queue)
1. Fill board pressure so normal spawn space is insufficient.
2. Trigger join or respawn.

Expected results:
- System removes oldest food first.
- Join/respawn still completes immediately.
- No live snake segments are removed.

## Scenario C: Collision and Body-to-Food Conversion
1. Cause wall collision for player A.
2. Cause enemy-body collision for player B.
3. Cause head-to-head collision for players C and D.

Expected results:
- Relevant snakes die instantly.
- Entire snake bodies become collectible food.
- Other players can consume those points and grow.

## Scenario D: Spawn Blocking at <=10 Free Cells
1. Progress round until freeCells <= 10.

Expected results:
- Automatic food spawning stops.
- Existing food remains collectible.

## Scenario E: Spawned Food Cooldown After Collection
1. Garanta que exista um ponto de origem normal (spawned) no tabuleiro.
2. Colete esse ponto com uma cobrinha.
3. Observe o tabuleiro pelos proximos 20 segundos.

Expected results:
- Nenhum novo ponto de origem normal surge antes de 20 segundos.
- Apos 20 segundos, surge no maximo um novo ponto de origem normal.

## Scenario F: Official Victory Rule
1. Ensure only one snake remains alive.
2. Ensure freeCells is between 6 and 10 inclusive.

Expected results:
- game:victory emitted with winner summary.
- rank:update emitted with appended winner entry.
- game:reset emitted and next cycle starts.
- Masters rank remains after reset.

## Scenario G: Disconnect Handling
1. Disconnect a live player abruptly.

Expected results:
- Player snake dies and converts to food.
- Player color is released.
- Board does not reset due to disconnect.

## References
- Spec: specs/001-znk-snake-multiplayer/spec.md
- Data model: specs/001-znk-snake-multiplayer/data-model.md
- Contracts: specs/001-znk-snake-multiplayer/contracts/socket-events.md

## Validation Run Log
- Date: 2026-09-13
- Command: yarn.cmd dev
- Observed result: frontend started on 5173 and server started on 4000.
- Command: yarn.cmd typecheck
- Observed result: passed for shared, server, and client.
- Command: yarn.cmd test
- Observed result: server tests passed (10/10), shared/client passed with no tests.
