import React from 'react';

import ScreenReaderText from '../../ScreenReaderText';
// TODO: Should we move ErrorNotificationIcon to under this folder?
import ErrorNotificationIcon from '../../Attachment/Assets/ErrorNotificationIcon';
import useLocalize from '../../hooks/useLocalize';
import useStyleSet from '../../hooks/useStyleSet';

const ConnectivityStatusJavaScriptError = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const connectivityStatusLabelText = useLocalize('ConnectivityStatus');
  const renderErrorNotificationText = useLocalize('RENDER_ERROR_NOTIFICATION');

  return (
    <React.Fragment>
      <ScreenReaderText text={connectivityStatusLabelText + renderErrorNotificationText} />
      <div aria-hidden={true} className={errorNotificationStyleSet + ''}>
        <ErrorNotificationIcon />
        {renderErrorNotificationText}
      </div>
    </React.Fragment>
  );
};

export default ConnectivityStatusJavaScriptError;
