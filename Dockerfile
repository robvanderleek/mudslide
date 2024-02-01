FROM node:lts-bullseye-slim
ENV GIT_SSL_NO_VERIFY 1
ENV MUDSLIDE_CACHE_FOLDER /usr/src/app/cache
RUN apt-get update && apt-get install -y --no-install-recommends git
RUN git config --global url."https://github".insteadOf ssh://git@github
RUN mkdir /app
COPY . /app
WORKDIR /app 
RUN yarn install
ENTRYPOINT ["yarn", "start"]
