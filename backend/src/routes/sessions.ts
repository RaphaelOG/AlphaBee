import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireParent } from '../middleware/auth.js';

async function assertChildOwned(childId: string, parentId: string) {
  return prisma.child.findFirst({ where: { id: childId, parentId } });
}

const sessionSchema = z.object({
  mode: z.enum(['quest', 'practice']),
  questId: z.string().optional(),
  questTitle: z.string().optional(),
  wordGoal: z.number().int().positive(),
  wordsCompleted: z.number().int().nonnegative(),
  honeyEarned: z.number().int().nonnegative().default(0),
  starsEarned: z.number().int().nonnegative().default(0),
  gradeLevel: z.string().optional(),
  unitId: z.string().optional(),
  customListId: z.string().optional(),
  /** If true, also bump aggregate progress + streak */
  applyRewards: z.boolean().default(true),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function sessionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireParent);

  app.get('/children/:childId/sessions', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    if (!(await assertChildOwned(childId, request.parentId!))) {
      return reply.status(404).send({ error: 'Child not found' });
    }

    const sessions = await prisma.gameSession.findMany({
      where: { childId },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    return { sessions };
  });

  app.post('/children/:childId/sessions', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    if (!(await assertChildOwned(childId, request.parentId!))) {
      return reply.status(404).send({ error: 'Child not found' });
    }

    const body = sessionSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const data = body.data;

    const session = await prisma.gameSession.create({
      data: {
        childId,
        mode: data.mode,
        questId: data.questId,
        questTitle: data.questTitle,
        wordGoal: data.wordGoal,
        wordsCompleted: data.wordsCompleted,
        honeyEarned: data.honeyEarned,
        starsEarned: data.starsEarned,
        gradeLevel: data.gradeLevel,
        unitId: data.unitId,
        customListId: data.customListId,
      },
    });

    if (data.applyRewards) {
      await prisma.childProgress.upsert({
        where: { childId },
        create: {
          childId,
          honeyTotal: data.honeyEarned,
          starsTotal: data.starsEarned,
          wordsMastered: data.wordsCompleted,
          questsCompleted: 1,
        },
        update: {
          honeyTotal: { increment: data.honeyEarned },
          starsTotal: { increment: data.starsEarned },
          wordsMastered: { increment: data.wordsCompleted },
          questsCompleted: { increment: 1 },
        },
      });

      // Streak update (same rules as /streak/complete)
      const today = data.localDate ?? new Date().toISOString().slice(0, 10);
      const existing = await prisma.dailyStreak.upsert({
        where: { childId },
        create: { childId },
        update: {},
      });

      if (existing.lastCompletedDate !== today) {
        const yesterday = new Date(`${today}T12:00:00`);
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        const continued = existing.lastCompletedDate === yKey;
        const nextStreak = continued ? existing.currentStreak + 1 : 1;
        await prisma.dailyStreak.update({
          where: { childId },
          data: {
            currentStreak: nextStreak,
            longestStreak: Math.max(existing.longestStreak, nextStreak),
            lastCompletedDate: today,
          },
        });
      }
    }

    return reply.status(201).send({ session });
  });
}
