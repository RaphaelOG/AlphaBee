import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.js';
import { childrenRoutes } from './routes/children.js';
import { progressRoutes } from './routes/progress.js';
import { streakRoutes } from './routes/streaks.js';
import { sessionRoutes } from './routes/sessions.js';
import { listsRoutes } from './routes/lists.js';
import { prisma } from './lib/prisma.js';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(',') ?? true,
  });

  app.get('/health', async () => ({
    ok: true,
    service: 'alphabee-api',
    time: new Date().toISOString(),
  }));

  await app.register(authRoutes);
  await app.register(childrenRoutes);
  await app.register(progressRoutes);
  await app.register(streakRoutes);
  await app.register(sessionRoutes);
  await app.register(listsRoutes);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`AlphaBee API listening on http://${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
