# Data Model: ZNK Snake Multiplayer MVP

## Position
- Fields:
  - x: integer, 0 <= x < 80
  - y: integer, 0 <= y < 60
- Rules:
  - All gameplay calculations operate on logical coordinates.

## Direction
- Enum: up, down, left, right
- Rules:
  - Opposite-direction reversal in same tick is invalid.

## Player
- Fields:
  - id: string
  - name: string
  - color: string
  - status: prepared | alive | dead | disconnected
  - score: integer >= 0
  - kills: integer >= 0
  - reservationId: string | null
  - reservedAt: timestamp | null
- Relationships:
  - 1:1 with Snake when status=alive
- Transitions:
  - prepared -> alive on player:join
  - alive -> dead on collision/disconnect
  - dead -> alive on player:respawn

## Snake
- Fields:
  - id: string
  - playerId: string
  - segments: Position[] ordered head->tail
  - direction: Direction
  - nextDirection: Direction
  - alive: boolean
  - score: integer >= 0
- Rules:
  - Head is segments[0].
  - Spawn must place all initial segments on free cells.
  - Join/respawn spawn prioritizes candidates near board center.
  - Spawn prefers one-cell safety neighborhood around initial segments; if unavailable, fallback keeps immediate-entry guarantee.

## Food
- Fields:
  - id: string
  - position: Position
  - origin: spawned | snake-body
  - createdAt: timestamp
  - value: integer >= 1
- Rules:
  - Oldest Food entries are removed first when forcing spawn space.
  - Food with origin=spawned is limited to one active entry at a time.
  - After a spawned food is consumed, next spawned food can appear only after 20 seconds.

## Board
- Fields:
  - width: 80
  - height: 60
  - totalCells: 4800
  - snakes: Snake[]
  - food: Food[]
- Derived:
  - snakeCells: count of occupied snake positions
  - foodCells: count of occupied food positions
  - freeCells = totalCells - snakeCells - foodCells

## GameState
- Fields:
  - board: Board
  - players: Player[]
  - masters: MasterRankEntry[]
  - cycleId: integer >= 1
  - lastTickAt: timestamp
- Rules:
  - Board never resets on individual join/death/respawn/disconnect.

## MasterRankEntry
- Fields:
  - name: string
  - color: string
  - size: integer >= 1
  - score: integer >= 0
  - kills: integer >= 0
  - date: timestamp
  - cycleId: integer >= 1

## VictoryResult
- Fields:
  - winnerPlayerId: string
  - freeCells: integer
  - snakeSize: integer
  - score: integer
  - kills: integer
- Rules:
  - Valid only when one snake alive and 6 <= freeCells <= 10.

## Socket Event Payloads (Domain View)
- player:prepare -> { name }
- player:colorAssigned -> { reservationId, color }
- player:join -> { name, reservationId }
- player:joined -> { playerId, color, state }
- player:move -> { direction }
- player:respawn -> { reservationId? }
- player:died -> { playerId, cause }
- game:state -> { state }
- game:victory -> { name, color, size, score, kills, cycleId }
- game:reset -> { cycleId }
- rank:update -> { masters }
- server:error -> { code, message }
