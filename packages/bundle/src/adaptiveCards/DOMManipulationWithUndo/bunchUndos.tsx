import type { UndoFunction } from './types/UndoFunction';

export default function bunchUndos(fns: UndoFunction[]): UndoFunction {
  let called: boolean;

  return () => {
    if (!called) {
      called = true;
      [...fns].reverse().forEach(fn => fn?.());
    }
  };
}
