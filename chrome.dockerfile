# https://github.com/SeleniumHQ/docker-selenium
# https://hub.docker.com/r/selenium/standalone-chrome/tags/

# FROM selenium/node-chrome:3.141.59-zirconium
FROM selenium/node-chrome:4.0.0-beta-4-20210604

ADD __tests__/setup/local ~/Downloads
