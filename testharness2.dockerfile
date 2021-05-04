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
ADD __tests__/html/ /var/web/__tests__/html/
ADD packages/bundle/dist/webchat-es5.js /var/web/packages/bundle/dist/
ADD packages/test/harness/dist/ /var/web/packages/test/harness/dist/
ADD packages/test/page-object/dist/ /var/web/packages/test/page-object/dist/
RUN echo {}>/var/web/package.json
