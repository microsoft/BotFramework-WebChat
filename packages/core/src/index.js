import connect from './actions/connect';
import createStore from './createStore';
import disconnect from './actions/disconnect';
import markActivity from './actions/markActivity';
import postActivity from './actions/postActivity';
import sendFiles from './actions/sendFiles';
import sendMessage from './actions/sendMessage';
import sendPostBack from './actions/sendPostBack';
import setDictateInterims from './actions/setDictateInterims';
import setDictateState from './actions/setDictateState';
import setLanguage from './actions/setLanguage';
import setSendBox from './actions/setSendBox';
import setSendTyping from './actions/setSendTyping';
import startSpeakingActivity from './actions/startSpeakingActivity';
import startSpeechInput from './actions/startSpeechInput';
import stopSpeakingActivity from './actions/stopSpeakingActivity';
import stopSpeechInput from './actions/stopSpeechInput';
import submitSendBox from './actions/submitSendBox';

import * as ActivityClientState from './constants/ActivityClientState';
import * as DictateState from './constants/DictateState';

const Constants = { ActivityClientState, DictateState };

export {
  connect,
  Constants,
  createStore,
  disconnect,
  markActivity,
  postActivity,
  sendFiles,
  sendMessage,
  sendPostBack,
  setDictateInterims,
  setDictateState,
  setLanguage,
  setSendBox,
  setSendTyping,
  startSpeakingActivity,
  startSpeechInput,
  stopSpeakingActivity,
  stopSpeechInput,
  submitSendBox
}
