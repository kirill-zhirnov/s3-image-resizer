FROM node:16-alpine as builder
RUN apk add --update --no-cache file imagemagick
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json yarn.lock ./
USER node
RUN yarn install
COPY --chown=node:node . .
RUN yarn build
CMD ["yarn", "start"]
EXPOSE 3010