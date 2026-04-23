import type { DictateState } from '../constants/DictateState';

const SET_DICTATE_STATE = 'WEB_CHAT/SET_DICTATE_STATE';

export default function setDictateState(dictateState: DictateState) {
  return {
    type: SET_DICTATE_STATE,
    payload: { dictateState }
  };
}

export { SET_DICTATE_STATE };
