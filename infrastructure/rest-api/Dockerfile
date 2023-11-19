FROM python:3.11.2

EXPOSE 8000
ENV DEBIAN_FRONTEND noninteractive
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  POETRY_VERSION=1.4.1

RUN pip install "poetry==$POETRY_VERSION"

WORKDIR /usr/src/app
COPY ./api/django_project/poetry.lock ./api/django_project/pyproject.toml /usr/src/app/

RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi

WORKDIR /usr/src/app
COPY ./infrastructure/rest-api/entry.sh ./
RUN mkdir -p /logs/

COPY ./api/django_project ./django
RUN ["chmod", "+x", "./entry.sh"]
ENTRYPOINT ["./entry.sh"]
