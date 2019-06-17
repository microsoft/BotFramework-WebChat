# This container is for simplifying CI when using Azure Pipelines

# The first builder image will build HTML and JavaScript code out of the create-react-app project
FROM node:12 AS builder-web
WORKDIR /var/web/

# Copy the web app code to /var/web/
# We excluded /.env and /node_modules/ via .dockerignore
ADD app/ /var/web/

# Doing a fresh "npm install" on build to make sure the image is reproducible
RUN npm ci

# Build the web app code via create-react-app and react-scripts
RUN npm run build

# The second builder image will aggregate all code into a single Docker image for export
FROM node:12

# Copy the bot code to /var/bot/
ADD bot/ /var/bot/

# Copy the web server code to /var/web/
ADD rest-api/ /var/web/

# Copy SSH configuration and startup script to /var/
ADD sshd_config /var/
ADD startup.sh /var/

# Copy static React app to /var/web/public/, to be consumed by web server
COPY --from=builder-web /var/web/build/ /var/web/public/

# Doing a fresh "npm install" on build to make sure the image is reproducible
WORKDIR /var/bot/
RUN npm ci

# Doing a fresh "npm install" on build to make sure the image is reproducible
WORKDIR /var/web/
RUN npm ci

# Pack "concurrently" to make sure the image is reproducible
WORKDIR /var/
RUN npm install concurrently@4.1.0

# Pack the build content as a "build.tgz" and export it out
RUN tar -cf build.tgz bot node_modules sshd_config startup.sh web
