import { iterateEquals } from '@msinternal/botframework-webchat-base/utils';
import { type DependencyList } from 'react';
import useMemoWithPrevious from './useMemoWithPrevious';

export default function useMemoIterable<T extends Iterable<unknown>>(factory: () => T, deps: DependencyList) {
  return useMemoWithPrevious<T>(prevValue => {
    const value = factory();

    return typeof prevValue !== 'undefined' && iterateEquals(value, prevValue) ? prevValue : value;
  }, deps);
}
