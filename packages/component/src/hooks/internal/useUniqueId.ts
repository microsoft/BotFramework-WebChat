/* eslint no-magic-numbers: ["error", { "ignore": [2, 5, 36] }] */

import { useMemo } from 'react';
import random from 'math-random';

export default function useUniqueId(prefix?: string): string {
  const id = useMemo(() => random().toString(36).substr(2, 5), []);

  prefix = prefix ? `${prefix}--` : '';

  return `${prefix}${id}`;
}
