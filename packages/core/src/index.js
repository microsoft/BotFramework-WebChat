/* global VERSION:readonly */

import connect from './actions/connect';
import createStore from './createStore';
import disconnect from './actions/disconnect';
import markActivity from './actions/markActivity';
import postActivity from './actions/postActivity';
import sendEvent from './actions/sendEvent';
import sendFiles from './actions/sendFiles';
import sendMessage from './actions/sendMessage';
import sendMessageBack from './actions/sendMessageBack';
import sendPostBack from './actions/sendPostBack';
import setDictateInterims from './actions/setDictateInterims';
import setDictateState from './actions/setDictateState';
import setLanguage from './actions/setLanguage';
import setSendBox from './actions/setSendBox';
import setSendTimeout from './actions/setSendTimeout';
import setSendTyping from './actions/setSendTyping';
import setSendTypingIndicator from './actions/setSendTypingIndicator';
import startDictate from './actions/startDictate';
import startSpeakingActivity from './actions/startSpeakingActivity';
import stopDictate from './actions/stopDictate';
import stopSpeakingActivity from './actions/stopSpeakingActivity';
import submitSendBox from './actions/submitSendBox';

import * as ActivityClientState from './constants/ActivityClientState';
import * as DictateState from './constants/DictateState';

const Constants = { ActivityClientState, DictateState };
const version = VERSION;

export {
  connect,
  Constants,
  createStore,
  disconnect,
  markActivity,
  postActivity,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  setDictateInterims,
  setDictateState,
  setLanguage,
  setSendBox,
  setSendTimeout,
  setSendTypingIndicator,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox,
  version,
  // TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
  setSendTyping
};
