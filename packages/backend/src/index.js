import connect from './actions/connect';
import createStore from './createStore';
import disconnect from './actions/disconnect';
import markActivity from './actions/markActivity';
import postActivity from './actions/postActivity';
import sendFiles from './actions/sendFiles';
import sendMessage from './actions/sendMessage';
import setLanguage from './actions/setLanguage';
import setSendBox from './actions/setSendBox';
import setSendTyping from './actions/setSendTyping';
import startSpeakingActivity from './actions/startSpeakingActivity';
import startSpeechInput from './actions/startSpeechInput';
import stopSpeakingActivity from './actions/stopSpeakingActivity';
import stopSpeechInput from './actions/stopSpeechInput';
import submitSendBox from './actions/submitSendBox';

import SendState from './constants/SendState';

const Constants = { SendState };

export {
  connect,
  Constants,
  createStore,
  disconnect,
  markActivity,
  postActivity,
  sendFiles,
  sendMessage,
  setLanguage,
  setSendBox,
  setSendTyping,
  startSpeakingActivity,
  startSpeechInput,
  stopSpeakingActivity,
  stopSpeechInput,
  submitSendBox
}
