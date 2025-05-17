import React, { memo } from 'react';
import classNames from 'classnames';

import useStyleSet from '../../hooks/useStyleSet';
import useActions from '../providers/useActions';
import FeedbackVoteButton from './FeedbackVoteButton';

function FeedbackVoteButtonBar() {
  const [{ feedbackForm }] = useStyleSet();
  const [actions] = useActions();

  return (
    <div className={classNames('webchat__feedback-vote-button-bar', feedbackForm + '')}>
      {actions.map((action, index) => (
        <FeedbackVoteButton action={action} key={action['@id'] || index} />
      ))}
    </div>
  );
}

export default memo(FeedbackVoteButtonBar);
