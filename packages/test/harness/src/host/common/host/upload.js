const { join } = require('path');

module.exports = () => (element, filename) => element.sendKeys(join('/home/seluser/Downloads/', filename));
