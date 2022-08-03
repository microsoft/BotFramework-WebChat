import type { ReactElement } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import type { SendStatus } from '../types/internal/SendStatus';

// TODO: Migrate this legacy middleware signature.
type RenderActivityStatusOptions = {
  activity: WebChatActivity;
  hideTimestamp: boolean;
  sendState: SendStatus;

  // "nextVisibleActivity" is for backward compatibility, please remove this line on or after 2022-07-22.
  /** @deprecated */
  nextVisibleActivity: WebChatActivity;

  // "sameTimestampGroup" is for backward compatibility, please remove this line on or after 2022-07-22.
  /** @deprecated */
  sameTimestampGroup: boolean;
};

type RenderActivityStatus = (options: RenderActivityStatusOptions) => ReactElement;

type ActivityStatusEnhancer = (next: RenderActivityStatus) => RenderActivityStatus;
type ActivityStatusMiddleware = () => ActivityStatusEnhancer;

export type { ActivityStatusMiddleware, RenderActivityStatus };
