import type { IncomingActivityAction } from '../actions/incomingActivity';
import type { PostActivityFulfilledAction, PostActivityPendingAction } from '../actions/postActivity';
import type { SetNotificationAction } from '../actions/setNotification';
import type { LocalId } from '../reducers/activities/sort/property/LocalId';

/** Where the impure values of `prepareAction()` come from. */
type PrepareDeps = {
  readonly newId: () => string;
  readonly now: () => number;
};

/** An action as the reducers get it: `prepareAction()` added the values they cannot compute (time, new IDs) to `meta`. */
type Prepared<TAction, TMeta> = TAction & { readonly meta: TMeta };

type PreparedIncomingActivityAction = Prepared<
  IncomingActivityAction,
  {
    /** The ID of an activity that came without one. */
    readonly fallbackId: string;
    /** The local ID of an activity that is new to the transcript. */
    readonly localId: LocalId;
    readonly now: number;
  }
>;

type PreparedPostActivityFulfilledAction = Prepared<PostActivityFulfilledAction, { readonly now: number }>;

type PreparedPostActivityPendingAction = Prepared<
  PostActivityPendingAction,
  { readonly localId: LocalId; readonly now: number }
>;

type PreparedSetNotificationAction = Prepared<SetNotificationAction, { readonly now: number }>;

export type {
  PrepareDeps,
  PreparedIncomingActivityAction,
  PreparedPostActivityFulfilledAction,
  PreparedPostActivityPendingAction,
  PreparedSetNotificationAction
};
