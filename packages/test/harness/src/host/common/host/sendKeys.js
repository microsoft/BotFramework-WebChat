const { Key } = require('selenium-webdriver');

const KeyMap = new Map(Object.entries(Key));

const KEY_DOWN_PATTERN = /^\+(.*)/u;
const KEY_UP_PATTERN = /^\+(.*)/u;

module.exports = webDriver =>
  function sendKeys(...keys) {
    return keys
      .reduce((actions, key) => {
        const keyDownMatch = KEY_DOWN_PATTERN.exec(key);

        if (keyDownMatch) {
          const keyDown = KeyMap.get(keyDownMatch[1]);

          if (keyDown) {
            return actions.keyDown(keyDown);
          }
        }

        const keyUpMatch = KEY_UP_PATTERN.exec(key);

        if (keyUpMatch) {
          const keyUp = KeyMap.get(keyUpMatch[1]);

          if (keyUp) {
            return actions.keyUp(keyUp);
          }
        }

        const keyToSend = KeyMap.get(key);

        if (keyToSend) {
          return actions.sendKeys(keyToSend);
        }

        return actions.sendKeys(key);
      }, webDriver.actions())
      .perform();
  };
