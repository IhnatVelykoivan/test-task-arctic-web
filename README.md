# Lead Tracker

Mini-CRM for managing sales leads. Create leads, search/filter/paginate them,
open the detail page, edit fields, change status, leave comments, delete.

Stack:

- **Backend** — NestJS + Prisma + PostgreSQL, Swagger at `/api/docs`
- **Frontend** — Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Container runtime** — Docker + Docker Compose

## Repository layout

```
.
├── backend/           # NestJS API
├── frontend/          # Next.js app
├── docker-compose.yml # db + backend + frontend
└── README.md
```

## Run with Docker (recommended)

Single command — brings up Postgres, applies migrations, starts the API and
the web app:

```bash
docker compose up --build
```

URLs once it's up:

- Web app — <http://localhost:3000>
- API base — <http://localhost:3001/api>
- Swagger UI — <http://localhost:3001/api/docs>

To shut down and wipe the database volume:

```bash
docker compose down -v
```

## Run locally without Docker

You'll need Node 20+ and a Postgres instance reachable from your machine.

### Backend

```bash
cd backend
cp .env.example .env       # adjust DATABASE_URL if needed
npm install
npx prisma generate
npx prisma migrate deploy  # applies the bundled migration
npm run start:dev          # http://localhost:3001/api
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000
```

## Environment variables

### `backend/.env`

| Variable       | Purpose                                                 |
|----------------|---------------------------------------------------------|
| `DATABASE_URL` | Postgres connection string used by Prisma.              |
| `PORT`         | HTTP port the NestJS app listens on. Defaults to 3001.  |
| `FRONTEND_URL` | Origin allowed by CORS (the Next.js app).               |

### `frontend/.env.local`

| Variable               | Purpose                                                                        |
|------------------------|--------------------------------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | Public base URL of the API as seen by the browser. Must include the `/api` prefix. |

> The browser cannot resolve Docker service names like `http://backend:3001`,
> so `NEXT_PUBLIC_API_URL` must point at a host-reachable URL (the default
> `http://localhost:3001/api` works because compose maps the port to the host).

## API quick reference

Full schema is in Swagger (<http://localhost:3001/api/docs>). Smoke tests:

```bash
# List leads (with search, filter, sort, pagination)
curl 'http://localhost:3001/api/leads?page=1&limit=10&status=NEW&q=acme&sort=createdAt&order=desc'

# Create a lead
curl -X POST http://localhost:3001/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme Corp","email":"lead@acme.com","company":"Acme","status":"NEW","value":5000}'

# Update a lead (partial)
curl -X PATCH http://localhost:3001/api/leads/<lead-id> \
  -H 'Content-Type: application/json' \
  -d '{"status":"CONTACTED"}'

# Delete a lead
curl -X DELETE http://localhost:3001/api/leads/<lead-id>

# Add a comment
curl -X POST http://localhost:3001/api/leads/<lead-id>/comments \
  -H 'Content-Type: application/json' \
  -d '{"text":"Replied to follow-up email"}'

# List comments
curl http://localhost:3001/api/leads/<lead-id>/comments
```

`GET /api/leads` response shape:

```json
{
  "items": [],
  "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 1 }
}
```

Errors:

- `400` — invalid input / failed validation
- `404` — lead or comment not found

## Tests

Backend service-layer unit tests (Jest, mocked Prisma):

```bash
cd backend
npm test
```

Covers `LeadsService` (create / pagination math / status filter / case-insensitive `q`
search / sort+order / 404 on missing lead) and `CommentsService` (404 on missing
parent lead, ordering, creation).

## Production build

Through Docker (the supported path):

```bash
docker compose up --build -d
```

Manual:

```bash
# Backend
cd backend && npm install && npx prisma generate && npm run build
npx prisma migrate deploy && node dist/main.js

# Frontend
cd frontend && npm install && npm run build && npm run start
```

## What I did not finish and how I would complete it

- **No e2e/HTTP tests.** Service layer is covered by Jest unit tests; I would
  add Supertest e2e tests against an in-memory or test Postgres for the
  controller/validation surface (happy path + 400/404 cases).
- **Sorting UI.** `sort`/`order` are wired through the API and URL parser;
  the table doesn't yet have clickable headers. A small `<th>` wrapper that
  toggles the query params would close that gap.
- **Optimistic updates / toasts.** Edit and delete currently rely on
  `router.refresh()`. A small toast layer would make success/error feedback
  cleaner.
