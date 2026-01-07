/* eslint no-magic-numbers: ["error", { "ignore": [2, 5, 36] }] */

import { useMemo } from 'react';
// TODO: fix math-random fails to import crypto
// import random from 'math-random';

export default function useUniqueId(prefix?: string): string {
  // This is `useId`, expected to be impure.
  // eslint-disable-next-line react-hooks/purity
  const id = useMemo(() => Math.random().toString(36).substr(2, 5), []);

  prefix = prefix ? `${prefix}--` : '';

  return `${prefix}${id}`;
}
