/* eslint no-console: "off" */

import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';

import ScreenReaderText from './ScreenReaderText';
import useStyleSet from './hooks/useStyleSet';

const { useLocalizer } = hooks;

type ErrorBoxProps = Readonly<{
  error: Error;
  type?: string;
}>;

const ErrorBox = ({ error, type }: ErrorBoxProps): ReactNode => {
  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();
  const localize = useLocalizer();

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_ERROR_BOX_TITLE')} />
      <div className={errorBoxStyleSet}>
        <div>{type}</div>
        {/* The callstack between production and development are different, thus, we should hide it for visual regression test */}
        <details>
          <summary>{error.message}</summary>
          <pre>{error.stack}</pre>
        </details>
      </div>
    </React.Fragment>
  );
};

ErrorBox.defaultProps = {
  type: ''
};

ErrorBox.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired,
  type: PropTypes.string
};

export default ErrorBox;
