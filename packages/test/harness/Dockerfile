# Setting to a different base image to secure your container supply chain.
ARG REGISTRY=mcr.microsoft.com
ARG BASE_IMAGE=$REGISTRY/devcontainers/javascript-node:24-bookworm

FROM $BASE_IMAGE

ENV PORT=80
EXPOSE 80
WORKDIR /var/jest-server/
ENTRYPOINT ["node", "src/host/jest-server/"]

ADD package*.json /var/jest-server/
# TODO: Should shrinkwrap and use `npm clean-install` instead
# RUN npm clean-install
RUN npm install

ADD . /var/jest-server/
