import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import ActivityComposer from './Activity/Composer';
import BasicActivity from './Activity/BasicActivity';
import Composer from './Composer';
import MainContext from '../Context';
import TranscriptContext from './Context';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column',

  '& > .filler': {
    flex: 1
  },

  '& > ul': {
    listStyleType: 'none'
  }
});

const ATTACHMENT_IMAGE_CSS = css({
  width: '100%'
});

export default props =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <Composer>
        <TranscriptContext.Consumer>
          { ({ activities }) =>
            <div className={ classNames(ROOT_CSS + '', styleSet.activities + '', (props.className || '') + '') }>
              <div className="filler" />
              <ul>
                {
                  activities.map(activity =>
                    <ActivityComposer
                      activity={ activity }
                      key={ activity.id }
                    >
                      <BasicActivity>
                        { props.children }
                      </BasicActivity>
                    </ActivityComposer>
                  )
                }
              </ul>
            </div>
          }
        </TranscriptContext.Consumer>
      </Composer>
    }
  </MainContext.Consumer>
