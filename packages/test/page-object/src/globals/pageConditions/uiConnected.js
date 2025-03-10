import became from './became';
import getActionHistory from '../pageObjects/internal/getActionHistory';
import root from '../pageElements/root';

export default function uiConnected() {
  return became(
    `connected`,
    () =>
      ~getActionHistory().findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED') &&
      !root().querySelector(`.webchat__connectivityStatus`),
    15000
  );
}
