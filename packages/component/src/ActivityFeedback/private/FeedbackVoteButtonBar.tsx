import React, { Fragment, memo, type ReactNode } from 'react';

import useActions from '../providers/useActions';
import FeedbackVoteButton from './FeedbackVoteButton';

type FeedbackVoteButtonBarProps = Readonly<{
  children?: ReactNode | undefined;
}>;

function FeedbackVoteButtonBar() {
  const [actions] = useActions();

  return (
    <Fragment>
      {actions.map((action, index) => (
        <FeedbackVoteButton action={action} key={action['@id'] || index} />
      ))}
    </Fragment>
  );
}

FeedbackVoteButtonBar.displayName = 'FeedbackVoteButtonBar';

export default memo(FeedbackVoteButtonBar);
export { type FeedbackVoteButtonBarProps };
