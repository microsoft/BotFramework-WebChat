import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicSendBox from './BasicSendBox';
import BasicTranscript from './BasicTranscript';
import Composer from './Composer';
import concatMiddleware from './Middleware/concatMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import ErrorBox from './ErrorBox';
import TypeFocusSinkBox from './Utils/TypeFocusSink';

const ROOT_CSS = css( {
  display: 'flex',
  flexDirection: 'column'
} );

const TRANSCRIPT_CSS = css( {
  flex: 1
} );

const SEND_BOX_CSS = css( {
  flexShrink: 0
} );

export default class extends React.Component {
  constructor( props ) {
    super( props );

    this.sendBoxRef = React.createRef();

    this.state = {
      activityRenderer: this.createActivityRenderer( props.activityMiddleware ),
      attachmentRenderer: this.createAttachmentRenderer( props.attachmentMiddleware )
    };
  }

  // TODO: [P2] Move to React 16 APIs
  componentWillReceiveProps( { activityMiddleware, attachmentMiddleware } ) {
    if (
      this.props.activityMiddleware !== activityMiddleware
      || this.props.attachmentMiddleware !== attachmentMiddleware
    ) {
      this.setState( () => ( {
        activityRenderer: this.createActivityRenderer( activityMiddleware ),
        attachmentRenderer: this.createAttachmentRenderer( attachmentMiddleware )
      } ) );
    }
  }

  createActivityRenderer( additionalMiddleware ) {
    const activityMiddleware = concatMiddleware(
      additionalMiddleware,
      createCoreActivityMiddleware()
    )( {} );

    return ( ...args ) => {
      try {
        return activityMiddleware(
          ( { activity } ) => () => console.log( activity )
        )( ...args );
      } catch ( err ) {
        return () => (
          <ErrorBox message="Failed to render activity">
            <pre>{JSON.stringify( err, null, 2 )}</pre>
          </ErrorBox>
        );
      }
    };
  }

  createAttachmentRenderer( additionalMiddleware ) {
    const attachmentMiddleware = concatMiddleware(
      additionalMiddleware,
      createCoreAttachmentMiddleware()
    )( {} );

    return ( ...args ) => {
      try {
        return attachmentMiddleware(
          ( { attachment } ) =>
            <ErrorBox message="No renderer for this attachment">
              <pre>{JSON.stringify( attachment, null, 2 )}</pre>
            </ErrorBox>
        )( ...args );
      } catch ( err ) {
        return (
          <ErrorBox message="Failed to render attachment">
            <pre>{JSON.stringify( err, null, 2 )}</pre>
          </ErrorBox>
        );
      }
    }
  }

  render() {
    const { props, state } = this;

    // TODO: [P2] Implement "scrollToBottom" feature

    return (
      <Composer
        activityRenderer={state.activityRenderer}
        attachmentRenderer={state.attachmentRenderer}
        sendBoxRef={this.sendBoxRef}
        {...props}
      >
        {( { styleSet } ) =>
          <TypeFocusSinkBox
            className={classNames( ROOT_CSS + '', styleSet.root + '', ( props.className || '' ) + '' )}
            role="complementary"
            sendFocusRef={this.sendBoxRef}
          >
            <BasicTranscript className={TRANSCRIPT_CSS + ''} />
            {!styleSet.options.hideSendBox &&
              <BasicSendBox className={SEND_BOX_CSS} />
            }
          </TypeFocusSinkBox>
        }
      </Composer>
    );
  }
}
