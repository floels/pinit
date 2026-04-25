.PHONY: up up-backend test-backend test-frontend test-e2e

up:
	docker compose up --build

up-backend:
	$(MAKE) -C backend up

test-backend:
	$(MAKE) -C backend test

test-frontend:
	pnpm --dir frontend install && pnpm --dir frontend test

test-e2e:
	pnpm --dir e2e-tests-web install && pnpm --dir e2e-tests-web test
