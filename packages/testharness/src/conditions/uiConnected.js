import { getActionHistory } from '../utils/createStore';

export default function uiConnected() {
  return {
    message: 'UI indicate connection succeeded',
    fn: () =>
      ~getActionHistory().findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED') &&
      !document.querySelector(`.webchat__connectivityStatus`)
  };
}
