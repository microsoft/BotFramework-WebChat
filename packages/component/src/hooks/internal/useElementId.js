import { useMemo } from 'react';
import random from 'math-random';

export default function useElementId(prefix) {
  return useMemo(
    () =>
      `${prefix || 'element'}-${random()
        .toString(36)
        .substr(2, 5)}`,
    [prefix]
  );
}
