import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Context from '../Context';
import Timestamp from './Timestamp';

import textFormatToContentType from '../Utils/textFormatToContentType';

// TODO: Put this into StyleSet
const ROOT_CSS = css({
  display: 'flex',

  '& > .avatar': {
    flexShrink: 0
  },

  '& > .content': {
    flexGrow: 1,
    overflow: 'hidden',

    '& > *:not(:first-child):not(:last-child)': {
      marginTop: 10
    },

    '& > .row': {
      display: 'flex',

      '& > .bubble, & > .timestamp': {
        flexGrow: 1,
        maxWidth: 480,
        overflow: 'hidden'
      },

      '&.attachment > .bubble': {
        minWidth: 250
      },

      '& > .filler': {
        flexGrow: 10000,
        flexShrink: 1
      }
    }
  },

  '& > .filler': {
    flexBasis: 10,
    flexShrink: 0
  },

  '&.from-user': {
    flexDirection: 'row-reverse',

    '& > .content > .row': {
      flexDirection: 'row-reverse'
    }
  }
});

// TODO: Only show timestamp if it is 5 minutes after last activity
export default ({ activity, children, fromUser }) =>
  <Context>
    { () =>
      <div className={ classNames(
        ROOT_CSS + '',
        { 'from-user': fromUser }
      ) }>
        <Avatar className="avatar" />
        <div className="content">
          {
            activity.type === 'typing' ?
              <div className="row typing">
                { children({
                  activity,
                  attachment: { contentType: 'typing' }
                }) }
                <div className="filler" />
              </div>
            : !!activity.text &&
              <div className="row message">
                <Bubble className="bubble">
                  { children({
                    activity,
                    attachment: {
                      contentType: textFormatToContentType(activity.textFormat),
                      content: activity.text
                    }
                  }) }
                </Bubble>
                <div className="filler" />
              </div>
          }
          {
            (activity.attachments || []).map((attachment, index) =>
              <div className="row attachment" key={ index }>
                <Bubble className="attachment bubble" debug={ attachment } key={ index }>
                  { children({ activity, attachment }) }
                </Bubble>
              </div>
            )
          }
          <div className="row">
            <Timestamp activity={ activity } className="timestamp" />
            <div className="filler" />
          </div>
        </div>
        <div className="filler" />
      </div>
    }
  </Context>
