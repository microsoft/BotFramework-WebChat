import { EventIterator } from 'event-iterator';
import babelPluginProposalAsyncGeneratorFunctions from '@babel/plugin-proposal-async-generator-functions';
import createDeferred from 'p-defer-es5';
import expect from 'expect';
import updateIn from 'simple-update-in';

import { timeouts } from './constants';
import * as conditions from './conditions/index';
import * as elements from './elements/index';
import * as host from './host/index';
import * as jobs from './jobs';
import * as pageObjects from './pageObjects/index';
import * as token from './token/index';
import createQueuedArrayBufferAudioSource from './speech/speechRecognition/createQueuedArrayBufferAudioSource';
import createStore, { getActionHistory } from './utils/createStore';
import fetchSpeechData from './speech/speechRecognition/fetchSpeechData';
import iterateAsyncIterable from './utils/iterateAsyncIterable';
import MockAudioContext from './speech/speechSynthesis/MockAudioContext';
import recognizeRiffWaveArrayBuffer from './speech/speechSynthesis/recognizeRiffWaveArrayBuffer';
import pageError from './host/pageError';
import parseURLParams from './utils/parseURLParams';
import runAsyncInterval from './utils/runAsyncInterval';
import shareObservable from './utils/shareObservable';
import sleep from './utils/sleep';
import subscribeConsole, { getHistory as getConsoleHistory } from './utils/subscribeConsole';

window.Babel.registerPlugin('@babel/plugin-proposal-async-generator-functions', babelPluginProposalAsyncGeneratorFunctions);

const log = console.log.bind(console);

// If not running under WebDriver, we handle all jobs here.
const webDriverMode = 'wd' in parseURLParams(location.hash);

if (!webDriverMode) {
  runAsyncInterval(async () => {
    const job = jobs.acquire();

    if (job) {
      const { id, type } = job;

      switch (type) {
        case 'console':
          log(`WebChatTest: [${job.payload.level}] ${job.payload.args.join('\n')}`);
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
  window.addEventListener('error', ({ error }) => jobs.post(pageError(error)));
}

subscribeConsole();

!webDriverMode && console.warn('WebChatTest: Running without Web Driver, will mock all host functions.');

export {
  conditions,
  createDeferred,
  createQueuedArrayBufferAudioSource,
  createStore,
  elements,
  EventIterator,
  expect,
  fetchSpeechData,
  getActionHistory,
  getConsoleHistory,
  host,
  iterateAsyncIterable,
  jobs,
  MockAudioContext,
  pageObjects,
  parseURLParams,
  recognizeRiffWaveArrayBuffer,
  shareObservable,
  timeouts,
  token,
  updateIn
};
