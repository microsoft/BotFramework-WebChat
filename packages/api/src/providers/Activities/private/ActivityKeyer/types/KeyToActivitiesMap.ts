import { type WebChatActivity } from 'botframework-webchat-core';

import { type ActivityKey } from '../../../../../types/ActivityKey';

export type KeyToActivitiesMap = Map<ActivityKey, readonly WebChatActivity[]>;
