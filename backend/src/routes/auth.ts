import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, signToken, verifyPassword } from '../lib/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const email = body.data.email.toLowerCase().trim();
    const existing = await prisma.parent.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(body.data.password);
    const parent = await prisma.parent.create({
      data: {
        email,
        passwordHash,
        displayName: body.data.displayName ?? null,
      },
    });

    const token = signToken({ sub: parent.id, email: parent.email });
    return reply.status(201).send({
      token,
      parent: {
        id: parent.id,
        email: parent.email,
        displayName: parent.displayName,
      },
    });
  });

  app.post('/auth/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const email = body.data.email.toLowerCase().trim();
    const parent = await prisma.parent.findUnique({ where: { email } });
    if (!parent || !(await verifyPassword(body.data.password, parent.passwordHash))) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = signToken({ sub: parent.id, email: parent.email });
    return {
      token,
      parent: {
        id: parent.id,
        email: parent.email,
        displayName: parent.displayName,
      },
    };
  });

  app.get('/auth/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const parentId = request.parentId!;
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
    if (!parent) return reply.status(404).send({ error: 'Parent not found' });
    return { parent };
  });
}

async function requireAuth(request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  const { requireParent } = await import('../middleware/auth.js');
  return requireParent(request, reply);
}
