const SET_DICTATE_INTERIMS = 'WEB_CHAT/SET_DICTATE_INTERIMS';

export default function setDictateInterims(dictateInterims) {
  return {
    type: SET_DICTATE_INTERIMS,
    payload: { dictateInterims }
  };
}

export { SET_DICTATE_INTERIMS };
