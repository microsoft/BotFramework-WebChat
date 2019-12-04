import { START_SPEAKING_ACTIVITY } from '../../lib/actions/startSpeakingActivity';
import { STOP_SPEAKING_ACTIVITY } from '../../lib/actions/stopSpeakingActivity';

export default function shouldSpeakIncomingActivity(state = false, { type }) {
  switch (type) {
    case START_SPEAKING_ACTIVITY:
      state = true;
      break;

    case STOP_SPEAKING_ACTIVITY:
      state = false;
      break;

    default:
      break;
  }

  return state;
}
