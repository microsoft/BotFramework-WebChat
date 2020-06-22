import { dispatch } from '../utils/createStore';

export default function postActivity(activity) {
  return dispatch({
    meta: {},
    payload: { activity },
    type: 'DIRECT_LINE/POST_ACTIVITY'
  });
}
