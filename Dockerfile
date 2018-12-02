FROM node:alpine
WORKDIR /usr/src/app

ENV PORT=80 NODE_ENV=production

COPY api/package.json api/yarn.lock ./
RUN yarn install --production

COPY api/dist .
COPY app/build public
RUN mkdir store

CMD ["node", "main.js"]
