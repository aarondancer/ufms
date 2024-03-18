FROM --platform=$BUILDPLATFORM node:lts-alpine as builder
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . ./
RUN yarn build:prod

FROM --platform=$TARGETPLATFORM node:lts-alpine as deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM --platform=$TARGETPLATFORM node:lts-alpine
ARG PORT=4000
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY --from=builder dist /usr/src/app/dist
COPY --from=deps node_modules /usr/src/app/node_modules
COPY . /usr/src/app
EXPOSE $PORT
CMD [ "yarn", "start:prod" ]
