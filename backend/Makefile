.PHONY: up test

up:
	docker compose -f ../docker-compose.local.yml up --build --detach db moto s3_cors_proxy elasticsearch backend

test:
	docker compose -f docker-compose.test.yml up -d
	docker compose -f docker-compose.test.yml exec -T web python manage.py migrate
	docker compose -f docker-compose.test.yml exec -T web python manage.py test
	docker compose -f docker-compose.test.yml down
