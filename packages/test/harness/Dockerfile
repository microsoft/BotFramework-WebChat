# NPM@7 is buggy with its "postinstall" script, going back to Node.js 14 with NPM@6 for now.
FROM node:14-alpine

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
