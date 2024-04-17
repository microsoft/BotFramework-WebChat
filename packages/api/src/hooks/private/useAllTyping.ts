import type { WebChatActivity } from 'botframework-webchat-core';
import { useMemo, useState } from 'react';
import useActivityUpsertCallback from '../../providers/ActivityListener/useActivityUpsertCallback';
import usePonyfill from '../usePonyfill';

type Typing = {
  at: number;
  last: number;
  lastActivity: Readonly<WebChatActivity>;
  name: string;
  role: string;
};

export default function useAllTyping(): readonly [ReadonlyMap<string, Typing>] {
  const [{ Date }] = usePonyfill();
  const [typing, setTyping] = useState<ReadonlyMap<string, Typing>>(Object.freeze(new Map()));

  useActivityUpsertCallback(activities => {
    const now = Date.now();
    const nextTyping = new Map(typing);
    let changed = false;

    for (const activity of activities.filter(({ type }) => type === 'typing')) {
      const {
        from,
        from: { id }
      } = activity;

      const currentTyping = nextTyping.get(id);

      changed = true;

      nextTyping.set(id, {
        at: currentTyping?.at || now,
        last: now,
        lastActivity: activity,
        name: from.name,
        role: from.role
      });
    }

    changed && setTyping(nextTyping);
  });

  return useMemo(() => Object.freeze([typing]), [typing]);
}
