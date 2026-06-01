import 'dotenv/config';
import express from 'express';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { matchesRouter } from './routes/matches.js';
import { swaggerSpec } from './swagger/swagger.js';
import { attachWebsocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sport API!' });
});

app.use(securityMiddleware());
app.use('/api/matches', matchesRouter);

const { broadCastMatchCreated } = attachWebsocketServer(server);
app.locals.broadCastMatchCreated = broadCastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server running at ${baseUrl}`);
  console.log(`Swagger UI at  ${baseUrl}/api-docs`);
  console.log(`WebSocket running at  ${baseUrl.replace('http', 'ws')}/ws`);
});
