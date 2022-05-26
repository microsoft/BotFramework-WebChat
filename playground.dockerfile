# Setting to a different base image to secure your container supply chain.
ARG REGISTRY=docker.io
ARG BASE_IMAGE=$REGISTRY/node:18-alpine

FROM $BASE_IMAGE

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh

ENV PORT=80
EXPOSE 80
RUN npm install serve@10.0.0 -g
ENTRYPOINT ["npx", "--no-install", "serve", "-p", "80", "/var/web"]
WORKDIR /var/web

ADD ./packages/playground/build /var/web
