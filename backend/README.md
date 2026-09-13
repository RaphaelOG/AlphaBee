# AlphaBee Backend

Postgres + Fastify API for parent accounts, child profiles, progress, Practice Hive lists, streaks, and quest sessions.

## Stack

| Layer | Tech |
|--------|------|
| Database | PostgreSQL 16 (Docker) |
| ORM | Prisma |
| API | Fastify + Zod |
| Auth | Parent email/password → JWT (kids never log in) |

## Quick start

**Postgres options**
1. **Homebrew** (used on this machine): `brew install postgresql@16 && brew services start postgresql@16 && createdb alphabee`
2. **Docker**: `npm run db:up` (needs Docker Desktop)

```bash
cd backend
cp .env.example .env   # if needed — set DATABASE_URL for your Postgres
npm install
npm run db:push        # create tables
npm run db:generate
npm run dev            # API on http://localhost:4000
```

If you use Docker instead, set:
`DATABASE_URL="postgresql://alphabee:alphabee@localhost:5432/alphabee?schema=public"`


Health check: [http://localhost:4000/health](http://localhost:4000/health)

## Data model (COPPA-friendly)

- **Parent** — adult account (email + password)
- **Child** — nickname, grade, optional active curriculum unit (minimal PII)
- **ChildProgress** — honey / stars / words mastered / quests completed
- **WordMastery** — per-word learning status for spaced practice
- **DailyStreak** — synced streak across devices
- **GameSession** — completed quests (5 / 10 / 15 word goals)
- **CustomList** — saved Practice Hive word lists
- **CustomListAssignment** — which children can use a list

## API overview

All child/list/progress routes require:

```http
Authorization: Bearer <parent_jwt>
```

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/register` | Create parent account |
| POST | `/auth/login` | Login → JWT |
| GET | `/auth/me` | Current parent |
| GET/POST | `/children` | List / create child profiles |
| GET/PATCH/DELETE | `/children/:id` | Manage a child |
| GET | `/children/:id/progress` | Hive totals |
| POST | `/children/:id/progress/apply` | Increment honey/stars/etc. |
| GET/POST | `/children/:id/mastery` | Word mastery |
| GET/POST | `/children/:id/streak` (+ `/complete`) | Daily streak |
| GET/POST | `/children/:id/sessions` | Quest history / save completion |
| GET/POST | `/lists` | Practice Hive lists |
| GET | `/children/:id/lists` | Lists assigned to a child |

### Example: register + create child

```bash
curl -s -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"parent@example.com","password":"password123","displayName":"Alex"}'

# use returned token:
curl -s -X POST http://localhost:4000/children \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"nickname":"Sam","gradeLevel":"1"}'
```

### Example: save a completed quest

```bash
curl -s -X POST http://localhost:4000/children/$CHILD_ID/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "mode":"quest",
    "questId":"classic",
    "questTitle":"Honey Hunt",
    "wordGoal":10,
    "wordsCompleted":10,
    "honeyEarned":18,
    "starsEarned":10,
    "gradeLevel":"1",
    "unitId":"1-digraph-sh-ch",
    "applyRewards":true
  }'
```

## Expo app client

The mobile app talks to this API via `src/api/`:

```ts
import { authApi, childrenApi, sessionsApi } from '../api';
```

Set `EXPO_PUBLIC_API_URL` for a physical device (your computer’s LAN IP).

## Production notes

- Change `JWT_SECRET` and Postgres password
- Put the API behind HTTPS
- Consider moving auth to Supabase Auth later while keeping this schema
- Add rate limiting and stronger password rules before public launch
