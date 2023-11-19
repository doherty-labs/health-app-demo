#!/usr/bin/env bash
set -e
cd ./django
python manage.py migrate
rm -rf ./staticfiles
python manage.py collectstatic --noinput

if [ "$DJANGO_HOT_RELOAD" = "true" ]
then  
    exec python manage.py runserver 0.0.0.0:8000
else
    exec gunicorn django_project.wsgi:application --bind 0.0.0.0:8000
fi

