import { decode } from 'base64-arraybuffer';
import createDeferred from 'p-defer-es5';
import expect from 'expect';
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
import createQueuedArrayBufferAudioSource from './speech/speechRecognition/createQueuedArrayBufferAudioSource';
import createStore, { getActionHistory } from './utils/createStore';
import fetchSpeechData from './speech/speechRecognition/fetchSpeechData';
import float32ArraysToPcmWaveArrayBuffer from './speech/float32ArraysToPcmWaveArrayBuffer';
import iterateAsyncIterable from './utils/iterateAsyncIterable';
import MockAudioContext from './speech/speechSynthesis/MockAudioContext';
import recognizeRiffWaveArrayBuffer from './speech/speechSynthesis/recognizeRiffWaveArrayBuffer';
import pageError from './host/pageError';
import parseURLParams from './utils/parseURLParams';
import pcmWaveArrayBufferToRiffWaveArrayBuffer from './speech/pcmWaveArrayBufferToRiffWaveArrayBuffer';
import runAsyncInterval from './utils/runAsyncInterval';
import shareObservable from './utils/shareObservable';
import sleep from './utils/sleep';
import subscribeConsole, { getHistory as getConsoleHistory } from './utils/subscribeConsole';

window.Babel.registerPlugin(
  '@babel/plugin-proposal-async-generator-functions',
  BabelPluginProposalAsyncGeneratorFunctions
);

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
          log('WebChatTest: Done.');
          break;

        case 'snapshot':
          log('WebChatTest: Taking a snapshot.');
          await sleep(500);
          break;

        case 'save file':
          result = URL.createObjectURL(new Blob([decode(job.payload.base64)]));
          log(`WebChatTest: Saving "${job.payload.filename}" to "${result}".`);
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

!webDriverMode && console.warn('WebChatTest: Running without Web Driver, will mock all host functions.');

export {
  concatArrayBuffer,
  conditions,
  createDeferred,
  createQueuedArrayBufferAudioSource,
  createStore,
  elements,
  EventIterator,
  expect,
  fetchSpeechData,
  float32ArraysToPcmWaveArrayBuffer,
  getActionHistory,
  getConsoleHistory,
  host,
  iterateAsyncIterable,
  jobs,
  MockAudioContext,
  pageObjects,
  parseURLParams,
  pcmWaveArrayBufferToRiffWaveArrayBuffer,
  recognizeRiffWaveArrayBuffer,
  shareObservable,
  timeouts,
  token,
  updateIn
};
