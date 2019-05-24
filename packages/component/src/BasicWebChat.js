/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import BasicSendBox from './BasicSendBox';
import BasicTranscript from './BasicTranscript';
import Composer from './Composer';
import concatMiddleware from './Middleware/concatMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import ErrorBox from './ErrorBox';
import TypeFocusSinkBox from './Utils/TypeFocusSink';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

const TRANSCRIPT_CSS = css({
  flex: 1
});

const SEND_BOX_CSS = css({
  flexShrink: 0
});

function createActivityRenderer(additionalMiddleware) {
  const activityMiddleware = concatMiddleware(additionalMiddleware, createCoreActivityMiddleware())({});

  return (...args) => {
    try {
      return activityMiddleware(({ activity }) => () => {
        console.warn(`No activity found for type "${activity.type}".`);
      })(...args);
    } catch (err) {
      const FailedRenderActivity = () => (
        <ErrorBox message="Failed to render activity">
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </ErrorBox>
      );

      return FailedRenderActivity;
    }
  };
}

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
        <ErrorBox message="Failed to render attachment">
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}

export default class BasicWebChat extends React.Component {
  constructor(props) {
    super(props);

    this.sendBoxRef = React.createRef();

    this.state = {
      activityRenderer: createActivityRenderer(props.activityMiddleware),
      attachmentRenderer: createAttachmentRenderer(props.attachmentMiddleware)
    };
  }

  // TODO: [P2] Move to React 16 APIs
  componentWillReceiveProps({
    activityMiddleware: nextActivityMiddleware,
    attachmentMiddleware: nextAttachmentMiddleware
  }) {
    const { activityMiddleware, attachmentMiddleware } = this.props;

    if (activityMiddleware !== nextActivityMiddleware || attachmentMiddleware !== nextAttachmentMiddleware) {
      this.setState(() => ({
        activityRenderer: createActivityRenderer(nextActivityMiddleware),
        attachmentRenderer: createAttachmentRenderer(nextAttachmentMiddleware)
      }));
    }
  }

  render() {
    const {
      props: { className, ...otherProps },
      sendBoxRef,
      state: { activityRenderer, attachmentRenderer }
    } = this;

    // TODO: [P2] Implement "scrollToBottom" feature

    return (
      <Composer
        activityRenderer={activityRenderer}
        attachmentRenderer={attachmentRenderer}
        sendBoxRef={sendBoxRef}
        {...otherProps}
      >
        {({ styleSet }) => (
          <TypeFocusSinkBox
            className={classNames(ROOT_CSS + '', styleSet.root + '', className + '')}
            role="complementary"
            sendFocusRef={sendBoxRef}
          >
            <BasicTranscript className={TRANSCRIPT_CSS + ''} />
            {!styleSet.options.hideSendBox && <BasicSendBox className={SEND_BOX_CSS + ''} />}
          </TypeFocusSinkBox>
        )}
      </Composer>
    );
  }
}

BasicWebChat.defaultProps = {
  activityMiddleware: undefined,
  attachmentMiddleware: undefined,
  className: ''
};

BasicWebChat.propTypes = {
  activityMiddleware: PropTypes.func,
  attachmentMiddleware: PropTypes.func,
  className: PropTypes.string
};
