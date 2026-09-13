export type Position = { x: number; y: number };

export type Direction = 'up' | 'down' | 'left' | 'right';

export type PlayerStatus = 'prepared' | 'alive' | 'dead' | 'disconnected';

export type Player = {
  id: string;
  name: string;
  color: string;
  status: PlayerStatus;
  score: number;
  kills: number;
  reservationId: string | null;
  reservedAt: number | null;
};

export type Snake = {
  id: string;
  playerId: string;
  segments: Position[];
  direction: Direction;
  nextDirection: Direction;
  alive: boolean;
  score: number;
};

export type FoodOrigin = 'spawned' | 'snake-body';

export type Food = {
  id: string;
  position: Position;
  origin: FoodOrigin;
  createdAt: number;
  value: number;
};

export type Board = {
  width: number;
  height: number;
  totalCells: number;
  snakes: Snake[];
  food: Food[];
};

export type MasterRankEntry = {
  name: string;
  color: string;
  size: number;
  score: number;
  kills: number;
  date: number;
  cycleId: number;
};

export type GameState = {
  board: Board;
  players: Player[];
  masters: MasterRankEntry[];
  cycleId: number;
  lastTickAt: number;
};

export type DeathCause = 'wall' | 'self' | 'enemy-body' | 'head-to-head' | 'disconnect';

export type VictoryResult = {
  winnerPlayerId: string;
  freeCells: number;
  snakeSize: number;
  score: number;
  kills: number;
};
