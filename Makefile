.PHONY: up up-detached up-backend launch-backend launch-web launch-ios seed test-backend test-web test-e2e test-mobile mobile-ios

up:
	docker compose -f docker-compose.local.yml up --build

up-detached:
	docker compose -f docker-compose.local.yml up --build --detach

up-backend:
	$(MAKE) -C backend up

launch-backend:
	docker compose -f docker-compose.local.yml up --build --detach db moto s3_cors_proxy elasticsearch backend

launch-web:
	docker compose -f docker-compose.local.yml up --build --detach

launch-ios:
	docker compose -f docker-compose.local.yml up --build --detach db moto s3_cors_proxy elasticsearch backend
	corepack yarn@1.22.22 --cwd mobile install && corepack yarn@1.22.22 --cwd mobile ios

seed:
	docker compose -f docker-compose.local.yml exec backend python manage.py seed_database_local

test-backend:
	$(MAKE) -C backend test

test-web:
	pnpm --dir web install && pnpm --dir web test

test-e2e:
	pnpm --dir web install && pnpm --dir e2e-tests-web install && pnpm --dir e2e-tests-web test

# The mobile app uses Yarn Classic (v1). We pin it via Corepack so the command
# works regardless of the Yarn version on the developer's PATH.
test-mobile:
	corepack yarn@1.22.22 --cwd mobile install && corepack yarn@1.22.22 --cwd mobile jest

# Runs the Expo dev server and launches the app in the iOS simulator.
# Start the backend first (e.g. `make up`) so the app can reach the API.
mobile-ios:
	corepack yarn@1.22.22 --cwd mobile install && corepack yarn@1.22.22 --cwd mobile ios
