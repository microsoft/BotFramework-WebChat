import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';

import applyMiddleware from '../../hooks/middleware/applyMiddleware';
import useStyleOptions from '../../hooks/useStyleOptions';
import type GroupActivitiesMiddleware from '../../types/GroupActivitiesMiddleware';
import { type GroupActivities } from '../../types/GroupActivitiesMiddleware';
import usePonyfill from '../Ponyfill/usePonyfill';
import createDefaultGroupActivitiesMiddleware from './private/createDefaultGroupActivitiesMiddleware';
import GroupActivitiesContext, { type GroupActivitiesContextType } from './private/GroupActivitiesContext';
import isGroupingValid from './private/isGroupingValid';

type GroupActivitiesComposerProps = Readonly<{
  children?: ReactNode | undefined;
  groupActivitiesMiddleware: readonly GroupActivitiesMiddleware[];
}>;

function GroupActivitiesComposer({ children, groupActivitiesMiddleware }: GroupActivitiesComposerProps) {
  const [ponyfill] = usePonyfill();
  const [{ groupActivitiesBy, groupTimestamp }] = useStyleOptions();

  const runMiddleware = useMemo<(type?: string | undefined) => GroupActivities>(
    () =>
      applyMiddleware(
        'group activities',
        ...groupActivitiesMiddleware,
        ...createDefaultGroupActivitiesMiddleware({ groupTimestamp, ponyfill }),
        () => () => () => ({})
      ),
    [groupActivitiesMiddleware, groupTimestamp, ponyfill]
  );

  const runAllMiddleware = useMemo(() => runMiddleware(), [runMiddleware]);

  const groupActivities: GroupActivities = useCallback(
    ({ activities }: { activities: readonly WebChatActivity[] }) => {
      const results: Readonly<{
        [key: string]: readonly (readonly WebChatActivity[])[];
      }> = runAllMiddleware({ activities }) || Object.freeze({});
      const validatedResults = new Map<string, readonly (readonly WebChatActivity[])[]>();

      for (const [name, result] of Object.entries(results)) {
        if (isGroupingValid(activities, result)) {
          validatedResults.set(name, result);
        } else {
          validatedResults.set(
            name,
            activities.map(activity => Object.freeze([activity]))
          );
        }
      }

      return Object.fromEntries(validatedResults);
    },
    [runAllMiddleware]
  );

  const groupActivitiesByGroup: Map<string, GroupActivities> = useMemo(
    () =>
      new Map<string, GroupActivities>(
        groupActivitiesBy.map(groupingName => [groupingName, runMiddleware(groupingName)])
      ),
    [groupActivitiesBy, runMiddleware]
  );

  const groupActivitiesByRef = useRefFrom(groupActivitiesBy);

  // When `groupActivitiesMiddleware` or `styleOptions.groupActivities` changed, the callback should be invalidated.
  // The invalidation should cause downstreamers to re-render.
  const groupActivitiesByName = useCallback<
    (activities: readonly WebChatActivity[], groupingName: string) => readonly (readonly WebChatActivity[])[]
  >(
    (activities, groupingName) => {
      const group = groupActivitiesByGroup.get(groupingName);

      if (group) {
        const result: ReadonlyMap<string, readonly (readonly WebChatActivity[])[]> = new Map(
          Object.entries(group({ activities }) || {})
        );

        if (result.has(groupingName)) {
          const groupingResult = result.get(groupingName);

          if (isGroupingValid(activities, groupingResult)) {
            return groupingResult;
          }
        } else {
          console.warn(
            `botframework-webchat: groupActivitiesMiddleware('${groupingName}') does not return any results`
          );
        }
      } else {
        console.warn(
          `botframework-webchat: useGroupActivitiesBy can only be called with one of ${groupActivitiesByRef.current}, however "${groupingName}" was passed instead`
        );
      }

      return Object.freeze(activities.map(activity => Object.freeze([activity])));
    },
    [groupActivitiesByGroup, groupActivitiesByRef]
  );

  const context = useMemo<GroupActivitiesContextType>(
    () => ({
      groupActivities,
      groupActivitiesByName
    }),
    [groupActivities, groupActivitiesByName]
  );

  return <GroupActivitiesContext.Provider value={context}>{children}</GroupActivitiesContext.Provider>;
}

export default memo(GroupActivitiesComposer);
export { type GroupActivitiesComposerProps };
