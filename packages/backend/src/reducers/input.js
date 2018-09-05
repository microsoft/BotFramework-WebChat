import updateIn from 'simple-update-in';

import { SET_SEND_BOX } from '../Actions/setSendBox';
import { START_SPEECH_INPUT } from '../Actions/startSpeechInput';
import { STOP_SPEECH_INPUT } from '../Actions/stopSpeechInput';

const DEFAULT_STATE = {
  sendBox: '',
  speechState: false
};

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_SEND_BOX:
      state = updateIn(state, ['sendBox'], () => payload.text);
      break;

    case START_SPEECH_INPUT:
      state = updateIn(state, ['speechState'], () => true);
      break;

    case STOP_SPEECH_INPUT:
      state = updateIn(state, ['speechState'], () => false);
      break;

    default: break;
  }

  return state;
}
