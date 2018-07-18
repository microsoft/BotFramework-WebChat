const RECEIVE_ACTIVITY = 'DIRECT_LINE/RECEIVE_ACTIVITY';

export default function (activity) {
  return {
    type: RECEIVE_ACTIVITY,
    payload: { activity }
  };
}

export { RECEIVE_ACTIVITY }
