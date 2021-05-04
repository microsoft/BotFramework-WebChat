FROM node:alpine

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
