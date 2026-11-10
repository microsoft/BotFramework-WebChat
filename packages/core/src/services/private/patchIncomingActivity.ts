import updateIn from 'simple-update-in';

import type { DirectLineActivity } from '../../types/external/DirectLineActivity';
import type { WebChatActivity } from '../../types/WebChatActivity';

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

/**
 * Normalizes an activity from Direct Line: `null` fields as `undefined`, `from.role` and the `from.name` of the bot.
 * Throws if the activity is not an object.
 *
 * Shared by `observeActivityMachine.ts` and the incoming service.
 */
// TODO: [P2] #3953 Move the patching logic to a DirectLineJS wrapper, instead of too close to inners of Web Chat.
export default function patchIncomingActivity(activity: DirectLineActivity, userID?: string): WebChatActivity {
  activity = patchNullAsUndefined(activity);
  activity = patchActivityWithFromRole(activity, userID);
  activity = patchFromName(activity);

  return activity as WebChatActivity;
}
