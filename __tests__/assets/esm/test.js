/* eslint-env browser */
import '/test-harness.mjs';
import '/test-page-object.mjs';
import * as WebChat from 'botframework-webchat';

Object.assign(window, { WebChat });

const createHostStub = (host = {}) => ({
  ...Object.fromEntries(
    Object.keys(host).map(methodName => [
      methodName,
      // eslint-disable-next-line no-console
      (...args) => console.info(`host.${methodName}()`, ...args)
    ])
  ),
  run: fn => fn()
});

const isWebDriver = !!navigator.webdriver;

export const host = isWebDriver ? window.host : createHostStub(window.host);

export const { pageConditions, testHelpers } = window;

export const run = host.run || window.run;
