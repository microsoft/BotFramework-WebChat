import { hooks } from 'botframework-webchat-api';
import { useEffect } from 'react';

import { checkSupport as supportWorker } from '../../Utils/downscaleImageToDataURLUsingWorker';

const { useTrackDimension } = hooks;

const Tracker = () => {
  const trackDimension = useTrackDimension();

  useEffect(() => {
    trackDimension('capability:downscaleImage:workerType', supportWorker() ? 'web worker' : 'main');
    trackDimension('capability:renderer', 'html');
  }, [trackDimension]);

  return false;
};

export default Tracker;
