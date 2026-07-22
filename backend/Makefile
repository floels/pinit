.PHONY: up test compile-deps

up:
	docker compose -f ../docker-compose.local.yml up --build --detach db moto s3_cors_proxy elasticsearch backend

# Recompile the pinned, hashed lockfiles from requirements/*.in.
# Runs inside python:3.12-slim so the resolved versions and hashes match the
# deployment target regardless of the host OS. Edit the *.in files, then run this.
compile-deps:
	docker run --rm -v "$(CURDIR)/requirements:/reqs" -w /reqs \
		-e CUSTOM_COMPILE_COMMAND="make compile-deps" python:3.12-slim bash -c '\
		pip install --quiet --root-user-action=ignore pip-tools==7.4.1 && \
		pip-compile --quiet --generate-hashes --strip-extras --output-file base.txt base.in && \
		pip-compile --quiet --generate-hashes --strip-extras --output-file dev.txt dev.in'

test:
	docker compose -f docker-compose.test.yml up -d
	docker compose -f docker-compose.test.yml exec -T web python manage.py migrate
	docker compose -f docker-compose.test.yml exec -T web python manage.py test
	docker compose -f docker-compose.test.yml down
