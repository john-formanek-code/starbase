FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production

COPY . .

# Install docker and docker-compose to run lab.sh
RUN apk add --no-cache docker-cli docker-cli-compose bash

EXPOSE 3001
CMD ["node", "index.js"]
