import { dispatch } from '../utils/createStore';

export default function sendMessageViaCode(text) {
  return dispatch({
    payload: { text },
    type: 'WEB_CHAT/SEND_MESSAGE'
  });
}
