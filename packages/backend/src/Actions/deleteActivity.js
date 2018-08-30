export const DELETE_ACTIVITY = 'DIRECT_LINE/DELETE_ACTIVITY';

export default function (activityID) {
  return {
    type: DELETE_ACTIVITY,
    payload: { activityID }
  };
}
