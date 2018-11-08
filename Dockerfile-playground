FROM node:alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh

ENV PORT=80
EXPOSE 80
RUN npm install serve@10.0.0 -g
ENTRYPOINT ["npx", "--no-install", "serve", "-p", "80", "/web/packages/playground/build"]

ADD . /web
WORKDIR /web
RUN npm install && \
    npm run bootstrap && \
    npm run build
