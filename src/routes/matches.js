import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { matches } from '../db/schema.js';
import { getMatchStatus } from '../utils/match-status.js';
import {  createMatchSchema,  listMatchesQuerySchema,  matchIdParamSchema,  updateScoreSchema,} from '../validation/matches.js';

export const matchesRouter = Router();

const MAX_LIMIT = 100;

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: List all matches
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of matches to return
 *     responses:
 *       200:
 *         description: A list of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
matchesRouter.get('/', async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.flatten() });
  }

  const limit = Math.min(parsed.data.limit ?? MAX_LIMIT, MAX_LIMIT);

  try {

    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.json({ data});
  } catch (error) {
    console.error('Error listing matches:', error);
    res.status(500).json({ error: 'An error occurred while fetching matches' });
  }
});


/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMatchInput'
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
matchesRouter.post('/', async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
  }

  const { startTime, endTime, homeScore, awayScore } = parsed.data;

  try {
    const [event] = await db.insert(matches).values({
      ...parsed.data,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      status: getMatchStatus(startTime, endTime),
    }).returning();
    res.status(201).json({ data: event });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'An error occurred while creating the match' });
  }
});


/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get a match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
matchesRouter.get('/:id', async (req, res) => {
  const parsed = matchIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid ID', details: parsed.error.flatten() });
  }

  try {
    const [match] = await db.select().from(matches).where(eq(matches.id, parsed.data.id));
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json({ data: match });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'An error occurred while fetching the match' });
  }
});

/**
 * @swagger
 * /api/matches/{id}/score:
 *   patch:
 *     summary: Update the score of a match
 *     tags: [Matches]
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
 *             $ref: '#/components/schemas/UpdateScoreInput'
 *     responses:
 *       200:
 *         description: Score updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
matchesRouter.patch('/:id/score', async (req, res) => {
  const paramParsed = matchIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res.status(400).json({ error: 'Invalid ID', details: paramParsed.error.flatten() });
  }

  const bodyParsed = updateScoreSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: 'Invalid score data', details: bodyParsed.error.flatten() });
  }

  try {
    const [updated] = await db
      .update(matches)
      .set({ homeScore: bodyParsed.data.homeScore, awayScore: bodyParsed.data.awayScore })
      .where(eq(matches.id, paramParsed.data.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json({ data: updated });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ error: 'An error occurred while updating the score' });
  }
});