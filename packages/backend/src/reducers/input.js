import updateIn from 'simple-update-in';

import { START_SPEECH_INPUT } from '../Actions/startSpeechInput';
import { STOP_SPEECH_INPUT } from '../Actions/stopSpeechInput';

const DEFAULT_STATE = {
  speechState: false
};

export default function (state = DEFAULT_STATE, { type }) {
  switch (type) {
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
