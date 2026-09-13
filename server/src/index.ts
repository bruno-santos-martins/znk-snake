import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { GameController } from './controllers/GameController';
import { registerGameSocket } from './sockets/gameSocket';
import { ColorService } from './services/ColorService';
import { FoodService } from './services/FoodService';
import { GameService } from './services/GameService';
import { PlayerService } from './services/PlayerService';
import { RankingService } from './services/RankingService';
import { SnakeService } from './services/SnakeService';
import { GameStateStore } from './state/GameState';

const app = express();
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());

const http = createServer(app);
const io = new Server(http, { cors: { origin: env.CLIENT_ORIGIN } });

const store = new GameStateStore();
const colorService = new ColorService();
const snakeService = new SnakeService();
const foodService = new FoodService();
const playerService = new PlayerService(colorService, snakeService, foodService);
const rankingService = new RankingService();
const gameService = new GameService(store, colorService, playerService, snakeService, foodService, rankingService);
const controller = new GameController(gameService);

const tick = () => {
  const result = gameService.tick();
  if (result.victory) {
    const player = store.getPlayer(result.victory.winnerPlayerId);
    if (player) {
      io.emit('game:victory', {
        playerId: player.id,
        name: player.name,
        color: player.color,
        size: result.victory.snakeSize,
        score: result.victory.score,
        kills: result.victory.kills,
        freeCells: result.victory.freeCells,
        cycleId: store.state.cycleId
      });
      io.emit('rank:update', { masters: rankingService.all() });
      io.emit('game:reset', { cycleId: store.state.cycleId });
    }
  }
  for (const d of result.deaths) io.emit('player:died', d);
};

registerGameSocket(io, controller, tick);
setInterval(() => gameService.spawnTick(), env.SPAWN_TICK_MS);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

http.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
