import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { matchIdParamSchema } from '../validation/matches.js';
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';

export const commentaryRouter = Router();

const MAX_LIMIT = 100;

/**
 * @swagger
 * /api/matches/{id}/commentary:
 *   get:
 *     summary: List commentary for a match
 *     tags: [Commentary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of commentary entries to return
 *     responses:
 *       200:
 *         description: List of commentary entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Commentary'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
commentaryRouter.get('/:id/commentary', async (req, res) => {
  const paramParsed = matchIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res.status(400).json({ 
      error: 'Invalid match ID', 
      details: paramParsed.error.flatten() 
    });
  }

  const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({ 
      error: 'Invalid query parameters', 
      details: queryParsed.error.flatten() 
    });
  }

  const matchId = paramParsed.data.id;
  const limit = Math.min(queryParsed.data.limit ?? MAX_LIMIT, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (error) {
    console.error('Error fetching commentary:', error);
    res.status(500).json({ error: 'An error occurred while fetching commentary' });
  }
});

/**
 * @swagger
 * /api/matches/{id}/commentary:
 *   post:
 *     summary: Create a new commentary entry for a match
 *     tags: [Commentary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentaryInput'
 *     responses:
 *       201:
 *         description: Commentary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Commentary'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
commentaryRouter.post('/:id/commentary', async (req, res) => {
  const paramParsed = matchIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res.status(400).json({ 
      error: 'Invalid match ID', 
      details: paramParsed.error.flatten() 
    });
  }

  const bodyParsed = createCommentarySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ 
      error: 'Invalid commentary data', 
      details: bodyParsed.error.flatten() 
    });
  }

  const matchId = paramParsed.data.id;
  const { minute, sequence, period, eventType, actor, team, message, metadata, tags } = bodyParsed.data;

  try {
    const [newCommentary] = await db.insert(commentary).values({
      matchId,
      minute,
      sequence,
      period,
      eventType,
      actor: actor || '',
      team: team || '',
      message,
      metadata: metadata || null,
      tags: tags || [],
    }).returning();

    res.status(200).json({ data: newCommentary });
  } catch (error) {
    console.error('Error creating commentary:', error);
    res.status(500).json({ error: 'An error occurred while creating the commentary' });
  }
});