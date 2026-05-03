.PHONY: up up-detached up-backend seed test-backend test-frontend test-e2e

up:
	docker compose up --build

up-detached:
	docker compose up --build --detach

up-backend:
	$(MAKE) -C backend up

seed:
	docker compose exec backend python manage.py seed_database_local

test-backend:
	$(MAKE) -C backend test

test-frontend:
	pnpm --dir frontend install && pnpm --dir frontend test

test-e2e:
	pnpm --dir frontend install && pnpm --dir e2e-tests-web install && pnpm --dir e2e-tests-web test
