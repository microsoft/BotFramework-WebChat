# Setting to a different base image to secure your container supply chain.
ARG REGISTRY=mcr.microsoft.com
ARG BASE_IMAGE=$REGISTRY/devcontainers/javascript-node:24-bookworm

FROM $BASE_IMAGE

ENV SANDBOX_PORT=80
ENV SANDBOX_PORTS=443
EXPOSE 80
EXPOSE 443
WORKDIR /var/web/packages/modelcontextprotocol-ext-apps-sandbox/
ENTRYPOINT ["node", "--experimental-strip-types", "./serve.ts"]
