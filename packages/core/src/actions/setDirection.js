const SET_DIRECTION = 'WEB_CHAT/SET_DIRECTION';

export default function setDirection(direction) {
  return {
    type: SET_DIRECTION,
    payload: { direction }
  };
}

export { SET_DIRECTION }
