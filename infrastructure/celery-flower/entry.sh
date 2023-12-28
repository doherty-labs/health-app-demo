#!/usr/bin/env bash
set -e
cd ./django/
exec celery -A django_project flower --address=0.0.0.0 --port=5555 --basic_auth=$FLOWER_USER:$FLOWER_PASSWORD
