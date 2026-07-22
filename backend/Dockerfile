FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements/ /requirements/
RUN pip install -r /requirements/dev.txt

WORKDIR /app

COPY . /app
