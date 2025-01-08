const QUEUE_INCOMING_ACTIVITY = 'DIRECT_LINE/QUEUE_INCOMING_ACTIVITY';

export default function queueIncomingActivity(activity) {
  return {
    type: QUEUE_INCOMING_ACTIVITY,
    payload: { activity }
  };
}

export { QUEUE_INCOMING_ACTIVITY };
