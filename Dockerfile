FROM node:21-alpine As dev

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:21-alpine as prod

ARG NODE_ENV=prod
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=prod

COPY . .

COPY --from=dev /usr/src/app/dist ./dist

ENV SERVER_PORT=${SERVER_PORT:-1313}
EXPOSE ${SERVER_PORT}

CMD ["node", "dist/main"]
