import { hooks } from 'botframework-webchat-api';
import { useEffect, useRef } from 'react';

const { useActiveTyping } = hooks;

function arrayEquals<T>(x: readonly T[], y: readonly T[]): boolean {
  return x.length === y.length && x.every((value, index) => y[+index] === value);
}

/** Gets names of users who are actively typing, sorted by the time they started typing. */
export default function useTypistNames(): readonly [readonly string[]] {
  const [activeTyping] = useActiveTyping();
  const prevTypistNamesStateRef = useRef<readonly [readonly string[]]>(
    Object.freeze([Object.freeze([] as string[])]) as [readonly string[]]
  );

  const activeTypingFromOthersValues = Object.values(activeTyping).filter(({ role }) => role !== 'user');

  // Sort the list by the first typist.
  const sortedActiveTypingFromOthersValues = activeTypingFromOthersValues.sort(({ at: x }, { at: y }) => x - y);

  const typistNamesState: readonly [readonly string[]] = Object.freeze([
    Object.freeze(sortedActiveTypingFromOthersValues.map(({ name }) => name))
  ]) as readonly [readonly string[]];

  const { current: prevTypistNamesState } = prevTypistNamesStateRef;

  const nextTypistNamesState = arrayEquals(typistNamesState[0], prevTypistNamesState[0])
    ? prevTypistNamesState
    : typistNamesState;

  useEffect(() => {
    prevTypistNamesStateRef.current = nextTypistNamesState;
  }, [prevTypistNamesStateRef, nextTypistNamesState]);

  return nextTypistNamesState;
}
