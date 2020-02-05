import React, { useCallback, useState } from 'react';

import ScreenReaderText from '../ScreenReaderText';
import SpinnerAnimation from './Assets/SpinnerAnimation';
import useLocalize from '../hooks/useLocalize';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';
import useTimer from '../hooks/internal/useTimer';
import WarningNotificationIcon from './Assets/WarningNotificationIcon';

const ConnectivityStatusConnecting = () => {
  const [{ slowConnectionAfter }] = useStyleOptions();
  const [
    { connectivityNotification: connectivityNotificationStyleSet, warningNotification: warningNotificationStyleSet }
  ] = useStyleSet();
  const [initialRenderAt] = useState(() => Date.now());
  const [slow, setSlow] = useState(false);
  const connectivityStatusLabelText = useLocalize('ConnectivityStatus');
  const initialConnectionText = useLocalize('INITIAL_CONNECTION_NOTIFICATION');
  const slowConnectionText = useLocalize('SLOW_CONNECTION_NOTIFICATION');

  const handleSlowConnection = useCallback(() => setSlow(true), [setSlow]);

  useTimer(initialRenderAt + slowConnectionAfter, handleSlowConnection);

  return slow ? (
    <React.Fragment>
      <ScreenReaderText text={connectivityStatusLabelText + slowConnectionText} />
      <div aria-hidden={true} className={warningNotificationStyleSet + ''}>
        <WarningNotificationIcon />
        {slowConnectionText}
      </div>
    </React.Fragment>
  ) : (
    <React.Fragment>
      <ScreenReaderText text={connectivityStatusLabelText + initialConnectionText} />
      <div aria-hidden={true} className={connectivityNotificationStyleSet + ''}>
        <SpinnerAnimation />
        {initialConnectionText}
      </div>
    </React.Fragment>
  );
};

export default ConnectivityStatusConnecting;
