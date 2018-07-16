import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import { withStyleSet } from '../Context';
import ActivityComposer from './Activity/Composer';
import BasicMultipleCardActivity from './Activity/BasicMultipleCardActivity';
import BasicSingleCardActivity from './Activity/BasicSingleCardActivity';
import MainContext from '../Context';
import UnknownCard from '../Renderer/UnknownCard';

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

export default withStyleSet(({ className, children, styleSet }) =>
  <ScrollToBottom
    className={ className }
    scrollViewClassName={ ROOT_CSS + '' }
  >
    <div className={ FILLER_CSS } />
    <MainContext.Consumer>
      { ({ activities }) =>
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
                        { card => children && children(card) || <UnknownCard card={ card } /> }
                      </BasicSingleCardActivity>
                    :
                      <BasicMultipleCardActivity>
                        { card => children && children(card) || <UnknownCard card={ card } /> }
                      </BasicMultipleCardActivity>
                  }
                </ActivityComposer>
              </li>
            )
          }
        </ul>
      }
    </MainContext.Consumer>
  </ScrollToBottom>
)
