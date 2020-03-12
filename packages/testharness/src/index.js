// import '@babel/runtime';

import expect from 'expect';
import updateIn from 'simple-update-in';

import { timeouts } from './constants';
import * as conditions from './conditions/index';
import * as host from './host/index';
import * as jobs from './jobs';
import * as pageObjects from './pageObjects/index';
import * as token from './token/index';
import createStore, { getActionHistory, getState } from './utils/createStore';
import runAsyncInterval from './utils/runAsyncInterval';
import shareObservable from './utils/shareObservable';
import sleep from './utils/sleep';
import subscribeConsole from './utils/subscribeConsole';

export {
  conditions,
  createStore,
  expect,
  getActionHistory,
  getState,
  host,
  jobs,
  pageObjects,
  shareObservable,
  timeouts,
  token,
  updateIn
};

const log = console.log.bind(console);

function parseURLSearchParams(search) {
  return search
    .replace(/^\?/, '')
    .split('&')
    .reduce((params, keyValue) => {
      const [key, value] = keyValue.split('=');
      const decodedKey = decodeURIComponent(key);

      if (key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
        params[decodedKey] = decodeURIComponent(value);
      }

      return params;
    }, {});
}

// If not running under WebDriver, we handle all jobs here.
if (!('wd' in parseURLSearchParams(location.search))) {
  runAsyncInterval(async () => {
    const job = jobs.acquire();

    if (job) {
      const { id, type } = job;

      switch (type) {
        case 'console':
          log(`WebChatTest: [${job.payload.type}] ${job.payload.args.join('\n')}`);
          break;

        case 'done':
          log('WebChatTest: Done.');
          break;

        case 'snapshot':
          log('WebChatTest: Taking a snapshot.');
          await sleep(500);
          break;

        default:
          log(`WebChatTest: Auto-resolving job "${type}".`);
          break;
      }

      jobs.resolve(id);
    }
  }, 100);
} else {
  window.addEventListener('error', ({ error }) => {
    jobs.post({
      type: 'error',
      payload: { error: error && error + '' }
    });
  });
}

subscribeConsole();

console.log('Test harness loaded.');
