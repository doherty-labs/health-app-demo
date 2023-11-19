#!/usr/bin/env bash
set -e
cd ./django
python manage.py migrate
python manage.py collectstatic --clear --noinput

echo "Starting celery scheduler"
exec celery -A django_project --beat --scheduler django_celery_beat.schedulers:DatabaseScheduler -l info --pidfile=/tmp/celery-beat.pid
