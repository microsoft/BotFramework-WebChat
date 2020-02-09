import classNames from 'classnames';
import React from 'react';

import ErrorNotificationIcon from './Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';

const ConnectivityStatusJavaScriptError = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const connectivityStatusLabelText = useLocalize('ConnectivityStatus');
  const renderErrorNotificationText = useLocalize('RENDER_ERROR_NOTIFICATION');

  return (
    <React.Fragment>
      <ScreenReaderText text={connectivityStatusLabelText + renderErrorNotificationText} />
      <div aria-hidden={true} className={classNames('webchat__connectivityStatus', errorNotificationStyleSet + '')}>
        <ErrorNotificationIcon />
        {renderErrorNotificationText}
      </div>
    </React.Fragment>
  );
};

export default ConnectivityStatusJavaScriptError;
