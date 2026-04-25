.PHONY: up test-backend test-frontend test-e2e

up:
	docker compose up --build

test-backend:
	docker compose -f backend/docker-compose.test.yml up -d
	docker compose -f backend/docker-compose.test.yml exec -T web python manage.py migrate
	docker compose -f backend/docker-compose.test.yml exec -T web python manage.py test
	docker compose -f backend/docker-compose.test.yml down

test-frontend:
	cd frontend && pnpm install && pnpm test

test-e2e:
	cd e2e-web && pnpm install && pnpm test
