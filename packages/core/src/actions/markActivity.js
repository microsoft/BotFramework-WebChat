const MARK_ACTIVITY = 'WEB_CHAT/MARK_ACTIVITY';

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

export { MARK_ACTIVITY };
