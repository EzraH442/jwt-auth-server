FROM node:20-bookworm

ENV NODE_ENV=PRODUCTION
ARG HC_SECRET
ENV HC_SECRET=${HC_SECRET}
ARG HC_SITEKEY
ENV HC_SITEKEY=${HC_SITEKEY}

WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
RUN npm install pm2 -g
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["pm2-runtime", "./build/index.js"]
