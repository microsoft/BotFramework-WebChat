# Setting to a different base image to secure your container supply chain.
ARG REGISTRY=mcr.microsoft.com
ARG BASE_IMAGE=$REGISTRY/devcontainers/javascript-node:24-bookworm

FROM $BASE_IMAGE

ENV PORT=80
EXPOSE 80
RUN npm install serve@10.0.0 -g
ENTRYPOINT ["npx", "--no-install", "serve", "-p", "80", "/var/web"]
WORKDIR /var/web

ADD ./packages/playground/build /var/web
