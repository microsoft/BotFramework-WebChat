FROM node:alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh

ENV PORT=80
EXPOSE 80
WORKDIR /var/jestserver/
ENTRYPOINT ["node", "src/host/jestserver/"]

ADD package*.json /var/jestserver/
RUN npm ci

ADD . /var/jestserver/
