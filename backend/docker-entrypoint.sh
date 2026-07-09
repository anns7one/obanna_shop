#!/bin/sh
set -e

echo "Waiting for database migrations..."
alembic upgrade head

echo "Seeding catalog data (safe to re-run, it upserts)..."
python -m app.seed

echo "Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
