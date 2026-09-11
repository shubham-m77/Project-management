# MngPro Frontend — Next.js + TypeScript + Tailwind + Clerk

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY from the Clerk dashboard.
# Set NEXT_PUBLIC_API_URL to your backend URL. Local development uses http://localhost:5000/api by default.
npm run dev
```

Open `http://localhost:3000`. Run the backend separately with `npm run dev`.

## Key Concepts Used

| File | Concept |
|---|---|
| `middleware.ts` | Route protection for `/dashboard` and `/projects/*` |
| `src/app/layout.tsx` | `ClerkProvider` exposes auth state across the app |
| `src/lib/api.ts` | Central typed API client for all requests |
| Server Components (`dashboard/page.tsx`, `projects/[id]/page.tsx`) | Data is fetched on the server |
| Client Components (`"use client"` — `TaskBoard.tsx`, `NewProjectForm.tsx`) | Interactive flows using React state |

## Pages
- `/` — public landing page
- `/sign-in`, `/sign-up` — Clerk authentication pages
- `/dashboard` — view and create projects
- `/projects/[id]` — kanban task board (todo/in-progress/review/done)

## Folder Structure
```
src/
├── app/          (routes)
├── components/   (reusable UI + client components)
├── lib/          (API client)
└── types/        (backend models se matching TS types)
```

## Next Steps
1. Start the backend and connect MongoDB.
2. Add real Clerk keys to the environment files.
3. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL in the frontend hosting environment.
4. Deploy the frontend to Vercel and backend to Render or Railway.

## Production URLs

- Frontend: `https://project-management-seven-iota.vercel.app`
- Backend API: `https://mngpro.onrender.com/api`

Set these deployment environment variables:

```env
# Vercel
NEXT_PUBLIC_API_URL=https://mngpro.onrender.com/api

# Render
CLIENT_URL=https://project-management-seven-iota.vercel.app
```