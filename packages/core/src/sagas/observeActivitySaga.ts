import { put, select } from 'redux-saga/effects';

import observeEach from './effects/observeEach';
import queueIncomingActivity from '../actions/queueIncomingActivity';
import setVoiceState from '../actions/setVoiceState';
import whileConnected from './effects/whileConnected';
import patchIncomingActivity from '../services/private/patchIncomingActivity';
import isVoiceActivity from '../utils/voiceActivity/isVoiceActivity';
import isVoiceTranscriptActivity from '../utils/voiceActivity/isVoiceTranscriptActivity';
import type { DirectLineActivity } from '../types/external/DirectLineActivity';
import type { DirectLineJSBotConnection } from '../types/external/DirectLineJSBotConnection';

function* observeActivity({ directLine, userID }: { directLine: DirectLineJSBotConnection; userID?: string }) {
  yield observeEach(directLine.activity$, function* observeActivity(activity: DirectLineActivity) {
    // Handle voice activities separately - don't store them in Redux (except transcripts)
    if (isVoiceActivity(activity) && !isVoiceTranscriptActivity(activity)) {
      const { recording, voiceHandlers } = yield select(state => ({
        recording: state.voice.voiceState !== 'idle',
        voiceHandlers: state.voice.voiceHandlers
      }));

      // Only process voice chunks if speech-to-speech is enabled.
      if (!recording) {
        return;
      }

      switch (activity.name) {
        case 'media.chunk': {
          const audioContent = activity?.value?.content;
          if (audioContent) {
            voiceHandlers.forEach(handler => handler.queueAudio(audioContent));
          }
          break;
        }

        case 'request.update': {
          const state = activity?.value?.state;

          switch (state) {
            case 'detected':
              voiceHandlers.forEach(handler => handler.stopAllAudio());
              yield put(setVoiceState('user_speaking'));
              break;

            case 'processing':
              yield put(setVoiceState('processing'));
              break;

            default:
              break;
          }
          break;
        }

        default:
          break;
      }

      return;
    }

    yield put(queueIncomingActivity(patchIncomingActivity(activity, userID)));
  });
}

export default function* observeActivitySaga() {
  yield whileConnected(observeActivity);
}
