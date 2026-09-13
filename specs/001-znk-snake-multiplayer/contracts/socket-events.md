# Socket Contract: ZNK Snake Multiplayer MVP

## Naming Convention
- All events use namespace:action.

## Client -> Server

### player:prepare
- Purpose: Request color reservation before entering board.
- Payload:
  - name: string (1..24)
- Success response:
  - player:colorAssigned
- Errors:
  - server:error

### player:join
- Purpose: Confirm entry with reserved color.
- Payload:
  - name: string (1..24)
  - reservationId: string
- Success response:
  - player:joined
  - game:state
- Errors:
  - server:error

### player:move
- Purpose: Submit intended direction change.
- Payload:
  - direction: up | down | left | right
- Success response:
  - game:state (next tick broadcast)

### player:respawn
- Purpose: Re-enter immediately after death.
- Payload:
  - reservationId: string (optional if server supports direct reuse flow)
- Success response:
  - player:joined
  - game:state
- Errors:
  - server:error

## Server -> Client

### player:colorAssigned
- Payload:
  - reservationId: string
  - color: string
  - expiresAt: timestamp

### player:joined
- Payload:
  - playerId: string
  - name: string
  - color: string
  - cycleId: number

### game:state
- Payload:
  - cycleId: number
  - board: { width, height, totalCells }
  - players: Player[]
  - snakes: Snake[]
  - food: Food[]
  - masters: MasterRankEntry[]
  - freeCells: number

### player:died
- Payload:
  - playerId: string
  - cause: wall | self | enemy-body | head-to-head | disconnect

### game:victory
- Payload:
  - playerId: string
  - name: string
  - color: string
  - size: number
  - score: number
  - kills: number
  - freeCells: number
  - cycleId: number

### game:reset
- Payload:
  - cycleId: number

### rank:update
- Payload:
  - masters: MasterRankEntry[]

### server:error
- Payload:
  - code: string
  - message: string

## Validation Rules
- Reservation required for join unless explicit server fallback is documented.
- Active players must have unique colors.
- No waiting queue allowed on join/respawn.
- Spawn-space recovery removes oldest food first, never live snake segments.
- Victory must satisfy: exactly one alive snake AND 6..10 free cells inclusive.
