import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createElement, memo, useCallback, useMemo, useRef, useState } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import createKeyedSubscription from '../../hooks/internal/keyedSubscription/createKeyedSubscription';
import ActivityLogicalGroupingContext, {
  type ActivityLogicalGroupingContextType,
  type LogicalGrouping
} from './private/ActivityLogicalGroupingContext';

const activityLogicalGroupingComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ActivityLogicalGroupingComposerProps = InferInput<typeof activityLogicalGroupingComposerPropsSchema>;

const ActivityLogicalGroupingComposer = (props: ActivityLogicalGroupingComposerProps) => {
  const { children } = validateProps(activityLogicalGroupingComposerPropsSchema, props);

  const logicalGroupingsRef = useRef<Map<string, LogicalGrouping>>(new Map());
  const activityToGroupMapRef = useRef<ReadonlyMap<string, string | undefined>>(new Map());
  const [groupIsCollapsedSubscription] = useState(() => createKeyedSubscription<string>());
  const [logicalGroupKeySubscription] = useState(() => createKeyedSubscription<string>());

  // Notifies only the activities whose group key changed.
  const setActivityToGroupMap = useCallback(
    (nextActivityToGroupMap: ReadonlyMap<string, string | undefined>) => {
      const { current: prevActivityToGroupMap } = activityToGroupMapRef;

      activityToGroupMapRef.current = nextActivityToGroupMap;

      logicalGroupKeySubscription.notify(
        Array.from(new Set([...prevActivityToGroupMap.keys(), ...nextActivityToGroupMap.keys()])).filter(
          activityKey => prevActivityToGroupMap.get(activityKey) !== nextActivityToGroupMap.get(activityKey)
        )
      );
    },
    [activityToGroupMapRef, logicalGroupKeySubscription]
  );

  // Setting and removing notify `useGroupIsCollapsed()` and `useLogicalGroupKey()`, which re-render: call them from effects, never while rendering.
  const setLogicalGrouping = useCallback(
    (key: string, grouping: LogicalGrouping) => {
      const prevGrouping = logicalGroupingsRef.current.get(key);
      const prevGroupingKeys = prevGrouping?.activityKeys ?? [];

      logicalGroupingsRef.current.set(key, grouping);

      const toRemoveSet = new Set(prevGroupingKeys).difference(new Set(grouping.activityKeys));
      const toAddSet = new Set(grouping.activityKeys).difference(new Set(prevGroupingKeys));

      setActivityToGroupMap(
        new Map(
          [].concat(
            Array.from(activityToGroupMapRef.current).filter(
              ([activityKey, groupKey]) => !!groupKey && (groupKey !== key || !toRemoveSet.has(activityKey))
            ),
            Array.from(toAddSet).map(activityKey => [activityKey, key] as const)
          )
        )
      );

      prevGrouping?.isCollapsed !== grouping.isCollapsed && groupIsCollapsedSubscription.notify([key]);
    },
    [activityToGroupMapRef, groupIsCollapsedSubscription, logicalGroupingsRef, setActivityToGroupMap]
  );

  const removeLogicalGrouping = useCallback(
    (key: string) => {
      logicalGroupingsRef.current.delete(key);

      setActivityToGroupMap(new Map([...activityToGroupMapRef.current].filter(([, value]) => value !== key)));
      groupIsCollapsedSubscription.notify([key]);
    },
    [activityToGroupMapRef, groupIsCollapsedSubscription, logicalGroupingsRef, setActivityToGroupMap]
  );

  const getLogicalGroupKey = useCallback(
    (activityKey: string): string | undefined => activityToGroupMapRef.current.get(activityKey),
    [activityToGroupMapRef]
  );

  const getGroupIsCollapsed = useCallback(
    (groupKey: string): boolean | undefined => logicalGroupingsRef.current.get(groupKey)?.isCollapsed,
    [logicalGroupingsRef]
  );

  const getGroupBoundaries = useCallback(
    (groupKey: string): [string, string] => {
      const group = logicalGroupingsRef.current.get(groupKey);
      if (!group || !group.activityKeys.length) {
        return [undefined, undefined];
      }
      // eslint-disable-next-line no-magic-numbers
      return [group.activityKeys.at(0), group.activityKeys.at(-1)];
    },
    [logicalGroupingsRef]
  );

  const contextValue: ActivityLogicalGroupingContextType = useMemo(
    () =>
      Object.freeze({
        getGroupBoundaries,
        getGroupIsCollapsed,
        getLogicalGroupKey,
        removeLogicalGrouping,
        setLogicalGrouping,
        subscribeGroupIsCollapsed: groupIsCollapsedSubscription.subscribe,
        subscribeLogicalGroupKey: logicalGroupKeySubscription.subscribe
      }),
    [
      getGroupBoundaries,
      getGroupIsCollapsed,
      getLogicalGroupKey,
      groupIsCollapsedSubscription,
      logicalGroupKeySubscription,
      removeLogicalGrouping,
      setLogicalGrouping
    ]
  );

  return createElement(ActivityLogicalGroupingContext.Provider, { value: contextValue }, children);
};

ActivityLogicalGroupingComposer.displayName = 'ActivityLogicalGroupingComposer';

export default memo(ActivityLogicalGroupingComposer);
export { activityLogicalGroupingComposerPropsSchema, type ActivityLogicalGroupingComposerProps };
