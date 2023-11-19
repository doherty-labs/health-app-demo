FROM node:19
ARG NEXT_PUBLIC_DATADOG_VERSION
ENV NEXT_PUBLIC_DATADOG_VERSION=${NEXT_PUBLIC_DATADOG_VERSION}
WORKDIR /usr/src/app

COPY ./web-app/internal/package*.json ./
COPY ./web-app/internal/yarn.lock ./

RUN yarn install

EXPOSE 3000
EXPOSE 6006
COPY ./web-app/internal/ ./
RUN npm run build

CMD ["npm", "start"]
