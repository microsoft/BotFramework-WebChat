# Setting to a different base image to secure your container supply chain.
ARG REGISTRY=mcr.microsoft.com
ARG BASE_IMAGE=$REGISTRY/devcontainers/javascript-node:24-bookworm

FROM $BASE_IMAGE

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh

ENV PORT=80
EXPOSE 80
RUN npm install serve@11.3.0 -g
WORKDIR /var/web/
ENTRYPOINT ["npx", "--no-install", "serve", "-c", "serve-test.json", "-p", "80", "/var/web/"]

ADD serve-test.json /var/web/
RUN echo {}>/var/web/package.json
