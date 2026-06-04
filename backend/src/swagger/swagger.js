import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sport API',
      version: '1.0.0',
      description: 'Real-time sports application API — matches, live scores, and commentary.',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Matches',
        description: 'Create and manage sport matches',
      },
      {
        name: 'Commentary',
        description: 'Live commentary and events for matches',
      },
    ],
    components: {
      schemas: {
        Match: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            sport: { type: 'string', example: 'Football' },
            homeTeam: { type: 'string', example: 'Arsenal' },
            awayTeam: { type: 'string', example: 'Chelsea' },
            status: {
              type: 'string',
              enum: ['scheduled', 'live', 'finished'],
              example: 'scheduled',
            },
            startTime: { type: 'string', format: 'date-time', example: '2026-06-01T15:00:00Z' },
            endTime: {
              type: 'string',
              format: 'date-time',
              example: '2026-06-01T17:00:00Z',
            },
            homeScore: { type: 'integer', example: 0 },
            awayScore: { type: 'integer', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateMatchInput: {
          type: 'object',
          required: ['sport', 'homeTeam', 'awayTeam', 'startTime', 'endTime'],
          properties: {
            sport: { type: 'string', example: 'Football' },
            homeTeam: { type: 'string', example: 'Arsenal' },
            awayTeam: { type: 'string', example: 'Chelsea' },
            startTime: { type: 'string', format: 'date-time', example: '2026-06-01T15:00:00Z' },
            endTime: { type: 'string', format: 'date-time', example: '2026-06-01T17:00:00Z' },
            homeScore: { type: 'integer', minimum: 0, example: 0 },
            awayScore: { type: 'integer', minimum: 0, example: 0 },
          },
        },
        UpdateScoreInput: {
          type: 'object',
          required: ['homeScore', 'awayScore'],
          properties: {
            homeScore: { type: 'integer', minimum: 0, example: 2 },
            awayScore: { type: 'integer', minimum: 0, example: 1 },
          },
        },
        Commentary: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            matchId: { type: 'integer', example: 1 },
            minute: { type: 'integer', minimum: 0, example: 45 },
            sequence: { type: 'integer', minimum: 0, example: 1 },
            period: { type: 'string', example: '1st Half' },
            eventType: { type: 'string', example: 'goal' },
            actor: { type: 'string', example: 'John Doe' },
            team: { type: 'string', example: 'Arsenal' },
            message: { type: 'string', example: 'Goal! Amazing strike from outside the box!' },
            metadata: { type: 'object', nullable: true, example: { assistedBy: 'Jane Smith' } },
            tags: { type: 'array', items: { type: 'string' }, example: ['goal', 'highlight'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCommentaryInput: {
          type: 'object',
          required: ['minute', 'sequence', 'period', 'eventType', 'message'],
          properties: {
            minute: { type: 'integer', minimum: 0, example: 45 },
            sequence: { type: 'integer', minimum: 0, example: 1 },
            period: { type: 'string', example: '1st Half' },
            eventType: { type: 'string', example: 'goal' },
            actor: { type: 'string', example: 'John Doe' },
            team: { type: 'string', example: 'Arsenal' },
            message: { type: 'string', example: 'Goal! Amazing strike from outside the box!' },
            metadata: { type: 'object', example: { assistedBy: 'Jane Smith' } },
            tags: { type: 'array', items: { type: 'string' }, example: ['goal', 'highlight'] },
          },
        },
      },
      responses: {
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Invalid data' },
                  details: { type: 'object' },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Match not found' },
                },
              },
            },
          },
        },
        InternalError: {
          description: 'Unexpected server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'An unexpected error occurred' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
