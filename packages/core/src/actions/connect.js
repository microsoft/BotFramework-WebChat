const CONNECT = 'DIRECT_LINE/CONNECT';
const CONNECT_FULFILLED = `${CONNECT}_FULFILLED`;
const CONNECT_FULFILLING = `${CONNECT}_FULFILLING`;
const CONNECT_PENDING = `${CONNECT}_PENDING`;
const CONNECT_REJECTED = `${CONNECT}_REJECTED`;
const CONNECT_STILL_PENDING = `${CONNECT}_STILL_PENDING`;

export default function connect({ directLine, userID, username }) {
  return {
    type: CONNECT,
    payload: {
      directLine,
      userID,
      username
    }
  };
}

export { CONNECT, CONNECT_FULFILLED, CONNECT_FULFILLING, CONNECT_PENDING, CONNECT_REJECTED, CONNECT_STILL_PENDING };
