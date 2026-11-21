FROM node:22-alpine

RUN apk add --no-cache docker-cli docker-cli-compose bash

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./

ENV HOST_ROOT=/host
ENV PORT=3001
EXPOSE 3001
CMD ["node", "index.js"]
