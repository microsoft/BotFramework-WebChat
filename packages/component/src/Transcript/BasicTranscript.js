import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Activity from './Activity';
import Code from './Renderer/Code';
import Composer from './Composer';
import Context from './Context';
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

export default props =>
  <Composer>
    <Context.Consumer>
      { consumer =>
        <div className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
          <div className="filler" />
          <ul>
            {
              consumer.activities.map(({ cards: [card], id, timestamp }) =>
                <Activity
                  attachment={ card.attachment }
                  key={ id }
                  timestamp={ timestamp }
                >
                  {
                    card.type === 'message' ?
                      card.subType === 'code' ?
                        <Code>{ card.text }</Code>
                      :
                        <Text value={ card.text } />
                    :
                      <span>Unknown activity</span>
                  }
                </Activity>
              )
            }
          </ul>
        </div>
      }
    </Context.Consumer>
  </Composer>
