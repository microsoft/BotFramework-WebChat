# https://github.com/SeleniumHQ/docker-selenium
# https://hub.docker.com/r/selenium/standalone-chrome/tags/

FROM selenium/node-chrome:110.0

ADD __tests__/html/assets/uploads /home/seluser/Downloads
ADD __tests__/setup/local /home/seluser/Downloads
