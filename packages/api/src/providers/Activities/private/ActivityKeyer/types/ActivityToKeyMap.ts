import { type WebChatActivity } from 'botframework-webchat-core';

import { type ActivityKey } from '../../../../../types/ActivityKey';

export type ActivityToKeyMap = Map<WebChatActivity, ActivityKey>;
