type MarkActivityActionType = 'WEB_CHAT/MARK_ACTIVITY';

type MarkActivityAction = {
  payload: { activityID: string; name: string; value: any };
  type: MarkActivityActionType;
};

const MARK_ACTIVITY: MarkActivityActionType = 'WEB_CHAT/MARK_ACTIVITY';

function markActivity({ id: activityID }: { id: string }, name: string, value: any): MarkActivityAction {
  return {
    type: MARK_ACTIVITY,
    payload: {
      activityID,
      name,
      value
    }
  };
}

export default markActivity;
export { MARK_ACTIVITY };
export type { MarkActivityAction };
