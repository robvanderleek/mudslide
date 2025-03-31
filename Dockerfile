FROM node:20-slim AS builder
ENV GIT_SSL_NO_VERIFY=1
RUN apt-get update && apt-get install -y --no-install-recommends git
RUN git config --global url."https://github".insteadOf ssh://git@github
RUN mkdir /app
COPY . /app
WORKDIR /app 
RUN yarn install
RUN yarn build

FROM node:20-slim AS runtime
COPY --from=builder /app /app
WORKDIR /app
ENV MUDSLIDE_CACHE_FOLDER=/usr/src/app/cache
ENTRYPOINT ["node", "./build/index.js"]
