const CONNECT = 'DIRECT_LINE/CONNECT';
const CONNECT_PENDING = `${ CONNECT }_PENDING`;
const CONNECT_REJECTED = `${ CONNECT }_REJECTED`;
const CONNECT_FULFILLED = `${ CONNECT }_FULFILLED`;

export default function ({ directLine, userID, username }) {
  return {
    type: CONNECT,
    payload: { directLine, userID, username }
  };
}

export {
  CONNECT,
  CONNECT_PENDING,
  CONNECT_REJECTED,
  CONNECT_FULFILLED
}
