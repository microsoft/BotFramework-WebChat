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
            activities.map((activity, index) =>
              <li
                className={ styleSet.activity }
                key={ index }
              >
                <BasicActivity activity={ activity }>
                  {
                    card => {
                      try {
                        return children && children(card) || <UnknownCard message="No renderer for this card">{ JSON.stringify(card, null, 2) }</UnknownCard>;
                      } catch (err) {
                        return <UnknownCard message="Failed to render card">{ JSON.stringify(card, null, 2) }</UnknownCard>
                      }
                    }
                  }
                </BasicActivity>
              </li>
            )
          }
        </ul>
      }
    </MainContext.Consumer>
  </ScrollToBottom>
)
