import { ReactNode } from 'react';

import DirectLineActivity from './external/DirectLineActivity';

type RenderActivity = ({
  hideTimestamp,
  renderActivityStatus,
  renderAvatar,
  showCallout
}: {
  hideTimestamp: boolean;
  renderActivityStatus: Function;
  renderAvatar: Function;
  showCallout: boolean;
}) => ReactNode | false;

type ActivityRenderer = ({
  activity,
  nextVisibleActivity
}: {
  activity: DirectLineActivity;
  nextVisibleActivity: DirectLineActivity;
}) => RenderActivity;

type ActivityEnhancer = (next: ActivityRenderer) => ActivityRenderer;
type ActivityMiddleware = () => ActivityEnhancer;

export default ActivityMiddleware;
