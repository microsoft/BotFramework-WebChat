import type { WebChatActivity } from 'botframework-webchat-core';
import type { ReactElement } from 'react';

import type { SendStatus } from '../types/SendStatus';

// TODO: Migrate this legacy middleware signature.
type RenderActivityStatusOptions = {
  activity: WebChatActivity;
  hideTimestamp: boolean;
  sendState: SendStatus;
};

type RenderActivityStatus = (options: RenderActivityStatusOptions) => ReactElement;

type ActivityStatusEnhancer = (next: RenderActivityStatus) => RenderActivityStatus;
type ActivityStatusMiddleware = () => ActivityStatusEnhancer;

export type { ActivityStatusMiddleware, RenderActivityStatus };
