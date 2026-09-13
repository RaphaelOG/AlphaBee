import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyToken, type AuthTokenPayload } from '../lib/auth.js';

export type AuthedRequest = FastifyRequest & {
  parentId: string;
  parentEmail: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    parentId?: string;
    parentEmail?: string;
  }
}

export async function requireParent(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const payload: AuthTokenPayload = verifyToken(header.slice(7));
    request.parentId = payload.sub;
    request.parentEmail = payload.email;
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}
