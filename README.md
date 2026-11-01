# Daily Timesheet

Personal Next.js app for logging daily work tasks, generating Excel timesheets, creating Gmail drafts, and browsing timesheet history.

## Features

- **Login** — single-user auth via env credentials and signed session cookie
- **Daily Tasks** (`/tasks`) — add, edit, delete multiple tasks per work date (paginated ledger)
- **Timesheet workflow** — preview rows, download `.xlsx` from the Excel template, create a Gmail draft with the workbook attached
- **Timesheet History** (`/timesheet`) — list days with tasks, filter by date range (debounced), paginate, preview in modal, download

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- MongoDB (Mongoose)
- ExcelJS (workbook generation)
- Google APIs (Gmail OAuth draft)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env example and fill values:

```bash
cp .env.example .env.local
```

Required variables (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `AUTH_USERNAME` / `AUTH_PASSWORD` | Login credentials |
| `AUTH_SECRET` | Session / OAuth state signing secret |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Gmail OAuth |
| `GOOGLE_REDIRECT_URI` | OAuth callback (default `http://localhost:3000/api/gmail/callback`) |
| `GMAIL_DEFAULT_TO` | Default draft recipient |

3. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run db:ping` | Verify MongoDB connection (uses `.env.local`) |

## Project layout

```
src/
  app/                 # Routes & API (tasks, timesheet, gmail, auth)
  features/
    auth/              # Login & session
    tasks/             # Daily task CRUD UI + service
    timesheet/         # History page, workbook helpers
    gmail/             # OAuth + draft creation
  shared/              # UI shell, Mongo helper
docs/                  # Design HTML mocks & FR notes
docs/templates/        # Excel timesheet template
```

## Notes

- Timesheets are generated on demand from task records (no separate timesheet store).
- History lists one row per `workDate` that has tasks; date filters debounce before refetching.
- Keep secrets in `.env.local` only — it is gitignored. Commit `.env.example` as the template.
