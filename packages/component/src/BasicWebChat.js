/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import AccessKeySinkSurface from './Utils/AccessKeySink/Surface';
import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicSendBox from './BasicSendBox';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import TypeFocusSinkBox from './Utils/TypeFocusSink';
import useDisabled from './hooks/useDisabled';
import useSendBoxFocusRef from './hooks/internal/useSendBoxFocusRef';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import useTranscriptFocusRef from './hooks/internal/useTranscriptFocusRef';
import useStyleToClassName from './hooks/internal/useStyleToClassName';

const ROOT_STYLE = {
  display: 'flex',
  flexDirection: 'column'
};

const SINK_STYLE = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden'
};

const CONNECTIVITY_STATUS_STYLE = {
  flexShrink: 0
};

const SEND_BOX_CSS = {
  flexShrink: 0
};

const TOASTER_STYLE = {
  flexShrink: 0
};

const TRANSCRIPT_STYLE = {
  flex: 1
};

const BasicWebChat = ({ className }) => {
  const [{ root: rootStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const [options] = useStyleOptions();
  const [sendBoxFocusRef] = useSendBoxFocusRef();
  const [transcriptFocusRef] = useTranscriptFocusRef();
  const styleToClassName = useStyleToClassName();

  const connectivityStatusClassName = styleToClassName(CONNECTIVITY_STATUS_STYLE);
  const rootClassName = styleToClassName(ROOT_STYLE);
  const sendBoxClassName = styleToClassName(SEND_BOX_CSS);
  const sinkClassName = styleToClassName(SINK_STYLE);
  const toasterClassName = styleToClassName(TOASTER_STYLE);
  const transcriptClassName = styleToClassName(TRANSCRIPT_STYLE);

  return (
    <AccessKeySinkSurface className={classNames(rootClassName, rootStyleSet + '', (className || '') + '')}>
      <TypeFocusSinkBox
        className={sinkClassName}
        disabled={disabled}
        ref={transcriptFocusRef}
        role="complementary"
        sendFocusRef={sendBoxFocusRef}
      >
        {!options.hideToaster && <BasicToaster className={toasterClassName} />}
        <BasicTranscript className={transcriptClassName} />
        <BasicConnectivityStatus className={connectivityStatusClassName} />
        {!options.hideSendBox && <BasicSendBox className={sendBoxClassName} />}
      </TypeFocusSinkBox>
    </AccessKeySinkSurface>
  );
};

export default BasicWebChat;

BasicWebChat.defaultProps = {
  className: ''
};

BasicWebChat.propTypes = {
  className: PropTypes.string
};
