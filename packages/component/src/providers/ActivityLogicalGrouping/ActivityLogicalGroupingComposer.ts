import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createElement, memo, useCallback, useMemo, useRef } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import ActivityLogicalGroupingContext, {
  type ActivityLogicalGroupingContextType,
  type GroupState,
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
  const listenersRef = useRef<Set<() => void>>(new Set());

  const notify = useCallback(() => listenersRef.current.forEach(listener => listener()), [listenersRef]);

  // Adding and removing notify `useLogicalGroupKey()`, which re-renders: call them from effects, never while rendering.
  const addLogicalGrouping = useCallback(
    (grouping: LogicalGrouping) => {
      const prevGroupingKeys = logicalGroupingsRef.current.get(grouping.key)?.activityKeys ?? [];

      logicalGroupingsRef.current.set(grouping.key, grouping);

      const toRemoveSet = new Set(prevGroupingKeys).difference(new Set(grouping.activityKeys));
      const toAddSet = new Set(grouping.activityKeys).difference(new Set(prevGroupingKeys));

      activityToGroupMapRef.current = new Map(
        [].concat(
          Array.from(activityToGroupMapRef.current).filter(([, value]) => !!value && !toRemoveSet.has(value)),
          Array.from(toAddSet).map(activityKey => [activityKey, grouping.key] as const)
        )
      );

      notify();
    },
    [activityToGroupMapRef, logicalGroupingsRef, notify]
  );

  const removeLogicalGrouping = useCallback(
    (key: string) => {
      logicalGroupingsRef.current.delete(key);
      activityToGroupMapRef.current = new Map([...activityToGroupMapRef.current].filter(([, value]) => value !== key));

      notify();
    },
    [activityToGroupMapRef, logicalGroupingsRef, notify]
  );

  const getLogicalGroupKey = useCallback(
    (activityKey: string): string | undefined => activityToGroupMapRef.current.get(activityKey),
    [activityToGroupMapRef]
  );

  const subscribeLogicalGrouping = useCallback(
    (listener: () => void): (() => void) => {
      listenersRef.current.add(listener);

      return () => {
        listenersRef.current.delete(listener);
      };
    },
    [listenersRef]
  );

  const getGroupState = useCallback(
    (groupKey: string): GroupState | undefined => {
      const group = logicalGroupingsRef.current.get(groupKey);
      return group?.getGroupState?.();
    },
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
        addLogicalGrouping,
        getGroupBoundaries,
        getGroupState,
        getLogicalGroupKey,
        removeLogicalGrouping,
        subscribeLogicalGrouping
      }),
    [
      addLogicalGrouping,
      getGroupBoundaries,
      getGroupState,
      getLogicalGroupKey,
      removeLogicalGrouping,
      subscribeLogicalGrouping
    ]
  );

  return createElement(ActivityLogicalGroupingContext.Provider, { value: contextValue }, children);
};

ActivityLogicalGroupingComposer.displayName = 'ActivityLogicalGroupingComposer';

export default memo(ActivityLogicalGroupingComposer);
export { activityLogicalGroupingComposerPropsSchema, type ActivityLogicalGroupingComposerProps };
