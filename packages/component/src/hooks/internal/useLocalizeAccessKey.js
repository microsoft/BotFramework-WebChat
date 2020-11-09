import { useCallback } from 'react';
import { hooks } from 'botframework-webchat-api';

import useNavigatorPlatform from './useNavigatorPlatform';

const { useLocalizer } = hooks;

export default function useLocalizeAccessKey() {
  const [{ apple }] = useNavigatorPlatform();
  const localize = useLocalizer();

  return useCallback(
    accessKey => {
      if (!accessKey || typeof accessKey !== 'string' || !accessKey.length) {
        throw new Error('useLocalizeAccessKey: "accessKey" must be a non-empty string');
      }

      return localize(apple ? 'ACCESS_KEY_FOR_MAC_ALT' : 'ACCESS_KEY_ALT', accessKey[0]);
    },
    [apple, localize]
  );
}
