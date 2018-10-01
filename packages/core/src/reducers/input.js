import updateIn from 'simple-update-in';

import * as DictateState from '../constants/DictateState';
import { SET_DICTATE_INTERIMS } from '../actions/setDictateInterims';
import { SET_DICTATE_STATE } from '../actions/setDictateState';
import { SET_SEND_BOX } from '../actions/setSendBox';
import { START_SPEECH_INPUT } from '../actions/startSpeechInput';
import { STOP_SPEECH_INPUT } from '../actions/stopSpeechInput';
import { IDLE } from '../constants/DictateState';

const DEFAULT_STATE = {
  dictateInterims: [],
  dictateState: IDLE,
  sendBox: ''
};

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_DICTATE_INTERIMS:
      state = updateIn(state, ['dictateInterims'], () => payload.dictateInterims);
      break;

    case SET_DICTATE_STATE:
      state = updateIn(state, ['dictateState'], () => payload.dictateState);
      break;

    case SET_SEND_BOX:
      state = updateIn(state, ['sendBox'], () => payload.text);
      break;

    case START_SPEECH_INPUT:
      if (state.dictateState === DictateState.IDLE || state.dictateState === DictateState.STOPPING) {
        state = updateIn(state, ['dictateState'], () => DictateState.STARTING);
      }

      break;

    case STOP_SPEECH_INPUT:
      if (state.dictateState === DictateState.STARTING || state.dictateState === DictateState.DICTATING) {
        state = updateIn(state, ['dictateState'], () => DictateState.STOPPING);
      }

      break;

    default: break;
  }

  return state;
}
