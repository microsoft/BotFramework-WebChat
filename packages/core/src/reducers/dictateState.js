import {
  DICTATING,
  IDLE,
  STARTING,
  STOPPING
} from '../constants/DictateState';

import { SET_DICTATE_STATE } from '../actions/setDictateState';
import { START_SPEECH_INPUT } from '../actions/startSpeechInput';
import { STOP_SPEECH_INPUT } from '../actions/stopSpeechInput';

const DEFAULT_STATE = IDLE;

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_DICTATE_STATE:
      state = payload.dictateState;
      break;

    case START_SPEECH_INPUT:
      if (state === IDLE || state === STOPPING) {
        state = STARTING;
      }

      break;

    case STOP_SPEECH_INPUT:
      if (state === STARTING || state === DICTATING) {
        state = STOPPING;
      }

      break;

    default: break;
  }

  return state;
}
