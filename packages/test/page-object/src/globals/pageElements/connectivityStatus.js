import root from './root';

export default function connectivityStatus() {
  return root().querySelector(`.webchat__connectivityStatus`);
}
