export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  RESERVATION_TTL_MS: 20000,
  FOOD_RESPAWN_MS: 2000,
  TICK_MS: 150,
  SPAWN_TICK_MS: 300,
  BOARD_WIDTH: 80,
  BOARD_HEIGHT: 60,
  CELL_SIZE: 10
};
