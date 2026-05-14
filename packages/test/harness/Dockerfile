# Setting to a different base image to secure your container supply chain.
ARG REGISTRY=mcr.microsoft.com
ARG BASE_IMAGE=$REGISTRY/devcontainers/javascript-node:24-bookworm

FROM $BASE_IMAGE

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh

ENV PORT=80
EXPOSE 80
WORKDIR /var/jest-server/
ENTRYPOINT ["node", "src/host/jest-server/"]

ADD package*.json /var/jest-server/
RUN npm ci

ADD . /var/jest-server/
