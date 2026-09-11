# NOVA Backend — TypeScript + Express + MongoDB + Clerk

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev      # ts-node-dev, direct .ts run karta hai (hot reload)
```

Production:
```bash
npm run build     # dist/ me compiled JS banega
npm start          # dist/server.js chalega
```

## TypeScript-specific files
| File | Kyun zaroori hai |
|---|---|
| `tsconfig.json` | Compiler settings — strict mode, output folder |
| `src/types/express.d.ts` | `req.user` ko Express ke Request type mein add karta hai |
| `src/models/*.ts` | Har model ka `interface` (IUser, IProject, ITask) — shape define karta hai |

## Request Flow
1. Frontend Clerk token bhejta hai (`Authorization: Bearer <token>`)
2. `clerkMiddleware()` → `protect` (verify) → `attachUser` (Mongo se link) → controller

## API Endpoints
Same as before — `/api/users/me`, `/api/projects`, `/api/tasks` (full CRUD).
Poora route table pehle diye README mein hai — logic unchanged, sirf typed.

## Next Steps
Next.js frontend (TypeScript + Tailwind) banayenge jo ye APIs consume karega.