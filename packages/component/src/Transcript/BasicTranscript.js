import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Activity from './Activity';
import Code from './Renderer/Code';
import Composer from './Composer';
import Text from './Renderer/Text';

const ROOT_CSS = css({
  listStyleType: 'none',
  margin: 0,
  padding: 0
});

export default class Transcript extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activities: [{
        id: 0,
        type: 'message',
        text: 'This is a direct message.'
      }, {
        id: 1,
        type: 'message',
        subType: 'code',
        text: `function fancyAlert(arg) {\n  if (arg) {\n    $.facebox('div.#foo');\n  }\n}`
      }]
    };
  }

  render() {
    const { props } = this;

    return (
      <Composer>
        <ul className={ classNames(ROOT_CSS + '', props.className + '') }>
          {
            this.state.activities.map(activity =>
              <Activity key={ activity.id }>
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
      </Composer>
    );
  }
}
