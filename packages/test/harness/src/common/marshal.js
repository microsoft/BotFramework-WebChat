// This file will run in both browser and host (Jest or Node.js).
/* eslint-env browser */

const SeleniumWebDriver = require('selenium-webdriver');

// "selenium-webdriver" is undefined if running under browser.
const { WebElement } = SeleniumWebDriver || {};

// Format a JavaScript object to another format that is okay to send over the Web Driver protocol.
module.exports = function marshal(value) {
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value;
  } else if (typeof value === 'undefined') {
    return { __type: 'undefined' };
  } else if (!value) {
    return value;
  } else if (Array.isArray(value)) {
    return value.map(element => marshal(element));
  } else if ([].toString.call(value) === '[object Object]') {
    return Object.fromEntries(
      Object.entries(value).map(([name, value]) =>
        name !== '__proto__' && name !== 'constructor' && name !== 'prototype' ? [name, marshal(value)] : [name]
      )
    );
  } else if (typeof window !== 'undefined' && value instanceof window.HTMLElement) {
    return value;
  } else if (typeof WebElement !== 'undefined' && value instanceof WebElement) {
    return value;
  } else if (value instanceof Error) {
    return {
      __type: 'error',
      message: value.message,
      stack: value.stack
    };
  }

  console.error('Cannot marshal object.', value);

  throw new Error('Cannot marshal object.');
};
