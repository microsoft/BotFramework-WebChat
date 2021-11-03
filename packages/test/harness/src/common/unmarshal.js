// This file will run in both browser and host (Jest or Node.js).
/* eslint-env browser */

const SeleniumWebDriver = require('selenium-webdriver');

// "selenium-webdriver" is undefined if running under browser.
const { WebElement } = SeleniumWebDriver || {};

// Unformat a JavaScript object from another format received over the Web Driver protocol.
module.exports = function unmarshal(value) {
  if (!value) {
    return value;
  } else if (typeof window !== 'undefined' && value instanceof window.HTMLElement) {
    return value;
  } else if (typeof WebElement !== 'undefined' && value instanceof WebElement) {
    return value;
  } else if (Array.isArray(value)) {
    return value.map(value => unmarshal(value));
  } else if ([].toString.call(value) === '[object Object]') {
    if (value.__type === 'error') {
      const error = new Error(value.message);

      error.stack = value.stack;

      return error;
    } else if (value.__type === 'undefined') {
      return;
    }

    return Object.fromEntries(
      Object.entries(value).map(([name, value]) =>
        name !== '__proto__' && name !== 'constructor' && name !== 'prototype' ? [name, unmarshal(value)] : [name]
      )
    );
  }

  return value;
};
