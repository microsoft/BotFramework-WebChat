import { useContext } from 'react';

import RovingTabIndexContext from './Context';

export default function useRovingTabIndexContext(throwOnUndefined = true) {
  const contextValue = useContext(RovingTabIndexContext);

  if (throwOnUndefined && !contextValue) {
    throw new Error('botframework-webchat internal: This hook can only be used under <RovingTabIndexComposer>.');
  }

  return contextValue;
}
