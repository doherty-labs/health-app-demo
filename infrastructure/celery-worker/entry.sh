#!/usr/bin/env bash
set -e
cd ./django
python manage.py migrate
python manage.py collectstatic --clear --noinput

echo "Starting celery worker"
exec celery -A django_project worker -Q "$CELERY_QUEUE" --loglevel=info --autoscale=10,3 --scheduler django_celery_beat.schedulers:DatabaseScheduler
