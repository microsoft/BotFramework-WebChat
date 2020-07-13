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

function shouldGroupTimestamp(activityX, activityY, groupTimestamp) {
  if (groupTimestamp === false) {
    // Hide timestamp for all activities.
    return true;
  } else if (activityX && activityY) {
    groupTimestamp = typeof groupTimestamp === 'number' ? groupTimestamp : Infinity;

    const timeX = new Date(activityX.timestamp).getTime();
    const timeY = new Date(activityY.timestamp).getTime();

    return Math.abs(timeX - timeY) <= groupTimestamp;
  }

  return false;
}

export default function createDefaultGroupActivityMiddleware() {
  return () => () => ({ activities, groupTimestamp }) => ({
    activityStatus: bin(activities, (x, y) => shouldGroupTimestamp(x, y, groupTimestamp)),
    avatar: bin(activities, (x, y) => x.from.role === y.from.role)
  });
}
