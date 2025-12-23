# Setting to a different base image to secure your container supply chain.
ARG REGISTRY=mcr.microsoft.com
ARG BASE_IMAGE=$REGISTRY/devcontainers/javascript-node:24-bookworm

FROM $BASE_IMAGE

ENV PORT=80
ENV PORTS=443
EXPOSE 80
EXPOSE 443
WORKDIR /var/web/
ENTRYPOINT ["node", "./index.js"]

ADD serve-test.json /var/web/serve.json
ADD packages/test/web-server/dist/index.js /var/web/
RUN echo {}>/var/web/package.json
