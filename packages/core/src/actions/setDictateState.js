const SET_DICTATE_STATE = 'WEB_CHAT/SET_DICTATE_STATE';

export default function setDictateState(dictateState) {
  return {
    type: SET_DICTATE_STATE,
    payload: { dictateState }
  };
}

export { SET_DICTATE_STATE };
