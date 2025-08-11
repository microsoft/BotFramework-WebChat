import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { object, optional, parse, pipe, readonly, type InferOutput } from 'valibot';

import useRenderingActivities from '../RenderingActivities/useRenderingActivities';
import { type GroupedRenderingActivities } from './GroupedRenderingActivities';
import GroupedRenderingActivitiesContext, {
  type GroupedRenderingActivitiesContextType
} from './private/GroupedRenderingActivitiesContext';

const { useGetKeyByActivity, useGroupActivitiesByName, useStyleOptions } = hooks;

const groupedRenderingActivitiesComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type GroupedRenderingActivitiesComposerProps = InferOutput<typeof groupedRenderingActivitiesComposerPropsSchema>;

const GroupedRenderingActivitiesComposer = (props: GroupedRenderingActivitiesComposerProps) => {
  const { children } = parse(groupedRenderingActivitiesComposerPropsSchema, props);

  const [{ groupActivitiesBy }] = useStyleOptions();
  const [activities] = useRenderingActivities();
  const getKeyByActivity = useGetKeyByActivity();
  const groupActivitiesByName = useGroupActivitiesByName();

  const numRenderingActivitiesState = useMemo<readonly [number]>(
    () => Object.freeze([activities.length] as const),
    [activities]
  );

  const groupedRenderingActivitiesState = useMemo<readonly [readonly GroupedRenderingActivities[]]>(() => {
    const run = (
      activities: readonly WebChatActivity[],
      groups: readonly string[]
    ): readonly GroupedRenderingActivities[] => {
      const [name, ...nextNames] = groups;

      if (typeof name === 'undefined') {
        return Object.freeze([
          Object.freeze({
            activities,
            children: Object.freeze([]),
            key: getKeyByActivity(activities[0]),
            groupingName: undefined
          })
        ]);
      }

      return Object.freeze(
        groupActivitiesByName(activities, name).map(grouping =>
          Object.freeze({
            activities: grouping,
            children: run(grouping, nextNames),
            groupingName: name,
            key: getKeyByActivity(grouping[0])
          } satisfies GroupedRenderingActivities)
        )
      );
    };

    return Object.freeze([run(activities, groupActivitiesBy)]);
  }, [activities, getKeyByActivity, groupActivitiesBy, groupActivitiesByName]);

  const context = useMemo<GroupedRenderingActivitiesContextType>(
    () =>
      Object.freeze({
        groupedRenderingActivitiesState,
        numRenderingActivitiesState
      }),
    [groupedRenderingActivitiesState, numRenderingActivitiesState]
  );

  return (
    <GroupedRenderingActivitiesContext.Provider value={context}>{children}</GroupedRenderingActivitiesContext.Provider>
  );
};

GroupedRenderingActivitiesComposer.displayName = 'GroupedRenderingActivitiesComposer';

export default memo(GroupedRenderingActivitiesComposer);
export { type GroupedRenderingActivitiesComposerProps };
