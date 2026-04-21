# Pinit

A Pinterest-like platform for discovering, creating, and organizing pins on boards.

## Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | Next.js 14, React 18, TypeScript, pnpm    |
| Backend  | Django 5, Django REST Framework, Python 3 |
| Database | PostgreSQL 13                             |
| Storage  | AWS S3 (pin images)                       |

## Running locally

The recommended way is Docker Compose, which starts the database, backend, and frontend together:

```bash
cp .env.example .env   # fill in S3 credentials if needed
docker compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

### Without Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (separate terminal)
cd frontend
pnpm install
pnpm dev
```

## Project structure

```
pinit/
├── backend/    # Django REST API
└── frontend/   # Next.js app
```

## License

Apache 2.0 — see [LICENSE](LICENSE).
