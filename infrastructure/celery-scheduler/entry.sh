#!/usr/bin/env bash
set -e
cd ./django
exec celery -A django_project --beat --scheduler django_celery_beat.schedulers:DatabaseScheduler -l info --pidfile=/tmp/celery-beat.pid
