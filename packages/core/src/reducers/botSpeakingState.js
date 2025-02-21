import { SET_BOT_SPEAKING } from '../actions/setBotSpeakingState';
import { IDLE } from '../constants/BotSpeakingState';

const DEFAULT_STATE = IDLE;

export default function botSpeakingState(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_BOT_SPEAKING:
      state = payload.botSpeaking;
      break;

    default:
      break;
  }

  return state;
}
