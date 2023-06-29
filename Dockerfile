FROM node:20-bookworm

ENV NODE_ENV=PRODUCTION
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
RUN npm install pm2 -g
COPY . .
RUN npm run build
CMD ["pm2-runtime", "./build/index.js"]
