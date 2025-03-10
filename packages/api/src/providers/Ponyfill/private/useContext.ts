import { useContext } from 'react';

import PonyfillContext from './PonyfillContext';

import type { Context } from 'react';

type ContextOf<T> = T extends Context<infer C> ? C : never;

export default function usePonyfillContext(): Exclude<ContextOf<typeof PonyfillContext>, undefined> {
  const context = useContext(PonyfillContext);

  if (!context) {
    throw new Error('botframework-webchat: This hook can only be used under <PonyfillContext>.');
  }

  return context;
}
