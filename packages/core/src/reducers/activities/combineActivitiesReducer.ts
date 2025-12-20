import type { ActionFromReducersMapObject, combineReducers, Reducer, StateFromReducersMapObject } from 'redux';
import type { GlobalScopePonyfill } from '../../types/GlobalScopePonyfill';
import type { WebChatActivity } from '../../types/WebChatActivity';
import isForbiddenPropertyName from '../../utils/isForbiddenPropertyName';
import createGroupedActivitiesReducer, {
  type GroupedActivitiesAction,
  type GroupedActivitiesState
} from './createGroupedActivitiesReducer';
import type { RootPrivateDebugAPI } from '../../types/RootDebugAPI';

type ActivitiesState = {
  activities: readonly WebChatActivity[];
  groupedActivities: GroupedActivitiesState;
};

/**
 * Creates a reducer by combining slice `activities` and `groupedActivities` to an existing sliced reducer.
 *
 * @param ponyfill
 * @param existingSlicedReducer
 * @returns
 */
export default function combineActivitiesReducer<M>(
  ponyfill: GlobalScopePonyfill,
  rootPrivateDebugAPI: RootPrivateDebugAPI,
  existingSlicedReducer: ReturnType<typeof combineReducers<M>>
): Reducer<StateFromReducersMapObject<M> & ActivitiesState, ActionFromReducersMapObject<M> & GroupedActivitiesAction> {
  type ExistingState = StateFromReducersMapObject<M>;
  type ExistingAction = ActionFromReducersMapObject<M>;

  const groupedActivitiesReducer = createGroupedActivitiesReducer(ponyfill, rootPrivateDebugAPI);

  return function (
    state: (ExistingState & ActivitiesState) | undefined,
    action: ExistingAction & GroupedActivitiesAction
  ): ExistingState & ActivitiesState {
    const { activities: _activities, groupedActivities, ...existingState } = state ?? {};
    const nextState = existingSlicedReducer(existingState as ExistingState, action);
    const nextGroupedActivities = groupedActivitiesReducer(groupedActivities, action);

    const existingStateEntries = Object.entries(existingState);
    const nextStateEntries = Object.entries(nextState);

    const hasChanged =
      !state ||
      !Object.is(state.groupedActivities, nextGroupedActivities) ||
      existingStateEntries.length !== nextStateEntries.length ||
      existingStateEntries.some(
        // Denylisting forbidden property names.
        // eslint-disable-next-line security/detect-object-injection
        ([key, value]) => !Object.is(value, isForbiddenPropertyName(key) ? undefined : (nextState as any)[key])
      );

    return hasChanged
      ? { ...nextState, activities: nextGroupedActivities.sortedActivities, groupedActivities: nextGroupedActivities }
      : state;
  };
}
