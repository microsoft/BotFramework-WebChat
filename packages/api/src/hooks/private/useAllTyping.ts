import { useMemo, useState } from 'react';
import useActivityUpsertCallback from '../../providers/ActivityListener/useActivityUpsertCallback';
import usePonyfill from '../usePonyfill';

type Typing = {
  at: number;
  last: number;
  name: string;
  role: string;
};

export default function useAllTyping(): readonly [ReadonlyMap<string, Typing>] {
  const [{ Date }] = usePonyfill();
  const [typing, setTyping] = useState<ReadonlyMap<string, Typing>>(Object.freeze(new Map()));

  useActivityUpsertCallback(activities => {
    const now = Date.now();
    let nextTyping = typing;

    for (const {
      from,
      from: { id }
    } of activities.filter(({ type }) => type === 'typing')) {
      const currentTyping = nextTyping.get(id);

      nextTyping = {
        ...nextTyping,
        [id]: {
          at: currentTyping?.at || now,
          last: now,
          name: from.name,
          role: from.role
        }
      };
    }

    nextTyping === typing || setTyping(nextTyping);
  });

  return useMemo(() => Object.freeze([typing]), [typing]);
}
