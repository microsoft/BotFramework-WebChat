import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicSendBox from './SendBox/BasicSendBox';
import BasicTranscript from './Transcript/BasicTranscript';
import Composer from './Composer';
import { Box as FocusSinkBox } from './Utils/FocusSink';

import Code from './Renderer/Code';
import Text from './Renderer/Text';

const ROOT_CSS = css({
  backgroundColor: '#EEE',
  display: 'flex',
  flexDirection: 'column'
});

const TRANSCRIPT_CSS = css({
  flex: 1,
  overflowY: 'auto'
});

const SEND_BOX_CSS = css({
  flexShrink: 0
});

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.rootRef = React.createRef();
  }

  render() {
    const { props } = this;

    return (
      <Composer>
        <FocusSinkBox
          className={ classNames(ROOT_CSS + '', (props.className || '') + '') }
        >
          <BasicTranscript className={ TRANSCRIPT_CSS }>
            { card =>
              card.type === 'message' ?
                card.subType === 'code' ?
                  <Code>{ card.text }</Code>
                :
                  <Text value={ card.text } />
              : false
            }
          </BasicTranscript>
          <BasicSendBox
            className={ SEND_BOX_CSS }
          />
        </FocusSinkBox>
      </Composer>
    );
  }
}
