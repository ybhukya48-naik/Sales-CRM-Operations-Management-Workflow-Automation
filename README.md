# Cyond Operations Portal

Lead CRM + 30-day nurture desk MVP for Cyond (Hyderabad). Built with **Next.js (App Router)** and **Supabase (Postgres + Auth + RLS)**.

This repository ships the first vertical slice only:

- Auth + RBAC (Admin, Management, Sales, Engineer)
- Prospect / lead pipeline board
- Prospect detail (status, call log, enroll, communication timeline)
- Nurture sequences + WhatsApp message templates
- Daily tasks with WhatsApp deep-link + mark sent
- Management funnel / source dashboard
- Activity audit log
- In-repo SQL migrations + seed data

**Deferred (not in this PR):** bookings, inspections, quotes, work orders, vendors, warranty, RazorPay, n8n / Interakt automation.

---

## Quick start (demo mode — no Supabase required)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in as any seeded role on the login page.

Demo mode activates automatically when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset. Data is an in-memory seed store (fine for local review; resets on server restart).

### Seeded demo users

| Role | Email |
|------|--------|
| Admin | admin@cyond.demo |
| Management | management@cyond.demo |
| Sales | sales@cyond.demo |
| Engineer | engineer@cyond.demo |

---

## Environment variables

Copy `.env.example` to `.env.local` when wiring a live Supabase project:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | For live mode | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For live mode | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-only admin scripts — **do not commit** |

Never commit `.env*` files or secrets.

---

## Database migrations

SQL lives under `supabase/`:

1. `supabase/migrations/20260331000001_init_schema.sql` — tables, enums, triggers, role helpers
2. `supabase/migrations/20260331000002_rls_policies.sql` — Row Level Security for all MVP tables
3. `supabase/seed.sql` — lead sources, templates, 30-day sequence steps

### Apply with Supabase CLI

```bash
# Install CLI: https://supabase.com/docs/guides/cli
npx supabase start          # local Postgres + Auth
npx supabase db reset       # apply migrations + seed.sql
```

### Apply to a hosted project

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
# then run supabase/seed.sql in the SQL editor (or supabase db seed)
```

After migrations, create Auth users in the Supabase dashboard (or Admin API). The `handle_new_user` trigger creates a matching `profiles` row. Set `raw_user_meta_data.role` to `admin` | `management` | `sales` | `engineer` on invite if needed.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

---

## Project structure

```
src/
  app/
    (auth)/login/          # Login (demo role picker or Supabase password)
    (app)/pipeline/        # Kanban pipeline
    (app)/prospects/[id]/ # Prospect detail
    (app)/tasks/           # Daily WhatsApp nurture queue
    (app)/nurture/         # Sequences + templates
    (app)/dashboard/       # Funnel + source conversion
    (app)/users/           # Admin user/role management
    actions/               # Server actions (auth + CRM)
  components/              # UI for pipeline, tasks, dashboard, shell
  lib/
    auth/                  # Session + RBAC helpers
    data/                  # Seed + mock store + repository
    supabase/              # Browser/server clients
    types/                 # Shared domain types
supabase/
  migrations/              # Reviewable schema + RLS
  seed.sql
```

---

## RBAC summary

| Capability | Admin | Management | Sales | Engineer |
|------------|:-----:|:----------:|:-----:|:--------:|
| Pipeline view | ✓ | ✓ | ✓ | ✓ |
| Edit CRM / calls | ✓ | ✓ | ✓ | |
| Send nurture tasks | ✓ | | ✓ | |
| Dashboard | ✓ | ✓ | ✓ | |
| Manage users | ✓ | | | |

Engineer access is intentionally limited in this slice (ops modules are deferred).

---

## WhatsApp deep-links

Daily tasks build `https://wa.me/<digits>?text=<prefilled>` URLs. The team opens WhatsApp, sends the message, then clicks **Mark sent** to write the communication + activity log.

Automation via n8n / Interakt is explicitly out of scope for MVP.
