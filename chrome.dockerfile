# https://github.com/SeleniumHQ/docker-selenium
# https://hub.docker.com/r/selenium/standalone-chrome/tags/

FROM selenium/node-chrome:3.141.59-zirconium
# FROM selenium/node-chrome:4.0.0-beta-3-20210426

ADD __tests__/html/assets/uploads /home/seluser/Downloads
ADD __tests__/setup/local /home/seluser/Downloads
