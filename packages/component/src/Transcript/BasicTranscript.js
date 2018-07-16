import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import { withStyleSet } from '../Context';
import BasicActivity from '../Activity/BasicActivity';
import MainContext from '../Context';
import UnknownCard from '../Attachment/UnknownCard';

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
                <BasicActivity activity={ activity }>
                  { card => children && children(card) || <UnknownCard card={ card } /> }
                </BasicActivity>
              </li>
            )
          }
        </ul>
      }
    </MainContext.Consumer>
  </ScrollToBottom>
)
