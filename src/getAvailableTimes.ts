import * as moment from 'moment';
import { Node } from './DatePickerCard';

/**
 * Returns a list of momentified times for the calender
 * @param node
 */
export function getAvailableTimes(node: Node) {
    if (!node) {
        return;
    }

    if (node.node_type === 'handoff' && node.availableTimes) {
        return node.availableTimes.map(time => moment(time, 'hh:mm A'));
    }

    return null;
}
