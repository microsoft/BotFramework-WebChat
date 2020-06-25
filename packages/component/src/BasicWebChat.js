/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicSendBox from './BasicSendBox';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import Composer from './Composer';
import TypeFocusSinkBox from './Utils/TypeFocusSink';
import useDisabled from './hooks/useDisabled';
import useSendBoxFocusRef from './hooks/internal/useSendBoxFocusRef';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import useTranscriptFocusRef from './hooks/internal/useTranscriptFocusRef';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

const CONNECTIVITY_STATUS_CSS = css({
  flexShrink: 0
});

const SEND_BOX_CSS = css({
  flexShrink: 0
});

const TOASTER_CSS = css({
  flexShrink: 0
});

const TRANSCRIPT_CSS = css({
  flex: 1
});

const BasicWebChat = ({ className }) => {
  const [{ root: rootStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const [options] = useStyleOptions();
  const [sendBoxFocusRef] = useSendBoxFocusRef();
  const [transcriptFocusRef] = useTranscriptFocusRef();

  return (
    <TypeFocusSinkBox
      className={classNames(ROOT_CSS + '', rootStyleSet + '', className + '')}
      disabled={disabled}
      ref={transcriptFocusRef}
      role="complementary"
      sendFocusRef={sendBoxFocusRef}
    >
      {!options.hideToaster && <BasicToaster className={TOASTER_CSS + ''} />}
      <BasicTranscript className={TRANSCRIPT_CSS + ''} />
      <BasicConnectivityStatus className={CONNECTIVITY_STATUS_CSS + ''} />
      {!options.hideSendBox && <BasicSendBox className={SEND_BOX_CSS + ''} />}
    </TypeFocusSinkBox>
  );
};

export default BasicWebChat;

BasicWebChat.defaultProps = {
  ...Composer.defaultProps,
  className: ''
};

BasicWebChat.propTypes = {
  ...Composer.propTypes,
  className: PropTypes.string
};
