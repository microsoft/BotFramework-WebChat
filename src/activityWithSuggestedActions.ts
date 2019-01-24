import { Activity, Message } from 'botframework-directlinejs';

export function activityWithSuggestedActions(activities: Activity[]) {
    if (!activities || activities.length === 0) {
        return;
    }

    const lastActivity = activities[activities.length - 1];

    if (lastActivity.type === 'message'
        && lastActivity.suggestedActions
        && lastActivity.suggestedActions.actions.length > 0
    ) {
        return lastActivity;
    }

    if (lastActivity.replyToId) {
        const activityFilter = activities.filter(activity => activity.replyToId === lastActivity.replyToId && activity.suggestedActions && activity.suggestedActions.actions.length > 0);
        if(activityFilter.length > 0){
            return activityFilter[0];
        }
    }
}
