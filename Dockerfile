FROM node:6.9

MAINTAINER guillermo.ponce@wizeline.com

RUN mkdir -p /usr/local/webchat

WORKDIR /usr/local/webchat

# Installs NGINX to support HTTPS native
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
RUN apt-get update
RUN apt-get install apt-transport-https ca-certificates nginx -y

# Copy the Project
COPY . .

# Installs npm dependencies here
ENV NPM_CONFIG_LOGLEVEL warn
RUN while true; do npm install && break; done
RUN npm run build


# Adds nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Exposing 80 port
EXPOSE 80

# Creates entrypoint
RUN chmod +x /usr/local/webchat/start-services.sh
CMD ["/usr/local/webchat/start-services.sh"]
