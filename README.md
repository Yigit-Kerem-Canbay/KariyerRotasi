# Kariyer Rotası (Monorepo)

Bu repo 3 servisten oluşur:

- `frontend`: Next.js (React, TypeScript, Tailwind)
- `backend`: NestJS (TypeScript, Prisma, PostgreSQL, JWT)
- `ai-service`: FastAPI (Python)

## Gerekli Araçlar

- Node.js (LTS)
- Python 3.11+

## Frontend (Next.js)

```bash
cd frontend
npm i
npm run dev
```

## Backend (NestJS)

Backend API prefix: `/api`

### Environment

```bash
cd backend
copy .env.example .env
```

### Prisma

Önce local PostgreSQL içinde `kariyerrotasi` isimli bir veritabanı oluştur.

Ardından migrasyon ve client:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Run

```bash
cd backend
npm run start:dev
```

Auth endpointleri:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me` (Bearer token)

## AI Service (FastAPI)

```bash
cd ai-service
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

