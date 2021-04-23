import 'script-loader!../node_modules/@babel/standalone/babel.min.js';
import 'script-loader!../../../node_modules/regenerator-runtime/runtime.js';
import 'script-loader!../../../node_modules/react/umd/react.development.js';
import 'script-loader!../../../node_modules/react-dom/umd/react-dom.development.js';
import 'script-loader!../../../node_modules/react-dom/umd/react-dom-test-utils.development.js';
import '../assets/index.css';

import { decode } from 'base64-arraybuffer';
import classNames from 'classnames';
import createDeferred from 'p-defer-es5';
import expect from 'expect';
import lolex from 'lolex';
import Observable from 'core-js/features/observable';
import updateIn from 'simple-update-in';

import { EventIterator } from './external/event-iterator';
import BabelPluginProposalAsyncGeneratorFunctions from './external/@babel/plugin-proposal-async-generator-functions';

import { timeouts } from './constants';
import * as conditions from './conditions/index';
import * as elements from './elements/index';
import * as host from './host/index';
import * as jobs from './jobs';
import * as pageObjects from './pageObjects/index';
import * as token from './token/index';
import concatArrayBuffer from './speech/concatArrayBuffer';
import createDeferredObservable from './utils/createDeferredObservable';
import createDirectLineWithTranscript from './utils/createDirectLineWithTranscript';
import createQueuedArrayBufferAudioSource from './speech/speechRecognition/createQueuedArrayBufferAudioSource';
import createRunHookActivityMiddleware from './utils/createRunHookActivityMiddleware';
import createStore, { getActionHistory } from './utils/createStore';
import createWebSpeechMock from './utils/createWebSpeechMock';
import fetchSpeechData from './speech/speechRecognition/fetchSpeechData';
import fetchSpeechServicesCredentials from './token/fetchSpeechServicesCredentials';
import float32ArraysToPcmWaveArrayBuffer from './speech/float32ArraysToPcmWaveArrayBuffer';
import iterateAsyncIterable from './utils/iterateAsyncIterable';
import loadTranscriptAsset from './utils/loadTranscriptAsset';
import MockAudioContext from './speech/speechSynthesis/MockAudioContext';
import pageError from './host/pageError';
import parseURLParams from './utils/parseURLParams';
import pcmWaveArrayBufferToRiffWaveArrayBuffer from './speech/pcmWaveArrayBufferToRiffWaveArrayBuffer';
import recognizeRiffWaveArrayBuffer from './speech/speechSynthesis/recognizeRiffWaveArrayBuffer';
import runAsyncInterval from './utils/runAsyncInterval';
import shareObservable from './utils/shareObservable';
import sleep from './utils/sleep';
import stringToArrayBuffer from './utils/stringToArrayBuffer';
import subscribeConsole, { hasConsoleError, shiftDeprecationHistory } from './utils/subscribeConsole';

function waitForFinishKey() {
  const { promise, resolve } = createDeferred();
  const handler = event => {
    (event.code === 'CapsLock' || event.code === 'ShiftRight') && resolve();
  };

  window.addEventListener('keyup', handler);

  log('WebChatTest: After you complete the last step, press CAPSLOCK or right SHIFT key to continue.');

  return promise.finally(() => {
    window.removeEventListener('keyup', handler);
  });
}

window.Babel.registerPlugin(
  '@babel/plugin-proposal-async-generator-functions',
  BabelPluginProposalAsyncGeneratorFunctions
);

window.lolex = lolex;

const log = console.log.bind(console);

// If not running under WebDriver, we handle all jobs here.
const webDriverMode = 'wd' in parseURLParams(location.hash);

if (!webDriverMode) {
  runAsyncInterval(async () => {
    const job = jobs.acquire();

    if (job) {
      const { id, type } = job;
      let result;

      switch (type) {
        case 'console':
          log(`WebChatTest: [${job.payload.level}] ${job.payload.args.join('\n')}`);
          break;

        case 'done':
          if (job.payload.deprecation) {
            log('WebChatTest: Done. Please check console for logs related to deprecation.');
          } else {
            log('WebChatTest: Done.');
          }

          break;

        case 'snapshot':
          log('WebChatTest: Taking a snapshot.');
          await sleep(500);
          break;

        case 'save file':
          result = URL.createObjectURL(new Blob([decode(job.payload.base64)]));
          log(`WebChatTest: Saving "${job.payload.filename}" to "${result}".`);
          break;

        case 'send access key':
          log(`WebChatTest: Please press this key sequence: ALT-SHIFT-${job.payload.key}.`);
          await waitForFinishKey();
          break;

        case 'send keys':
          log(
            `WebChatTest: Please press this key sequence: ${job.payload.keys
              .map(key => (key === '\n' ? 'ENTER' : key === ' ' ? 'SPACEBAR' : key))
              .join(', ')}.`
          );
          await waitForFinishKey();
          break;

        case 'send shift tab':
          log(`WebChatTest: Please press SHIFT-TAB key.`);
          await waitForFinishKey();
          break;

        case 'send tab':
          log(`WebChatTest: Please press TAB key.`);
          await waitForFinishKey();
          break;

        default:
          log(`WebChatTest: Auto-resolving job "${type}".`);
          break;
      }

      jobs.resolve(id, result);
    }
  }, 100);
} else {
  window.addEventListener('error', ({ error }) => jobs.post(pageError(error)));
}

subscribeConsole();

if (webDriverMode) {
  setTimeout(() => {
    document.body.className += ' webdriver';
  }, 0);
} else {
  console.warn('WebChatTest: Running without Web Driver, will mock all host functions.');
}

export {
  classNames,
  concatArrayBuffer,
  conditions,
  createDeferred,
  createDeferredObservable,
  createDirectLineWithTranscript,
  createQueuedArrayBufferAudioSource,
  createRunHookActivityMiddleware,
  createStore,
  createWebSpeechMock,
  elements,
  EventIterator,
  expect,
  fetchSpeechData,
  fetchSpeechServicesCredentials,
  float32ArraysToPcmWaveArrayBuffer,
  getActionHistory,
  hasConsoleError,
  host,
  iterateAsyncIterable,
  jobs,
  loadTranscriptAsset,
  MockAudioContext,
  Observable,
  pageObjects,
  parseURLParams,
  pcmWaveArrayBufferToRiffWaveArrayBuffer,
  recognizeRiffWaveArrayBuffer,
  shareObservable,
  shiftDeprecationHistory,
  sleep,
  stringToArrayBuffer,
  timeouts,
  token,
  updateIn
};
