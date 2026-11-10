import queueIncomingActivity from '../../actions/queueIncomingActivity';
import setVoiceState from '../../actions/setVoiceState';
import patchIncomingActivity from '../../services/private/patchIncomingActivity';
import isVoiceActivity from '../../utils/voiceActivity/isVoiceActivity';
import isVoiceTranscriptActivity from '../../utils/voiceActivity/isVoiceTranscriptActivity';
import type { Machine, Scope } from '../types';

// Voice activities (other than transcripts) are not kept: their audio goes to the voice handlers, while recording.
function handleVoiceActivity(online: Scope, activity: any, next: () => void): void {
  const { recording, voiceHandlers } = online.select(state => ({
    recording: state.voice.voiceState !== 'idle',
    voiceHandlers: state.voice.voiceHandlers
  }));

  if (recording) {
    if (activity.name === 'media.chunk') {
      const audioContent = activity?.value?.content;

      audioContent && voiceHandlers.forEach(handler => handler.queueAudio(audioContent));
    } else if (activity.name === 'request.update') {
      const state = activity?.value?.state;

      if (state === 'detected') {
        voiceHandlers.forEach(handler => handler.stopAllAudio());

        return online.put(setVoiceState('user_speaking'), next);
      } else if (state === 'processing') {
        return online.put(setVoiceState('processing'), next);
      }
    }
  }

  next();
}

/** `observeActivitySaga`: while online, queues each activity from Direct Line, patched; voice activities aside. */
const observeActivityMachine: Machine = scope =>
  scope.whileOnline(({ directLine, userID }, online) =>
    online.observeEach(directLine.activity$, (activity: any, next) =>
      isVoiceActivity(activity) && !isVoiceTranscriptActivity(activity)
        ? handleVoiceActivity(online, activity, next)
        : online.put(queueIncomingActivity(patchIncomingActivity(activity, userID)), next)
    )
  );

export default observeActivityMachine;
