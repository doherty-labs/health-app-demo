#!/usr/bin/env bash
set -e
cd ./django/
python manage.py migrate
python manage.py collectstatic --clear --noinput

echo "Starting flower"
exec celery -A django_project flower --address=0.0.0.0 --port=5555 --basic_auth=$FLOWER_USER:$FLOWER_PASSWORD
