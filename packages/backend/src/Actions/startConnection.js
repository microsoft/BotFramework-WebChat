const START_CONNECTION = 'DIRECT_LINE/START_CONNECTION';

export default function ({ directLine, userID, username }) {
  return {
    type: START_CONNECTION,
    payload: { directLine, userID, username }
  };
}

export { START_CONNECTION }
