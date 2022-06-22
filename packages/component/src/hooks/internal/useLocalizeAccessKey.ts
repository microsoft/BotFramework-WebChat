import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import useNavigatorPlatform from './useNavigatorPlatform';

const { useLocalizer } = hooks;

export default function useLocalizeAccessKey(type: 'accessible name' | 'aria-keyshortcuts') {
  const [{ apple }] = useNavigatorPlatform();
  const localize = useLocalizer();

  return useCallback(
    accessKey => {
      if (!accessKey || typeof accessKey !== 'string' || !accessKey.length) {
        throw new Error('useLocalizeAccessKey: "accessKey" must be a non-empty string');
      }

      if (type === 'accessible name') {
        // This will localize as "Alt + Shift + A".
        return localize(apple ? 'ACCESS_KEY_FOR_MAC_ALT' : 'ACCESS_KEY_ALT', accessKey[0]);
      }

      // "aria-keyshortcuts" do not need to be localized, it should be "alt+shift+a".
      // On Mac, "AltGraph" is preferred over "Option" key.
      // https://w3c.github.io/aria/#aria-keyshortcuts
      return (apple ? 'Control+AltGraph+' : 'Alt+Shift+') + accessKey[0];
    },
    [apple, localize, type]
  );
}
