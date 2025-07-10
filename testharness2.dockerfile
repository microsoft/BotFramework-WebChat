# Setting to a different base image to secure your container supply chain.
ARG REGISTRY=docker.io
ARG BASE_IMAGE=$REGISTRY/node:18-alpine

FROM $BASE_IMAGE

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh

ENV PORT=80
ENV PORTS=443
EXPOSE 80
EXPOSE 443
WORKDIR /var/web/
ENTRYPOINT ["node", "./index.js"]

ADD serve-test.json /var/web/serve.json
ADD packages/test/web-server/dist/index.js /var/web/
RUN echo {}>/var/web/package.json
WORKDIR /var/web/
RUN npm i @ast-grep/napi@0.38.6
