import { Activity, Message } from 'botframework-directlinejs';

export function activityWithDatePicker(activities: Activity[]) {
    if (!activities || activities.length === 0) {
        return;
    }

    const lastActivity = activities[activities.length - 1];

    if (lastActivity.type === 'message'
        && lastActivity.entities
        && lastActivity.entities[0]
        && (lastActivity.entities[0].node_type === 'date' || lastActivity.entities[0].node_type === 'date')
    ) {
        return lastActivity;
    }
}
