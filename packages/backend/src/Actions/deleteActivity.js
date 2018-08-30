export const DELETE_ACTIVITY = 'ACTIVITIES/DELETE_ACTIVITY';

export default function (activityID) {
  return {
    type: DELETE_ACTIVITY,
    payload: { activityID }
  };
}
