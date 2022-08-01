FROM node:16-alpine as builder
RUN apk add --update --no-cache file imagemagick

COPY ./.docker/cronjobs /etc/crontabs/root
ADD ./.docker/start.sh /root/start.sh
RUN chmod 0777 /root/start.sh

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
ADD ./.docker/clear_cache.sh /home/node
RUN chmod 0777 /home/node/clear_cache.sh && chown node:node /home/node/clear_cache.sh

WORKDIR /home/node/app
COPY package.json yarn.lock ./
USER node
RUN yarn install
COPY --chown=node:node . .
RUN yarn build

USER root
CMD ["/root/start.sh"]

EXPOSE 3010