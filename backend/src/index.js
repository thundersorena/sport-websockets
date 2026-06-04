import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { matchesRouter } from './routes/matches.js';
import { swaggerSpec } from './swagger/swagger.js';
import { attachWebsocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';
import { commentaryRouter } from './routes/commentary.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(securityMiddleware());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sport API!' });
});

app.use('/api/matches', matchesRouter);
app.use('/api/matches', commentaryRouter);

const { broadCastMatchCreated , broadCastCommentary, broadCastScoreUpdate } = attachWebsocketServer(server);
app.locals.broadCastMatchCreated = broadCastMatchCreated;
app.locals.broadCastCommentary = broadCastCommentary;
app.locals.broadCastScoreUpdate = broadCastScoreUpdate;

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server running at ${baseUrl}`);
  console.log(`Swagger UI at  ${baseUrl}/api-docs`);
  console.log(`WebSocket running at  ${baseUrl.replace('http', 'ws')}/ws`);
});
