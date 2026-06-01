import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { matchesRouter } from './routes/matches.js';
import { swaggerSpec } from './swagger/swagger.js';

const app = express();
const PORT = 8000;

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sport API!' });
});

app.use('/api/matches', matchesRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger UI at  http://localhost:${PORT}/api-docs`);
});
