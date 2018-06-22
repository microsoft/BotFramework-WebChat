import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import { withActivities } from './Context';
import { withStyleSet } from '../Context';
import ActivityComposer from './Activity/Composer';
import BasicCard from './Activity/Card/BasicCard';
import BasicMultipleCardActivity from './Activity/BasicMultipleCardActivity';
import BasicSingleCardActivity from './Activity/BasicSingleCardActivity';
import Composer from './Composer';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

const FILLER_CSS = css({
  flex: 1
});

const LIST_CSS = css({
  listStyleType: 'none'
});

const BasicTranscript = withStyleSet(withActivities(({ activities, className, children, styleSet }) =>
  <ScrollToBottom className={ classNames(ROOT_CSS + '', (className || '') + '') }>
    <div className={ FILLER_CSS } />
    <ul className={ classNames(LIST_CSS + '', styleSet.activities + '') }>
      {
        activities.map(activity =>
          <li
            className={ styleSet.activity }
            key={ activity.id }
          >
            <ActivityComposer activity={ activity }>
              {
                // Currently, we do not support multiple card originated from the user
                activity.cards.length === 1 || activity.from === 'user' ?
                  <BasicSingleCardActivity>
                    { card =>
                      <BasicCard card={ card }>
                        { children }
                      </BasicCard>
                    }
                  </BasicSingleCardActivity>
                :
                  <BasicMultipleCardActivity>
                    { card =>
                      <BasicCard card={ card }>
                        { children }
                      </BasicCard>
                    }
                  </BasicMultipleCardActivity>
              }
            </ActivityComposer>
          </li>
        )
      }
    </ul>
  </ScrollToBottom>
))

export default props =>
  <Composer>
    <BasicTranscript { ...props }>
      { props.children }
    </BasicTranscript>
  </Composer>
