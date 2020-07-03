import { put } from 'redux-saga/effects';
import updateIn from 'simple-update-in';

import observeEach from './effects/observeEach';
import queueIncomingActivity from '../actions/queueIncomingActivity';
import whileConnected from './effects/whileConnected';

const PASSTHRU_FN = value => value;

function patchActivityWithFromRole(activity, userID) {
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

function patchNullAsUndefined(activity) {
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

function* observeActivity({ directLine, userID }) {
  yield observeEach(directLine.activity$, function* observeActivity(activity) {
    activity = patchNullAsUndefined(activity);
    activity = patchActivityWithFromRole(activity, userID);

    yield put(queueIncomingActivity(activity));
  });
}

export default function* observeActivitySaga() {
  yield whileConnected(observeActivity);
}
