import { Constants } from 'botframework-webchat-core';

const {
  ActivityClientState: { SEND_FAILED }
} = Constants;

function bin(items, grouping) {
  let lastGroup;
  const groups = [];
  let lastItem;

  items.forEach(item => {
    if (lastItem && grouping(lastItem, item)) {
      lastGroup.push(item);
    } else {
      lastGroup = [item];
      groups.push(lastGroup);
    }

    lastItem = item;
  });

  return groups;
}

function sendFailed(activity) {
  return activity.from.role === 'user' && activity.channelData && activity.channelData.state === SEND_FAILED;
}

function shouldGroupTimestamp(activityX, activityY, groupTimestamp) {
  if (groupTimestamp === false) {
    // Hide timestamp for all activities.
    return true;
  } else if (activityX && activityY) {
    if (sendFailed(activityX) || sendFailed(activityY)) {
      return false;
    }

    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : Infinity;

    const timeX = new Date(activityX.timestamp).getTime();
    const timeY = new Date(activityY.timestamp).getTime();

    return Math.abs(timeX - timeY) <= groupTimestamp;
  }

  return false;
}

export default function createDefaultGroupActivityMiddleware({ groupTimestamp }) {
  return () => () => ({ activities }) => ({
    sender: bin(activities, (x, y) => x.from.role === y.from.role),
    status: bin(activities, (x, y) => shouldGroupTimestamp(x, y, groupTimestamp))
  });
}
