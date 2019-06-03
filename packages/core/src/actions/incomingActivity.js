const INCOMING_ACTIVITY = 'DIRECT_LINE/INCOMING_ACTIVITY';

export default function incomingActivity(activity) {
  return {
    type: INCOMING_ACTIVITY,
    payload: { activity }
  };
}

export { INCOMING_ACTIVITY };
