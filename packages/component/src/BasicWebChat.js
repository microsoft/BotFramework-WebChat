/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';

import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicSendBox from './BasicSendBox';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import Composer from './Composer';
import concatMiddleware from './Middleware/concatMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createCoreToastMiddleware from './Middleware/Toast/createCoreMiddleware';
import createCoreTypingIndicatorMiddleware from './Middleware/TypingIndicator/createCoreMiddleware';
import ErrorBox from './ErrorBox';
import TypeFocusSinkBox from './Utils/TypeFocusSink';
import useTrackException from './hooks/useTrackException';

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

const SilentError = ({ err, message }) => {
  const trackException = useTrackException();

  useEffect(() => {
    trackException(err || new Error(message), false);
  }, [err, message, trackException]);

  return false;
};

// TODO: [P2] We should move these into <Composer>
function createActivityRenderer(additionalMiddleware) {
  const activityMiddleware = concatMiddleware(additionalMiddleware, createCoreActivityMiddleware())({});

  return (...args) => {
    try {
      return activityMiddleware(({ activity }) => () => (
        <SilentError message={`No activity found for type "${activity.type}".`} />
      ))(...args);
    } catch (err) {
      const FailedRenderActivity = () => (
        <ErrorBox error={err} message="Failed to render activity">
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </ErrorBox>
      );

      return FailedRenderActivity;
    }
  };
}

// TODO: [P2] #2859 We should move these into <Composer>
function createActivityStatusRenderer(additionalMiddleware) {
  const activityStatusMiddleware = concatMiddleware(additionalMiddleware, createCoreActivityStatusMiddleware())({});

  return (...args) => {
    try {
      return activityStatusMiddleware(() => false)(...args);
    } catch (err) {
      const { message, stack } = err;

      return (
        <ErrorBox error={err} message="Failed to render activity status">
          <pre>{JSON.stringify({ message, stack }, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}

// TODO: [P2] #2859 We should move these into <Composer>
function createAttachmentRenderer(additionalMiddleware) {
  const attachmentMiddleware = concatMiddleware(additionalMiddleware, createCoreAttachmentMiddleware())({});

  return (...args) => {
    try {
      return attachmentMiddleware(({ attachment }) => (
        <ErrorBox message="No renderer for this attachment">
          <pre>{JSON.stringify(attachment, null, 2)}</pre>
        </ErrorBox>
      ))(...args);
    } catch (err) {
      return (
        <ErrorBox error={err} message="Failed to render attachment">
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}

// TODO: [P2] #2859 We should move these into <Composer>
function createToastRenderer(additionalMiddleware) {
  const toastMiddleware = concatMiddleware(additionalMiddleware, createCoreToastMiddleware())({});

  return (...args) => {
    try {
      return toastMiddleware(({ notification }) => (
        <ErrorBox message="No renderer for this notification">
          <pre>{JSON.stringify(notification, null, 2)}</pre>
        </ErrorBox>
      ))(...args);
    } catch (err) {
      const { message, stack } = err;

      console.error({ message, stack });

      return (
        <ErrorBox error={err} message="Failed to render notification">
          <pre>{JSON.stringify({ message, stack }, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}

function createTypingIndicatorRenderer(additionalMiddleware) {
  const typingIndicatorMiddleware = concatMiddleware(additionalMiddleware, createCoreTypingIndicatorMiddleware())({});

  return (...args) => {
    try {
      return typingIndicatorMiddleware(({ activeTyping, typing, visible }) => (
        <ErrorBox message="No renderer for typing indicator">
          <pre>{JSON.stringify({ activeTyping, typing, visible }, null, 2)}</pre>
        </ErrorBox>
      ))(...args);
    } catch (err) {
      const { message, stack } = err;

      console.error({ message, stack });

      return (
        <ErrorBox error={err} message="Failed to render typing indicator">
          <pre>{JSON.stringify({ message, stack }, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}

const BasicWebChat = ({
  activityMiddleware,
  activityStatusMiddleware,
  attachmentMiddleware,
  className,
  toastMiddleware,
  typingIndicatorMiddleware,
  ...otherProps
}) => {
  const sendBoxRef = useRef();
  const activityRenderer = useMemo(() => createActivityRenderer(activityMiddleware), [activityMiddleware]);
  const activityStatusRenderer = useMemo(() => createActivityStatusRenderer(activityStatusMiddleware), [
    activityStatusMiddleware
  ]);
  const attachmentRenderer = useMemo(() => createAttachmentRenderer(attachmentMiddleware), [attachmentMiddleware]);
  const toastRenderer = useMemo(() => createToastRenderer(toastMiddleware), [toastMiddleware]);
  const typingIndicatorRenderer = useMemo(() => createTypingIndicatorRenderer(typingIndicatorMiddleware), [
    typingIndicatorMiddleware
  ]);

  return (
    <Composer
      activityRenderer={activityRenderer}
      activityStatusRenderer={activityStatusRenderer}
      attachmentRenderer={attachmentRenderer}
      sendBoxRef={sendBoxRef}
      toastRenderer={toastRenderer}
      typingIndicatorRenderer={typingIndicatorRenderer}
      {...otherProps}
    >
      {({ styleSet }) => (
        <TypeFocusSinkBox
          className={classNames(ROOT_CSS + '', styleSet.root + '', className + '')}
          role="complementary"
          sendFocusRef={sendBoxRef}
        >
          {!styleSet.options.hideToaster && <BasicToaster className={TOASTER_CSS + ''} />}
          <BasicTranscript className={TRANSCRIPT_CSS + ''} />
          <BasicConnectivityStatus className={CONNECTIVITY_STATUS_CSS + ''} />
          {!styleSet.options.hideSendBox && <BasicSendBox className={SEND_BOX_CSS + ''} />}
        </TypeFocusSinkBox>
      )}
    </Composer>
  );
};

export default BasicWebChat;

BasicWebChat.defaultProps = {
  ...Composer.defaultProps,
  activityMiddleware: undefined,
  attachmentMiddleware: undefined,
  className: ''
};

BasicWebChat.propTypes = {
  ...Composer.propTypes,
  activityMiddleware: PropTypes.func,
  attachmentMiddleware: PropTypes.func,
  className: PropTypes.string
};
