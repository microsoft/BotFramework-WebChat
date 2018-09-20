// TODO: [P4] Mark actions with correct family
//       E.g. POST_ACTIVITY belongs to DIRECT_LINE
//       E.g. SEND_MESSAGE belongs to WEB_CHAT
//       We are trying to curb down the number of DIRECT_LINE/* to make backend easier to rebuild
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
