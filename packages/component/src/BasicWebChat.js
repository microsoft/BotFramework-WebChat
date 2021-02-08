/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import AccessKeySinkSurface from './Utils/AccessKeySink/Surface';
import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicSendBox from './BasicSendBox';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import navigableEvent from './Utils/TypeFocusSink/navigableEvent';
import TypeFocusSinkBox from './Utils/TypeFocusSink';
import useScrollDown from './hooks/useScrollDown';
import useScrollUp from './hooks/useScrollUp';
import useSendBoxFocusRef from './hooks/internal/useSendBoxFocusRef';
import useStyleSet from './hooks/useStyleSet';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';
import useTranscriptFocusRef from './hooks/internal/useTranscriptFocusRef';

const { useDisabled, useStyleOptions } = hooks;

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
  const styleToEmotionObject = useStyleToEmotionObject();

  const connectivityStatusClassName = styleToEmotionObject(CONNECTIVITY_STATUS_STYLE) + '';
  const rootClassName = styleToEmotionObject(ROOT_STYLE) + '';
  const sendBoxClassName = styleToEmotionObject(SEND_BOX_CSS) + '';
  const sinkClassName = styleToEmotionObject(SINK_STYLE) + '';
  const toasterClassName = styleToEmotionObject(TOASTER_STYLE) + '';
  const transcriptClassName = styleToEmotionObject(TRANSCRIPT_STYLE) + '';

  const scrollDown = useScrollDown();
  const scrollUp = useScrollUp();

  const handleKeyDownCapture = useCallback(
    event => {
      const { ctrlKey, metaKey, shiftKey } = event;

      if (ctrlKey || metaKey || shiftKey) {
        return;
      }

      let allowNavigation = navigableEvent(event);

      if (allowNavigation) {
        let handled = true;

        switch (event.key) {
          case 'PageDown':
            scrollDown();
            break;

          case 'PageUp':
            scrollUp();
            break;

          default:
            handled = false;
            break;
        }

        if (handled) {
          event.preventDefault();

          // If a custom HTML control want to handle up/down arrow, we will prevent them from listening to this event to prevent bugs due to handling arrow keys twice.
          event.stopPropagation();
        }
      }
    },
    [scrollDown, scrollUp]
  );

  return (
    <AccessKeySinkSurface className={classNames(rootClassName, rootStyleSet + '', (className || '') + '')}>
      <TypeFocusSinkBox
        className={sinkClassName}
        disabled={disabled}
        onKeyDownCapture={handleKeyDownCapture}
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
