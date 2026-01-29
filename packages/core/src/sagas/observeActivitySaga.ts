import { put, select } from 'redux-saga/effects';
import updateIn from 'simple-update-in';

import observeEach from './effects/observeEach';
import queueIncomingActivity from '../actions/queueIncomingActivity';
import setVoiceState from '../actions/setVoiceState';
import whileConnected from './effects/whileConnected';
import isVoiceActivity from '../utils/voiceActivity/isVoiceActivity';
import isVoiceTranscriptActivity from '../utils/voiceActivity/isVoiceTranscriptActivity';
import type { DirectLineActivity } from '../types/external/DirectLineActivity';
import type { DirectLineJSBotConnection } from '../types/external/DirectLineJSBotConnection';
import type { WebChatActivity } from '../types/WebChatActivity';

const PASSTHRU_FN = (value: unknown) => value;

function patchActivityWithFromRole(activity: DirectLineActivity, userID?: string): DirectLineActivity {
  // Some activities, such as "ConversationUpdate", does not have "from" defined.
  // And although "role" is defined in Direct Line spec, it was not sent over the wire.
  // We normalize the activity here to simplify null-check and logic later.

  // Patch activity.from.role to make sure its either "bot", "user", or "channel"
  if (!activity.from) {
    activity = updateIn(activity, ['from', 'role'], () => 'channel');
  } else if (!activity.from.role) {
    if (activity.from.id === userID) {
      activity = updateIn(activity, ['from', 'role'], () => 'user');
    } else if (activity.from.id) {
      activity = updateIn(activity, ['from', 'role'], () => 'bot');
    } else {
      activity = updateIn(activity, ['from', 'role'], () => 'channel');
    }
  }

  return activity;
}

function patchNullAsUndefined(activity: DirectLineActivity): DirectLineActivity {
  // These fields are known used in Web Chat and in any cases, they should not be null, but undefined.
  // The only field omitted is "value", as it could be null purposefully.

  return [
    'attachmentLayout',
    'attachments',
    'channelData',
    'conversation',
    'entities',
    'from',
    'inputHint',
    'locale',
    'name',
    'recipient',
    'speak',
    'suggestedActions',
    'text',
    'textFormat',
    'timestamp',
    'type'
  ].reduce((activity, name) => {
    const { [name]: value } = activity;

    return updateIn(activity, [name], typeof value === 'undefined' || value === null ? undefined : PASSTHRU_FN);
  }, activity);
}

// Patching the `from.name` to be a human readable name.
// We use the `from.name` for typing indicator, such that it read "John is typing...".
function patchFromName(activity: DirectLineActivity) {
  return updateIn(activity, ['from', 'name'], (name: string | undefined): string => {
    const { channelId, from = {} } = activity;

    if ((channelId === 'directline' || channelId === 'webchat') && from.id === from.name && from.role === 'bot') {
      return 'Bot';
    }

    return name;
  });
}

function* observeActivity({ directLine, userID }: { directLine: DirectLineJSBotConnection; userID?: string }) {
  yield observeEach(directLine.activity$, function* observeActivity(activity: DirectLineActivity) {
    // Handle voice activities separately - don't store them in Redux (except transcripts)
    if (isVoiceActivity(activity) && !isVoiceTranscriptActivity(activity)) {
      const { recording, voiceHandlers } = yield select(state => ({
        recording: state.voice.voiceState !== 'idle',
        voiceHandlers: state.voice.voiceHandlers
      }));

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

    // TODO: [P2] #3953 Move the patching logic to a DirectLineJS wrapper, instead of too close to inners of Web Chat.
    activity = patchNullAsUndefined(activity);
    activity = patchActivityWithFromRole(activity, userID);
    activity = patchFromName(activity);

    yield put(queueIncomingActivity(activity as WebChatActivity));
  });
}

export default function* observeActivitySaga() {
  yield whileConnected(observeActivity);
}
