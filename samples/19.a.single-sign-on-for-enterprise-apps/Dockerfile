# Builder is based on Node.js 12 image
# This builder image will build HTML and JavaScript code out of the create-react-app project
FROM node:12 AS builder-web
WORKDIR /var/web/

# Copy the web app code to /var/web/
# We excluded /.env and /node_modules/ via .dockerignore
ADD app/ /var/web/

# Doing a fresh "npm install" on build to make sure the image is reproducible
RUN npm ci

# Build the web app code via create-react-app and react-scripts
RUN npm run build

FROM node:12

ADD bot/ /var/bot/
ADD rest-api/ /var/web/
COPY --from=builder-web /var/web/build/ /var/web/public/

WORKDIR /var/bot/
RUN npm ci

WORKDIR /var/web/
RUN npm ci

WORKDIR /var/
RUN tar -cf build.tgz bot web

ENTRYPOINT sh
