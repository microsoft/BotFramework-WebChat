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
      const { altKey, ctrlKey, key, metaKey, shiftKey, target } = event;

      if (ctrlKey || metaKey || shiftKey) {
        return;
      }

      let allowArrowKeys;
      const { tagName } = target;

      const autocompleteAttribute = target.getAttribute('autocomplete');
      const autocomplete = autocompleteAttribute && autocompleteAttribute !== 'off';

      // Generally, we allow up/down arrow keys on all elements captured here, except those handled by the user agent.
      // For example, if it is on <select>, we will ignore up/down arrow keys. Also true for textbox with autocomplete.

      // For some elements, user agent don't handle arrow keys when ALT key is hold, so we can still handle ALT + UP/DOWN keys.
      // For example, user agent ignore ALT + UP/DOWN on <input type="text"> with content.
      // Counter-example, user agent continue to handle ALT + UP/DOWN on <input type="number">.
      if (tagName === 'INPUT') {
        const { list, type, value } = target;

        // These are buttons, up/down arrow keys are not handled by the user agent.
        if (
          type === 'button' ||
          type === 'checkbox' ||
          type === 'file' ||
          type === 'image' ||
          type === 'radio' ||
          type === 'reset' ||
          type === 'submit'
        ) {
          allowArrowKeys = true;
        } else if (
          type === 'email' ||
          type === 'password' ||
          type === 'search' ||
          type === 'tel' ||
          type === 'text' ||
          type === 'url'
        ) {
          if (autocomplete || list) {
            // "autocomplete" and "list" are combobox. Up/down arrow keys could be handled by the user agent.
            allowArrowKeys = false;
          } else if (altKey || !value) {
            // If it has content, user agent will handle up/down arrow and it works like HOME/END keys.
            // "altKey" can be used, user agent ignore ALT + UP/DOWN.
            allowArrowKeys = true;
          }
        }
      } else if (tagName === 'SELECT') {
        // User agent handle up/down arrow keys for dropdown list.
        allowArrowKeys = false;
      } else if (tagName === 'TEXTAREA') {
        if (!autocomplete && (altKey || !target.value)) {
          // User agent handle up/down arrow keys for multiline text box if it has content or is auto-complete.
          allowArrowKeys = true;
        }
      } else if (target.getAttribute('contenteditable') === 'true') {
        if (altKey || !target.innerHTML) {
          // "contenteditable" element works like <textarea> minus "autocomplete".
          allowArrowKeys = true;
        }
      } else {
        allowArrowKeys = true;
      }

      if (allowArrowKeys) {
        if (key === 'ArrowDown') {
          event.preventDefault();

          // If a custom HTML control want to handle up/down arrow, we will prevent them from listening to this event to prevent bugs due to handling arrow keys twice.
          event.stopPropagation();

          scrollDown();
        } else if (key === 'ArrowUp') {
          event.preventDefault();

          // If a custom HTML control want to handle up/down arrow, we will prevent them from listening to this event to prevent bugs due to handling arrow keys twice.
          event.stopPropagation();

          scrollUp();
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
