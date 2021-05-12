import became from './became';
import getActionHistory from '../pageObjects/internal/getActionHistory';

export default function uiConnected() {
  return became(
    `connected`,
    () =>
      ~getActionHistory().findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED') &&
      !document.querySelector(`.webchat__connectivityStatus`),
    15000
  );
}
