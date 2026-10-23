import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createElement, memo, useCallback, useMemo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import createKeyedStore from '../../hooks/internal/createKeyedStore';
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

  // Both stores notify only the keys whose value changed.
  const logicalGroupingStore = useMemo(() => createKeyedStore<LogicalGrouping>(), []);
  const logicalGroupKeyStore = useMemo(() => createKeyedStore<string>(), []);

  // Removes the activity from the group, unless it has already moved to another group.
  const leaveLogicalGrouping = useCallback(
    (activityKey: string, key: string) =>
      logicalGroupKeyStore.get(activityKey) === key && logicalGroupKeyStore.delete(activityKey),
    [logicalGroupKeyStore]
  );

  // Setting and removing re-render the activities that subscribed: call them from effects, never while rendering.
  const setLogicalGrouping = useCallback(
    (key: string, grouping: LogicalGrouping) => {
      logicalGroupingStore
        .get(key)
        ?.activityKeys.forEach(
          activityKey => !grouping.activityKeys.includes(activityKey) && leaveLogicalGrouping(activityKey, key)
        );

      logicalGroupingStore.set(key, grouping);
      grouping.activityKeys.forEach(activityKey => logicalGroupKeyStore.set(activityKey, key));
    },
    [leaveLogicalGrouping, logicalGroupKeyStore, logicalGroupingStore]
  );

  const removeLogicalGrouping = useCallback(
    (key: string) => {
      logicalGroupingStore.get(key)?.activityKeys.forEach(activityKey => leaveLogicalGrouping(activityKey, key));
      logicalGroupingStore.delete(key);
    },
    [leaveLogicalGrouping, logicalGroupingStore]
  );

  const contextValue = useMemo<ActivityLogicalGroupingContextType>(
    () => Object.freeze({ logicalGroupKeyStore, logicalGroupingStore, removeLogicalGrouping, setLogicalGrouping }),
    [logicalGroupKeyStore, logicalGroupingStore, removeLogicalGrouping, setLogicalGrouping]
  );

  return createElement(ActivityLogicalGroupingContext.Provider, { value: contextValue }, children);
};

ActivityLogicalGroupingComposer.displayName = 'ActivityLogicalGroupingComposer';

export default memo(ActivityLogicalGroupingComposer);
export { activityLogicalGroupingComposerPropsSchema, type ActivityLogicalGroupingComposerProps };
