FROM node:19
ARG NEXT_PUBLIC_DATADOG_VERSION
ENV NEXT_PUBLIC_DATADOG_VERSION=${NEXT_PUBLIC_DATADOG_VERSION}
WORKDIR /usr/src/app

COPY ./web-app/customer/package*.json ./
COPY ./web-app/customer/yarn.lock ./

RUN yarn install

EXPOSE 3000
EXPOSE 6006
COPY ./web-app/customer/ ./
RUN npm run build

CMD ["npm", "start"]
