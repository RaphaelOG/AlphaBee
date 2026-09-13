import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireParent } from '../middleware/auth.js';

function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function yesterdayKey(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const start = Date.UTC(ay, am - 1, ad);
  const end = Date.UTC(by, bm - 1, bd);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

async function assertChildOwned(childId: string, parentId: string) {
  return prisma.child.findFirst({ where: { id: childId, parentId } });
}

const completeSchema = z.object({
  /** Client local calendar date YYYY-MM-DD */
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function streakRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireParent);

  app.get('/children/:childId/streak', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    if (!(await assertChildOwned(childId, request.parentId!))) {
      return reply.status(404).send({ error: 'Child not found' });
    }

    let streak = await prisma.dailyStreak.upsert({
      where: { childId },
      create: { childId },
      update: {},
    });

    const today = todayKey();
    const last = streak.lastCompletedDate;
    let currentStreak = streak.currentStreak;
    if (last && last !== today && daysBetween(last, today) > 1) {
      currentStreak = 0;
      streak = await prisma.dailyStreak.update({
        where: { childId },
        data: { currentStreak: 0 },
      });
    }

    return {
      streak: {
        ...streak,
        currentStreak,
        completedToday: last === today,
      },
    };
  });

  app.post('/children/:childId/streak/complete', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    if (!(await assertChildOwned(childId, request.parentId!))) {
      return reply.status(404).send({ error: 'Child not found' });
    }

    const body = completeSchema.safeParse(request.body ?? {});
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const today = body.data.localDate ?? todayKey();
    const existing = await prisma.dailyStreak.upsert({
      where: { childId },
      create: { childId },
      update: {},
    });

    if (existing.lastCompletedDate === today) {
      return {
        streak: {
          ...existing,
          completedToday: true,
        },
      };
    }

    const continued = existing.lastCompletedDate === yesterdayKey(new Date(`${today}T12:00:00`));
    const nextStreak = continued ? existing.currentStreak + 1 : 1;
    const longestStreak = Math.max(existing.longestStreak, nextStreak);

    const streak = await prisma.dailyStreak.update({
      where: { childId },
      data: {
        currentStreak: nextStreak,
        longestStreak,
        lastCompletedDate: today,
      },
    });

    return {
      streak: {
        ...streak,
        completedToday: true,
      },
    };
  });
}
