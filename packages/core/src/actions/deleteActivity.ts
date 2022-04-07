type DeleteActivityActionType = 'DIRECT_LINE/DELETE_ACTIVITY';

type DeleteActivityAction = {
  payload: { activityID: string };
  type: DeleteActivityActionType;
};

const DELETE_ACTIVITY: DeleteActivityActionType = 'DIRECT_LINE/DELETE_ACTIVITY';

function deleteActivity(activityID: string): DeleteActivityAction {
  return {
    type: DELETE_ACTIVITY,
    payload: { activityID }
  };
}

export default deleteActivity;
export { DELETE_ACTIVITY };
export type { DeleteActivityAction };
