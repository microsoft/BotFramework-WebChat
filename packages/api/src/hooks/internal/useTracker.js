import { useEffect } from 'react';

import useLanguage from '../useLanguage';
import useTrackDimension from '../useTrackDimension';
import useTrackEvent from '../useTrackEvent';

function useTracker() {
  const [language] = useLanguage();
  const trackDimension = useTrackDimension();
  const trackEvent = useTrackEvent();

  // TODO: [P2] #2937 Track how many of them customized the following:
  // - activityMiddleware
  // - activityStatusMiddleware
  // - attachmentMiddleware
  // - cardActionMiddleware
  // - toastMiddleware
  // - styleOptions

  useEffect(() => {
    trackDimension('prop:locale', language);
  }, [language, trackDimension]);

  useEffect(() => {
    trackEvent('init');
  }, [trackEvent]);
}

export default useTracker;
