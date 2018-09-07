import { Activity, Message } from 'botframework-directlinejs';

export function getAvailableTimes(message: Message, dateformat: string) {
    if (!message) {
        return;
    }

    if (message.entities
        && message.entities[0]
        && message.entities[0].node_type === 'handoff'
        && message.entities[0].availableTimes) {
        return message.entities[0].availableTimes;
    }
}
