import { useContext } from 'react';
import { WebChatActivity } from 'botframework-webchat-core';

import ActivitiesComposerContext from './private/Context';

// TODO: By default, all WebChatActivity should be read-only.
/**
 * Gets and subscribes to list of all activities in the system.
 *
 * Activities could have multiple revisions.
 *
 * @returns
 */
export default function useAllActivities(): readonly [readonly Readonly<WebChatActivity>[]] {
  return useContext(ActivitiesComposerContext).activitiesState;
}
