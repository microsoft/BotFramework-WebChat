FROM node:alpine

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
