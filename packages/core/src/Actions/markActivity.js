const MARK_ACTIVITY = 'ACTIVITY/MARK';

export default function markActivity({ id: activityID }, name, value) {
  return {
    type: MARK_ACTIVITY,
    payload: {
      activityID,
      name,
      value
    }
  };
}

export { MARK_ACTIVITY }
