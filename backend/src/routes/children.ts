import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireParent } from '../middleware/auth.js';

const gradeSchema = z.enum(['K', '1', '2', '3', '4', '5']);

const createChildSchema = z.object({
  nickname: z.string().min(1).max(40),
  gradeLevel: gradeSchema.default('1'),
  avatarKey: z.string().min(1).max(40).default('bee'),
  activeUnitId: z.string().optional(),
});

const updateChildSchema = z.object({
  nickname: z.string().min(1).max(40).optional(),
  gradeLevel: gradeSchema.optional(),
  avatarKey: z.string().min(1).max(40).optional(),
  activeUnitId: z.string().nullable().optional(),
});

async function assertChildOwned(childId: string, parentId: string) {
  return prisma.child.findFirst({ where: { id: childId, parentId } });
}

export async function childrenRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireParent);

  app.get('/children', async (request) => {
    const children = await prisma.child.findMany({
      where: { parentId: request.parentId! },
      include: {
        progress: true,
        streak: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return { children };
  });

  app.post('/children', async (request, reply) => {
    const body = createChildSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const child = await prisma.child.create({
      data: {
        parentId: request.parentId!,
        nickname: body.data.nickname.trim(),
        gradeLevel: body.data.gradeLevel,
        avatarKey: body.data.avatarKey,
        activeUnitId: body.data.activeUnitId,
        progress: { create: {} },
        streak: { create: {} },
      },
      include: { progress: true, streak: true },
    });

    return reply.status(201).send({ child });
  });

  app.get('/children/:childId', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    const child = await assertChildOwned(childId, request.parentId!);
    if (!child) return reply.status(404).send({ error: 'Child not found' });

    const full = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        progress: true,
        streak: true,
        wordMastery: { orderBy: { lastSeenAt: 'desc' }, take: 50 },
        sessions: { orderBy: { completedAt: 'desc' }, take: 20 },
      },
    });

    return { child: full };
  });

  app.patch('/children/:childId', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    const owned = await assertChildOwned(childId, request.parentId!);
    if (!owned) return reply.status(404).send({ error: 'Child not found' });

    const body = updateChildSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const child = await prisma.child.update({
      where: { id: childId },
      data: {
        nickname: body.data.nickname?.trim(),
        gradeLevel: body.data.gradeLevel,
        avatarKey: body.data.avatarKey,
        activeUnitId: body.data.activeUnitId === undefined ? undefined : body.data.activeUnitId,
      },
      include: { progress: true, streak: true },
    });

    return { child };
  });

  app.delete('/children/:childId', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    const owned = await assertChildOwned(childId, request.parentId!);
    if (!owned) return reply.status(404).send({ error: 'Child not found' });

    await prisma.child.delete({ where: { id: childId } });
    return reply.status(204).send();
  });
}
