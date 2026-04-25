.PHONY: up up-backend test-backend test-frontend test-e2e

up:
	docker compose up --build

up-backend:
	$(MAKE) -C backend up

test-backend:
	$(MAKE) -C backend test

test-frontend:
	cd frontend && pnpm install && pnpm test

test-e2e:
	cd e2e-tests-web && pnpm install && pnpm test
