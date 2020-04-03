import getActionHistory from '../pageObjects/internal/getActionHistory';

export default function uiConnected() {
  return {
    message: 'UI indicate connection succeeded',
    fn: () =>
      ~getActionHistory().findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED') &&
      !document.querySelector(`.webchat__connectivityStatus`)
  };
}
