FROM node:alpine
WORKDIR /usr/src/app

ENV PORT=80
COPY api/package.json api/yarn.lock ./
RUN yarn install

COPY api/dist .
COPY app/public public
RUN mkdir store

CMD ["node", "main.js"]
