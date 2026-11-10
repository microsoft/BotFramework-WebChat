import { POST_ACTIVITY_PENDING } from '../../actions/postActivity';
import setSuggestedActions from '../../actions/setSuggestedActions';
import type { Machine } from '../types';

/** `clearSuggestedActionsOnPostActivitySaga`: while online, a message sent clears the suggested actions. */
const clearSuggestedActionsOnPostActivityMachine: Machine = scope =>
  scope.whileOnline((_, online) =>
    online.on(
      ({ payload, type }) => type === POST_ACTIVITY_PENDING && payload.activity.type === 'message',
      (_action, worker) => worker.put(setSuggestedActions())
    )
  );

export default clearSuggestedActionsOnPostActivityMachine;
