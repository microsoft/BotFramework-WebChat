import React, { memo, useMemo, type ReactNode } from 'react';
import createDefaultGroupActivitiesMiddleware from '../../hooks/middleware/createDefaultGroupActivitiesMiddleware';
import type GroupActivitiesMiddleware from '../../types/GroupActivitiesMiddleware';
import usePonyfill from '../Ponyfill/usePonyfill';

import applyMiddleware from '../../hooks/middleware/applyMiddleware';
import useStyleOptions from '../../hooks/useStyleOptions';
import { type GroupActivities } from '../../types/GroupActivitiesMiddleware';
import GroupActivitiesContext, { type GroupActivitiesContextType } from './private/GroupActivitiesContext';

type GroupActivitiesComposerProps = Readonly<{
  children?: ReactNode | undefined;
  groupActivitiesMiddleware: readonly GroupActivitiesMiddleware[];
}>;

function GroupActivitiesComposer({ children, groupActivitiesMiddleware }: GroupActivitiesComposerProps) {
  const [ponyfill] = usePonyfill();
  const [{ groupTimestamp }] = useStyleOptions();

  const runMiddleware = applyMiddleware(
    'group activities',
    ...groupActivitiesMiddleware,
    createDefaultGroupActivitiesMiddleware({ groupTimestamp, ponyfill })
  );

  const groupActivities: GroupActivities = runMiddleware({});

  const context = useMemo<GroupActivitiesContextType>(() => ({ groupActivities }), [groupActivities]);

  return <GroupActivitiesContext.Provider value={context}>{children}</GroupActivitiesContext.Provider>;
}

export default memo(GroupActivitiesComposer);
export type { GroupActivitiesComposerProps };
