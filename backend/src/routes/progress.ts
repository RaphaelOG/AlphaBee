import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireParent } from '../middleware/auth.js';

async function assertChildOwned(childId: string, parentId: string) {
  return prisma.child.findFirst({ where: { id: childId, parentId } });
}

const masteryUpsertSchema = z.object({
  word: z.string().min(1).max(64),
  gradeLevel: z.string().optional(),
  unitId: z.string().optional(),
  correct: z.boolean(),
  markMastered: z.boolean().optional(),
});

const progressPatchSchema = z.object({
  honeyDelta: z.number().int().optional(),
  starsDelta: z.number().int().optional(),
  wordsMasteredDelta: z.number().int().optional(),
  questsCompletedDelta: z.number().int().optional(),
});

export async function progressRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireParent);

  app.get('/children/:childId/progress', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    if (!(await assertChildOwned(childId, request.parentId!))) {
      return reply.status(404).send({ error: 'Child not found' });
    }

    const progress = await prisma.childProgress.upsert({
      where: { childId },
      create: { childId },
      update: {},
    });

    return { progress };
  });

  app.post('/children/:childId/progress/apply', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    if (!(await assertChildOwned(childId, request.parentId!))) {
      return reply.status(404).send({ error: 'Child not found' });
    }

    const body = progressPatchSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const progress = await prisma.childProgress.upsert({
      where: { childId },
      create: {
        childId,
        honeyTotal: Math.max(0, body.data.honeyDelta ?? 0),
        starsTotal: Math.max(0, body.data.starsDelta ?? 0),
        wordsMastered: Math.max(0, body.data.wordsMasteredDelta ?? 0),
        questsCompleted: Math.max(0, body.data.questsCompletedDelta ?? 0),
      },
      update: {
        honeyTotal: { increment: body.data.honeyDelta ?? 0 },
        starsTotal: { increment: body.data.starsDelta ?? 0 },
        wordsMastered: { increment: body.data.wordsMasteredDelta ?? 0 },
        questsCompleted: { increment: body.data.questsCompletedDelta ?? 0 },
      },
    });

    return { progress };
  });

  app.get('/children/:childId/mastery', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    if (!(await assertChildOwned(childId, request.parentId!))) {
      return reply.status(404).send({ error: 'Child not found' });
    }

    const mastery = await prisma.wordMastery.findMany({
      where: { childId },
      orderBy: [{ status: 'asc' }, { lastSeenAt: 'desc' }],
    });

    return { mastery };
  });

  app.post('/children/:childId/mastery', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    if (!(await assertChildOwned(childId, request.parentId!))) {
      return reply.status(404).send({ error: 'Child not found' });
    }

    const body = masteryUpsertSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const word = body.data.word.trim().toLowerCase();
    const existing = await prisma.wordMastery.findUnique({
      where: { childId_word: { childId, word } },
    });

    const correctCount = (existing?.correctCount ?? 0) + (body.data.correct ? 1 : 0);
    const incorrectCount = (existing?.incorrectCount ?? 0) + (body.data.correct ? 0 : 1);
    const shouldMaster = body.data.markMastered || correctCount >= 2;
    const status = shouldMaster ? 'mastered' : correctCount > 0 ? 'practicing' : 'learning';

    const mastery = await prisma.wordMastery.upsert({
      where: { childId_word: { childId, word } },
      create: {
        childId,
        word,
        gradeLevel: body.data.gradeLevel,
        unitId: body.data.unitId,
        correctCount: body.data.correct ? 1 : 0,
        incorrectCount: body.data.correct ? 0 : 1,
        status,
        masteredAt: status === 'mastered' ? new Date() : null,
      },
      update: {
        gradeLevel: body.data.gradeLevel ?? undefined,
        unitId: body.data.unitId ?? undefined,
        correctCount,
        incorrectCount,
        status,
        lastSeenAt: new Date(),
        masteredAt: status === 'mastered' ? existing?.masteredAt ?? new Date() : existing?.masteredAt,
      },
    });

    return { mastery };
  });
}
