import usePonyfillContext from './private/useContext';

import type { GlobalScopePonyfill } from 'botframework-webchat-core';

export default function usePonyfill(): readonly [GlobalScopePonyfill] {
  return usePonyfillContext().ponyfillState;
}
