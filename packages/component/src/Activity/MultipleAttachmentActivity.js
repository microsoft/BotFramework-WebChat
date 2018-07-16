import BasicFilm from 'react-film';
import React from 'react';

import { withActivity } from './Context';
import { withStyleSet } from '../Context';
import Avatar from './Avatar';
import Bubble from './Bubble';
import TimeAgo from './TimeAgo';

export default withStyleSet(withActivity(({ attachments, children, styleSet }) =>
  <BasicFilm
    showDots={ false }
    showScrollBar={ false }
  >
    <Avatar />
    {
      attachments.map((attachment, index) =>
        <div key={ attachment.id } className={ styleSet.multipleAttachmentActivity + '' }>
          <Bubble>
            { !!children && children(attachment) }
          </Bubble>
          { index === 0 && <TimeAgo /> }
        </div>
      )
    }
  </BasicFilm>
))
