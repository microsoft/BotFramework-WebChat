const SET_DICTATE_STATE = 'INPUT/SET_DICTATE_STATE';

export default function (dictateState) {
  return {
    type: SET_DICTATE_STATE,
    payload: { dictateState }
  };
}

export { SET_DICTATE_STATE }
