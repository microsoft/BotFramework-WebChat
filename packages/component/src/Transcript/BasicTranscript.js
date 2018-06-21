import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Activity from './Activity';
import Code from './Renderer/Code';
import Composer from './Composer';
import Text from './Renderer/Text';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column',

  '& > .filler': {
    flex: 1
  },

  '& > ul': {
    listStyleType: 'none',
    margin: 0,
    padding: 0
  }
});

const ATTACHMENT_IMAGE_CSS = css({
  width: '100%'
});

export default class Transcript extends React.Component {
  constructor(props) {
    super(props);

    const now = new Date();
    const timestamp = new Date(now.getTime() - 59000);

    this.state = {
      activities: [{
        id: 0,
        text: 'This is a direct message.',
        timestamp,
        type: 'message'
      }, {
        id: 1,
        subType: 'code',
        text: `function fancyAlert(arg) {\n  if (arg) {\n    $.facebox('div.#foo');\n  }\n}`,
        timestamp,
        type: 'message'
      }, {
        attachment: 'assets/surface4.jpg',
        id: 2,
        text: 'This is a cat.',
        timestamp,
        type: 'message'
      }]
    };
  }

  render() {
    const { props } = this;

    return (
      <Composer>
        <div className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
          <div className="filler" />
          <ul>
            {
              this.state.activities.map(activity =>
                <Activity
                  attachment={ activity.attachment }
                  key={ activity.id }
                  timestamp={ activity.timestamp }
                >
                  {
                    activity.type === 'message' ?
                      activity.subType === 'code' ?
                        <Code>{ activity.text }</Code>
                      :
                        <Text value={ activity.text } />
                    :
                      <span>Unknown activity</span>
                  }
                </Activity>
              )
            }
          </ul>
        </div>
      </Composer>
    );
  }
}
