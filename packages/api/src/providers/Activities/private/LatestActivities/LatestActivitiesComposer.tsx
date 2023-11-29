import React, { memo, type ReactNode, useMemo } from 'react';

import { type ContextOf } from '../../../../types/internal/ContextOf';
import assertNotNullOrUndefined from '../../../../utils/assertNotNullOrUndefined';
import lastOf from '../../../../utils/lastOf';
import LatestActivitiesContext from './private/Context';
import useActivityKeys from '../ActivityKeyer/useActivityKeys';
import useGetActivitiesByKey from '../ActivityKeyer/useGetActivitiesByKey';
import useAllActivities from '../AllActivities/useAllActivities';

type Props = Readonly<{ children?: ReactNode }>;

const LatestActivitiesComposer = memo(({ children }: Props) => {
  // When we receive the first revision of the activity, we should fix the activity at the position.
  // Future revisions of the activity should not move the activity to a latter position in the chat history.
  const [activityKeys] = useActivityKeys();
  const getActivitiesByKey = useGetActivitiesByKey();
  const [allActivities] = useAllActivities();

  const latestActivities = useMemo(
    () =>
      activityKeys.map(key =>
        assertNotNullOrUndefined(
          lastOf(getActivitiesByKey(key)),
          `FinalActivityComposer: activity key "${key}" cannot be found.`
        )
      ),
    [activityKeys, getActivitiesByKey]
  );

  const latestActivitiesState = useMemo(() => Object.freeze([latestActivities] as const), [latestActivities]);

  const context = useMemo<ContextOf<typeof LatestActivitiesContext>>(
    () => ({ latestActivitiesState }),
    [latestActivitiesState]
  );

  // eslint-disable-next-line no-console
  console.log('LatestActivitiesContext.render', { activityKeys, latestActivities, allActivities });

  return <LatestActivitiesContext.Provider value={context}>{children}</LatestActivitiesContext.Provider>;
});

LatestActivitiesComposer.displayName = 'LatestActivitiesComposer';

export default LatestActivitiesComposer;
