import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireParent } from '../middleware/auth.js';

const wordArraySchema = z
  .array(z.string().min(1).max(64))
  .min(1)
  .max(100)
  .transform((words) =>
    [...new Set(words.map((w) => w.trim().toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean))],
  );

const createListSchema = z.object({
  name: z.string().min(1).max(80),
  words: wordArraySchema,
  assignChildIds: z.array(z.string()).optional(),
});

const updateListSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  words: wordArraySchema.optional(),
});

export async function listsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireParent);

  app.get('/lists', async (request) => {
    const lists = await prisma.customList.findMany({
      where: { parentId: request.parentId! },
      include: {
        assignments: { select: { childId: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { lists };
  });

  app.post('/lists', async (request, reply) => {
    const body = createListSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    if (body.data.words.length === 0) {
      return reply.status(400).send({ error: 'List must include at least one valid word' });
    }

    const childIds = body.data.assignChildIds ?? [];
    if (childIds.length > 0) {
      const owned = await prisma.child.count({
        where: { parentId: request.parentId!, id: { in: childIds } },
      });
      if (owned !== childIds.length) {
        return reply.status(400).send({ error: 'One or more children are invalid' });
      }
    }

    const list = await prisma.customList.create({
      data: {
        parentId: request.parentId!,
        name: body.data.name.trim(),
        words: body.data.words,
        assignments: childIds.length
          ? { create: childIds.map((childId) => ({ childId })) }
          : undefined,
      },
      include: { assignments: true },
    });

    return reply.status(201).send({ list });
  });

  app.get('/lists/:listId', async (request, reply) => {
    const { listId } = request.params as { listId: string };
    const list = await prisma.customList.findFirst({
      where: { id: listId, parentId: request.parentId! },
      include: { assignments: true },
    });
    if (!list) return reply.status(404).send({ error: 'List not found' });
    return { list };
  });

  app.patch('/lists/:listId', async (request, reply) => {
    const { listId } = request.params as { listId: string };
    const existing = await prisma.customList.findFirst({
      where: { id: listId, parentId: request.parentId! },
    });
    if (!existing) return reply.status(404).send({ error: 'List not found' });

    const body = updateListSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    if (body.data.words && body.data.words.length === 0) {
      return reply.status(400).send({ error: 'List must include at least one valid word' });
    }

    const list = await prisma.customList.update({
      where: { id: listId },
      data: {
        name: body.data.name?.trim(),
        words: body.data.words,
      },
      include: { assignments: true },
    });

    return { list };
  });

  app.delete('/lists/:listId', async (request, reply) => {
    const { listId } = request.params as { listId: string };
    const existing = await prisma.customList.findFirst({
      where: { id: listId, parentId: request.parentId! },
    });
    if (!existing) return reply.status(404).send({ error: 'List not found' });

    await prisma.customList.delete({ where: { id: listId } });
    return reply.status(204).send();
  });

  app.put('/lists/:listId/assignments', async (request, reply) => {
    const { listId } = request.params as { listId: string };
    const existing = await prisma.customList.findFirst({
      where: { id: listId, parentId: request.parentId! },
    });
    if (!existing) return reply.status(404).send({ error: 'List not found' });

    const body = z.object({ childIds: z.array(z.string()) }).safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const childIds = body.data.childIds;
    if (childIds.length > 0) {
      const owned = await prisma.child.count({
        where: { parentId: request.parentId!, id: { in: childIds } },
      });
      if (owned !== childIds.length) {
        return reply.status(400).send({ error: 'One or more children are invalid' });
      }
    }

    await prisma.$transaction([
      prisma.customListAssignment.deleteMany({ where: { customListId: listId } }),
      ...(childIds.length
        ? [
            prisma.customListAssignment.createMany({
              data: childIds.map((childId) => ({ customListId: listId, childId })),
            }),
          ]
        : []),
    ]);

    const list = await prisma.customList.findUnique({
      where: { id: listId },
      include: { assignments: true },
    });

    return { list };
  });

  app.get('/children/:childId/lists', async (request, reply) => {
    const { childId } = request.params as { childId: string };
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId: request.parentId! },
    });
    if (!child) return reply.status(404).send({ error: 'Child not found' });

    const lists = await prisma.customList.findMany({
      where: {
        parentId: request.parentId!,
        assignments: { some: { childId } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { lists };
  });
}
